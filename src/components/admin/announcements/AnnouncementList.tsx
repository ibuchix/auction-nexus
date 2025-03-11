
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, Edit, Trash2, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import type { Announcement } from "./AnnouncementForm";

type AnnouncementListProps = {
  onEdit: (announcement: Announcement) => void;
}

export function AnnouncementList({ onEdit }: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAnnouncements(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching announcements",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    setToggleLoading(id);
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentState })
        .eq('id', id);
      
      if (error) throw error;
      
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === id 
            ? { ...announcement, is_active: !currentState } 
            : announcement
        )
      );

      toast({
        title: `Announcement ${!currentState ? 'Activated' : 'Deactivated'}`,
        description: `The announcement has been ${!currentState ? 'activated' : 'deactivated'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating announcement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setToggleLoading(null);
    }
  };

  const deleteAnnouncement = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      setAnnouncements(prev => 
        prev.filter(announcement => announcement.id !== deleteId)
      );

      toast({
        title: "Announcement Deleted",
        description: "The announcement has been permanently deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting announcement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'feature': return 'bg-green-100 text-green-800';
      case 'promotion': return 'bg-purple-100 text-purple-800';
      case 'policy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
              No announcements have been created yet.
            </CardContent>
          </Card>
        ) : (
          announcements.map(announcement => (
            <Card key={announcement.id} className={!announcement.is_active ? "opacity-70" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{announcement.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge className={getTypeColor(announcement.type)}>
                      {announcement.type}
                    </Badge>
                    {!announcement.is_active && (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line mb-4">{announcement.content}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    <span>Target: {announcement.target}</span>
                  </div>
                  {announcement.published_at && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>Publish: {format(new Date(announcement.published_at), "PPP")}</span>
                    </div>
                  )}
                  {announcement.expires_at && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>Expires: {format(new Date(announcement.expires_at), "PPP")}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleActive(announcement.id!, announcement.is_active)}
                  disabled={toggleLoading === announcement.id}
                >
                  {toggleLoading === announcement.id ? (
                    "Processing..."
                  ) : announcement.is_active ? (
                    <>
                      <EyeOff className="mr-1 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="mr-1 h-4 w-4" />
                      Activate
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(announcement)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDeleteId(announcement.id!)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the announcement. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAnnouncement}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
