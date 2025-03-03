import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useEffect } from "react";
import { logout } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

// For direct navigation to /logout
export const loader: LoaderFunction = async ({ request }) => {
  // Instead of immediately redirecting, render the page first
  // This allows the "Logging you out" message to be shown
  return {};
};

export default function LogoutPage() {
  // Auto-trigger logout after a brief delay to show the message
  useEffect(() => {
    // Trigger logout after showing the message for a moment
    const timer = setTimeout(() => {
      const form = document.getElementById("logout-form") as HTMLFormElement;
      if (form) form.submit();
    }, 1500); // 1.5 second delay so user can see the message

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Logging you out...
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Please wait while we securely log you out of your account.
        </p>

        {/* Hidden form that gets auto-submitted */}
        <Form method="post" id="logout-form" className="hidden">
          <button type="submit">Logout</button>
        </Form>

        {/* Visual indicator */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
}
