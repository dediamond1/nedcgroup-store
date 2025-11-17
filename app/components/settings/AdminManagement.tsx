
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AdminForm } from "./AdminForm";
import { ConfirmationModal } from "~/components/ui/ConfirmationModal";
import { toast } from "react-hot-toast";
import { baseUrl } from "~/constants/api";
import { useNavigate } from "@remix-run/react";

interface Admin {
  _id: string;
  name: string;
  email: string;
  companyName: string;
  role: string;
}

interface AdminManagementProps {
  admins: Admin[];
  currentUser: Admin;
  token: string;
  onRefetch: () => void;
}

export function AdminManagement({
  admins,
  currentUser,
  token,
  onRefetch,
}: AdminManagementProps) {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setShowAddForm(true);
  };

  const handleDelete = (admin: Admin) => {
    setDeletingAdmin(admin);
  };

  const confirmDelete = async () => {
    if (!deletingAdmin) return;

    try {
      const response = await fetch(`${baseUrl}/admin/${deletingAdmin._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(`Admin ${deletingAdmin.name} deleted successfully`);
        onRefetch(); // Trigger refetch after successful deletion
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete admin");
      }
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast.error(`Failed to delete admin: ${error.message}`);
    } finally {
      setDeletingAdmin(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Admins</CardTitle>
        <CardDescription>Add, edit, or remove admin accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Button onClick={() => setShowAddForm(true)} className="mb-4">
              Add New Admin
            </Button>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.companyName}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(admin)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      {admin._id !== currentUser._id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(admin)}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {(showAddForm || editingAdmin) && (
            <div className="w-1/3">
              <AdminForm
                admin={editingAdmin}
                onClose={() => {
                  setShowAddForm(false);
                  setEditingAdmin(null);
                }}
                token={token}
                onSuccess={() => {
                  onRefetch(); // Trigger refetch after successful creation/update
                  setShowAddForm(false);
                  setEditingAdmin(null);
                }}
              />
            </div>
          )}
        </div>
        <ConfirmationModal
          isOpen={!!deletingAdmin}
          onClose={() => setDeletingAdmin(null)}
          onConfirm={confirmDelete}
          title="Delete Admin"
          message={`Are you sure you want to delete the admin account for ${deletingAdmin?.name}?`}
        />
      </CardContent>
    </Card>
  );
}
