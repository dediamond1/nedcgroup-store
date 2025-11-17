
import { useState } from "react";
import { Form } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { baseUrl } from "~/constants/api";
import { toast } from "react-hot-toast";

interface Admin {
  _id: string;
  name: string;
  email: string;
  companyName: string;
  role: string;
}

interface AdminFormProps {
  admin: Admin | null;
  onClose: () => void;
  token: string;
  onSuccess: () => void;
}

export function AdminForm({
  admin,
  onClose,
  token,
  onSuccess,
}: AdminFormProps) {
  const [name, setName] = useState(admin?.name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [companyName, setCompanyName] = useState(admin?.companyName || "");
  const [role, setRole] = useState(admin?.role || "");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = admin ? "PUT" : "POST";
    const url = admin
      ? `${baseUrl}/admin/${admin._id}`
      : `${baseUrl}/admin/register`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          companyName,
          role,
          isAdmin: true,
          password: password || undefined,
        }),
      });

      if (response.ok) {
        toast.success(`Admin ${admin ? "updated" : "created"} successfully`);
        onSuccess(); // Trigger refetch after successful creation/update
        onClose();
      } else {
        const error = await response.json();
        throw new Error(
          error.message || `Failed to ${admin ? "update" : "create"} admin`
        );
      }
    } catch (error: any) {
      console.error(`Error ${admin ? "updating" : "creating"} admin:`, error);
      toast.error(
        `Failed to ${admin ? "update" : "create"} admin: ${error.message}`
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{admin ? "Edit Admin" : "Add New Admin"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">
              Password {admin ? "(leave blank to keep current)" : ""}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{admin ? "Update" : "Add"} Admin</Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
