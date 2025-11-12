import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "./UserTable";
import { UserRolesTable } from "./UserRolesTable";
import { SuspendedUsersTable } from "./SuspendedUsersTable";

export function UserManagementTabs() {
  return (
    <Tabs defaultValue="all-users" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all-users">All Users</TabsTrigger>
        <TabsTrigger value="roles">User Roles</TabsTrigger>
        <TabsTrigger value="suspended">Suspended</TabsTrigger>
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
    </Tabs>
  );
}
