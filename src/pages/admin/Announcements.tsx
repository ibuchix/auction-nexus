import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Plus } from "lucide-react";
import { AnnouncementForm, type Announcement } from "@/components/admin/announcements/AnnouncementForm";
import { AnnouncementList } from "@/components/admin/announcements/AnnouncementList";

const Announcements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("manage");

  const handleEdit = (announcement: Announcement) => {
    setEditAnnouncement(announcement);
    setShowCreateDialog(true);
  };

  const handleFormSuccess = () => {
    setShowCreateDialog(false);
    setEditAnnouncement(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <Tabs defaultValue="manage" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Manage Announcements</TabsTrigger>
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="mt-6">
          <AnnouncementList onEdit={handleEdit} />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Megaphone className="h-8 w-8 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure how announcements are delivered to users. This section will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editAnnouncement ? "Edit Announcement" : "Create New Announcement"}
            </DialogTitle>
          </DialogHeader>
          <AnnouncementForm 
            announcement={editAnnouncement}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Announcements;
