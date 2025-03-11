import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Announcement = {
  id?: string;
  title: string;
  content: string;
  type: "system" | "maintenance" | "feature" | "promotion" | "policy";
  target: "all" | "dealers" | "sellers" | "admins";
  is_active: boolean;
  created_at?: string;
  created_by: string;
  expires_at?: string | null;
  published_at?: string | null;
}

type AnnouncementFormProps = {
  announcement?: Announcement;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AnnouncementForm({ announcement, onSuccess, onCancel }: AnnouncementFormProps) {
  const { toast } = useToast();
  const isEditing = !!announcement?.id;
  
  const adminId = "00000000-0000-0000-0000-000000000000";
  
  const [formData, setFormData] = useState<Announcement>(
    announcement || {
      title: "",
      content: "",
      type: "system",
      target: "all",
      is_active: true,
      created_by: adminId,
      expires_at: null,
      published_at: null
    }
  );
  
  const [loading, setLoading] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    formData.expires_at ? new Date(formData.expires_at) : undefined
  );
  const [publishDate, setPublishDate] = useState<Date | undefined>(
    formData.published_at ? new Date(formData.published_at) : undefined
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedData = {
        ...formData,
        expires_at: expiryDate?.toISOString() || null,
        published_at: publishDate?.toISOString() || null,
        created_by: adminId
      };
      
      let response;
      
      if (isEditing) {
        response = await supabase
          .from('announcements')
          .update(updatedData)
          .eq('id', announcement.id);
      } else {
        response = await supabase
          .from('announcements')
          .insert(updatedData);
      }
      
      if (response.error) {
        throw response.error;
      }
      
      toast({
        title: isEditing ? "Announcement Updated" : "Announcement Created",
        description: `Successfully ${isEditing ? 'updated' : 'created'} announcement.`,
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Announcement title"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea 
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Announcement content"
            rows={5}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="feature">New Feature</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="policy">Policy Update</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="target">Target Audience</Label>
            <Select
              value={formData.target}
              onValueChange={(value) => handleSelectChange("target", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="dealers">Dealers Only</SelectItem>
                <SelectItem value="sellers">Sellers Only</SelectItem>
                <SelectItem value="admins">Admins Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Publish Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !publishDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {publishDate ? format(publishDate, "PPP") : "Schedule publish date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={publishDate}
                  onSelect={setPublishDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>Expiry Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP") : "Set expiry date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
