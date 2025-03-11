
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserCog, ShoppingCart, Loader2 } from "lucide-react";

type RoleCount = {
  role: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  description: string;
};

export function UserRolesTable() {
  const { data: roleCounts, isLoading } = useQuery({
    queryKey: ['userRoleCounts'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('role')
        
      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }

      // Calculate role counts
      const counts: {[key: string]: number} = {};
      profiles?.forEach(profile => {
        counts[profile.role] = (counts[profile.role] || 0) + 1;
      });

      const total = profiles?.length || 0;
      
      const roleData: RoleCount[] = [
        {
          role: 'admin',
          count: counts['admin'] || 0,
          percentage: total ? Math.round((counts['admin'] || 0) / total * 100) : 0,
          icon: <Shield className="h-5 w-5 text-primary" />,
          description: 'System administrators with full access to all features'
        },
        {
          role: 'dealer',
          count: counts['dealer'] || 0,
          percentage: total ? Math.round((counts['dealer'] || 0) / total * 100) : 0,
          icon: <UserCog className="h-5 w-5 text-blue-500" />,
          description: 'Vehicle dealers who can bid on auctions'
        },
        {
          role: 'seller',
          count: counts['seller'] || 0,
          percentage: total ? Math.round((counts['seller'] || 0) / total * 100) : 0,
          icon: <ShoppingCart className="h-5 w-5 text-green-500" />,
          description: 'Users who can list vehicles for sale'
        }
      ];

      return roleData;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roleCounts?.map((role) => (
          <Card key={role.role}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{role.role}s</CardTitle>
              {role.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{role.count}</div>
              <p className="text-xs text-muted-foreground">{role.percentage}% of users</p>
              <p className="text-xs text-muted-foreground mt-2">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="capitalize">Admin</span>
                </div>
              </TableCell>
              <TableCell>
                Full system access, user management, auction management, approval authority
              </TableCell>
              <TableCell>{roleCounts?.find(r => r.role === 'admin')?.count || 0}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Permissions
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-blue-500" />
                  <span className="capitalize">Dealer</span>
                </div>
              </TableCell>
              <TableCell>
                Bid on auctions, view vehicle details, manage purchased vehicles
              </TableCell>
              <TableCell>{roleCounts?.find(r => r.role === 'dealer')?.count || 0}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Permissions
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-green-500" />
                  <span className="capitalize">Seller</span>
                </div>
              </TableCell>
              <TableCell>
                List vehicles for sale, manage listings, view auction results
              </TableCell>
              <TableCell>{roleCounts?.find(r => r.role === 'seller')?.count || 0}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Permissions
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
