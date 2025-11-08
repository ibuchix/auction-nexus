
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "./UserTable";
import { UserRolesTable } from "./UserRolesTable";
import { UserActivityLog } from "./UserActivityLog";
import { SuspendedUsersTable } from "./SuspendedUsersTable";
import { FormTracking } from "./FormTracking";

export function UserManagementTabs() {
  return (
    <Tabs defaultValue="all-users" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all-users">All Users</TabsTrigger>
        <TabsTrigger value="roles">User Roles</TabsTrigger>
        <TabsTrigger value="suspended">Suspended</TabsTrigger>
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
        <TabsTrigger value="form-tracking">Form Tracking</TabsTrigger>
      </TabsList>
      <TabsContent value="all-users" className="mt-6">
        <UserTable />
      </TabsContent>
      <TabsContent value="roles" className="mt-6">
        <UserRolesTable />
      </TabsContent>
      <TabsContent value="suspended" className="mt-6">
        <SuspendedUsersTable />
      </TabsContent>
      <TabsContent value="activity" className="mt-6">
        <UserActivityLog />
      </TabsContent>
      <TabsContent value="form-tracking" className="mt-6">
        <FormTracking />
      </TabsContent>
    </Tabs>
  );
}
