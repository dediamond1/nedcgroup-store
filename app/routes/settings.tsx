import { useState, useEffect } from "react";
import { useLoaderData, useActionData, useNavigate } from "@remix-run/react";
import {
  json,
  redirect,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast, Toaster } from "react-hot-toast";
import { requireUserToken, getUser } from "~/utils/auth.server";
import { baseUrl } from "~/constants/api";
import { ProfileSettings } from "~/components/settings/ProfileSettings";
import { PasswordChange } from "~/components/settings/PasswordChange";
import { AdminManagement } from "~/components/settings/AdminManagement";

export const loader: LoaderFunction = async ({ request }) => {
  const token = await requireUserToken(request);
  const user = await getUser(request);

  if (!user) {
    return redirect("/");
  }

  const adminsResponse = await fetch(`${baseUrl}/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!adminsResponse.ok) {
    throw new Error("Failed to fetch admin list");
  }

  const admins = await adminsResponse.json();

  return json({ user, admins: admins.admins, token });
};

export const action: ActionFunction = async ({ request }) => {
  const token = await requireUserToken(request);
  const formData = await request.formData();
  const action = formData.get("_action");

  switch (action) {
    case "updateProfile":
      // Handle profile update
      break;
    case "changePassword":
      // Handle password change
      break;
    case "addAdmin":
      // Handle adding new admin
      break;
    case "updateAdmin":
      // Handle updating admin
      break;
    case "deleteAdmin":
      // Handle deleting admin
      break;
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }

  // Implement the actual action logic here
  // For now, we'll just return a success message
  return json({ success: true, message: "Action completed successfully" });
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, admins: initialAdmins, token } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab] = useState("profile");
  const [admins, setAdmins] = useState(initialAdmins);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const handleRefetch = async () => {
    try {
      const response = await fetch(`${baseUrl}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
      } else {
        throw new Error("Failed to fetch admin list");
      }
    } catch (error) {
      console.error("Error fetching admin list:", error);
      toast.error("Failed to refresh admin list");
    }
  };

  return (
    <div className="md:container mx-auto py-10">
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="admins">Manage Admins</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileSettings
              user={user}
              token={token}
              onSuccess={handleRefetch}
            />
          </TabsContent>
          <TabsContent value="password">
            <PasswordChange token={token} />
          </TabsContent>
          <TabsContent value="admins">
            <AdminManagement
              admins={admins}
              currentUser={user}
              token={token}
              onRefetch={handleRefetch}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
