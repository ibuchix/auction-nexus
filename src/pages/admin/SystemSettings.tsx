import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const SystemSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Audit log settings
  const [auditSettings, setAuditSettings] = useState({
    enableLoginAuditing: true,
    enableDataAuditing: true,
    retentionPeriodDays: 90,
    enableIPLogging: true,
    enableUserAgentLogging: true
  });

  const handleAuditSettingChange = (
    key: keyof typeof auditSettings,
    value: boolean | number
  ) => {
    setAuditSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // This is where you would normally save the settings to the database
      // For now, we'll just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Log the action
      await supabase.rpc("log_admin_action", {
        p_admin_id: (await supabase.auth.getUser()).data.user?.id,
        p_action: "update",
        p_entity_type: "system_settings",
        p_entity_id: "00000000-0000-0000-0000-000000000000",
        p_details: {
          audit_settings: auditSettings
        }
      });
      
      toast({
        title: "Settings Saved",
        description: "Your system settings have been updated successfully."
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Audit Logging Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Audit Logging</h2>
          <p className="text-gray-500 mb-6">
            Configure how the system tracks and stores user actions and changes.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableLoginAuditing" className="font-medium">
                  Enable Login Auditing
                </Label>
                <p className="text-sm text-gray-500">
                  Record when users log in and out of the system
                </p>
              </div>
              <Switch
                id="enableLoginAuditing"
                checked={auditSettings.enableLoginAuditing}
                onCheckedChange={(checked) =>
                  handleAuditSettingChange("enableLoginAuditing", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableDataAuditing" className="font-medium">
                  Enable Data Auditing
                </Label>
                <p className="text-sm text-gray-500">
                  Record when data is created, updated, or deleted
                </p>
              </div>
              <Switch
                id="enableDataAuditing"
                checked={auditSettings.enableDataAuditing}
                onCheckedChange={(checked) =>
                  handleAuditSettingChange("enableDataAuditing", checked)
                }
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="retentionPeriod" className="font-medium">
                Data Retention Period (Days)
              </Label>
              <p className="text-sm text-gray-500 mb-2">
                How long audit logs should be kept before automatic deletion
              </p>
              <div className="flex items-center gap-4">
                <Input
                  id="retentionPeriod"
                  type="number"
                  min={1}
                  max={3650}
                  value={auditSettings.retentionPeriodDays}
                  onChange={(e) =>
                    handleAuditSettingChange(
                      "retentionPeriodDays",
                      parseInt(e.target.value) || 90
                    )
                  }
                  className="max-w-[120px]"
                />
                <span className="text-sm text-gray-500">days</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableIPLogging" className="font-medium">
                  Log IP Addresses
                </Label>
                <p className="text-sm text-gray-500">
                  Record IP addresses for audit events
                </p>
              </div>
              <Switch
                id="enableIPLogging"
                checked={auditSettings.enableIPLogging}
                onCheckedChange={(checked) =>
                  handleAuditSettingChange("enableIPLogging", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableUserAgentLogging" className="font-medium">
                  Log User Agents
                </Label>
                <p className="text-sm text-gray-500">
                  Record browser and device information
                </p>
              </div>
              <Switch
                id="enableUserAgentLogging"
                checked={auditSettings.enableUserAgentLogging}
                onCheckedChange={(checked) =>
                  handleAuditSettingChange("enableUserAgentLogging", checked)
                }
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Privacy Consideration
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    IP address and user agent logging may be subject to privacy 
                    regulations such as GDPR. Ensure you have appropriate privacy 
                    policies in place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettings;
