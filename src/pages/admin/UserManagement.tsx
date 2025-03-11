
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserManagementTabs } from "@/components/admin/users/UserManagementTabs";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserRolesTable } from "@/components/admin/users/UserRolesTable";
import { UserActivityLog } from "@/components/admin/users/UserActivityLog";
import { SuspendedUsersTable } from "@/components/admin/users/SuspendedUsersTable";
import { Loader2 } from "lucide-react";

const UserManagement = () => {
  const { data: usersStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const [totalUsers, adminsCount, dealersCount, sellersCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'dealer'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller')
      ]);

      return {
        total: totalUsers.count || 0,
        admins: adminsCount.count || 0,
        dealers: dealersCount.count || 0,
        sellers: sellersCount.count || 0
      };
    },
    refetchInterval: 300000 // Refetch every 5 minutes
  });

  if (isStatsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersStats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersStats?.admins || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dealers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersStats?.dealers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sellers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersStats?.sellers || 0}</div>
            </CardContent>
          </Card>
        </div>

        <UserManagementTabs />
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
