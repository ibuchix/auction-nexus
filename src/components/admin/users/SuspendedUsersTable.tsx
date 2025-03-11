
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Ban, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Mock data for suspended users
const mockSuspendedUsers = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    full_name: "John Smith",
    email: "john.smith@example.com",
    suspended_at: "2023-09-15T14:23:00Z",
    suspended_reason: "Multiple policy violations",
    suspended_by: "Admin User"
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    full_name: "Jane Doe",
    email: "jane.doe@example.com",
    suspended_at: "2023-10-01T09:45:00Z",
    suspended_reason: "Suspicious activity detected",
    suspended_by: "System"
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174002",
    full_name: "Alice Johnson",
    email: "alice.johnson@example.com",
    suspended_at: "2023-10-12T11:30:00Z",
    suspended_reason: "Reported by multiple users",
    suspended_by: "Admin User"
  }
];

export function SuspendedUsersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isReinstateDialogOpen, setIsReinstateDialogOpen] = useState(false);

  const filteredUsers = mockSuspendedUsers.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReinstateUser = () => {
    if (!selectedUser) return;
    
    // In a real app, this would call an API to reinstate the user
    toast.success(`User ${selectedUser.full_name} has been reinstated`);
    setIsReinstateDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suspended users..."
            className="pl-8 w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Suspended On</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Suspended By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {format(new Date(user.suspended_at), "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell>{user.suspended_reason}</TableCell>
                <TableCell>{user.suspended_by}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsReinstateDialogOpen(true);
                    }}
                    className="h-8 px-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                    Reinstate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No suspended users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reinstate User Dialog */}
      <Dialog open={isReinstateDialogOpen} onOpenChange={setIsReinstateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reinstate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to reinstate {selectedUser?.full_name}? This will restore their access to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Suspension Reason:</p>
              <p className="text-sm">{selectedUser?.suspended_reason}</p>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium">Suspended On:</p>
              <p className="text-sm">
                {selectedUser?.suspended_at ? format(new Date(selectedUser.suspended_at), "PPP p") : ""}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReinstateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReinstateUser}>
              Reinstate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
