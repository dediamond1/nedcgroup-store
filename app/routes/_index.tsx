import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { loginUser } from "../utils/auth.server";
import { commitSession, getSession } from "~/utils/sessions.server";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(3, "Password must be at least 3 characters").required("Password is required")
});

export const loader: LoaderFunction = async ({request}) => {
  const session = await getSession(request.headers.get("Cookie"))
  const token = session.get('token')
  if (token) {
    return redirect('/lager')
  }
  return null
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const token = await loginUser(email, password);
    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", token);
    return redirect("/lager", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: (values) => {
      submit(values, { method: "post" });
    }
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 to-gray-700">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-center text-3xl font-extrabold text-blue-900 mb-6">Nedcgroup</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Please sign in to continue</p>

        {actionData?.error && (
          <div className="text-red-500 text-sm mb-4 text-center">{actionData.error}</div>
        )}

        <Form method="post" onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`mt-1 px-4 py-3 border rounded-lg w-full bg-white text-black transition-colors ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="you@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`mt-1 px-4 py-3 border rounded-lg w-full bg-white text-black transition-colors ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="••••••••"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={navigation.state === "submitting"}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
            >
              {navigation.state === "submitting" ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}