"use client";

import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { login, createUserSession, isUserLoggedIn } from "~/utils/auth.server";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Login | Nedcgroup" },
    { name: "description", content: "Login to your Nedcgroup account" },
  ];
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const userLoggedIn = await isUserLoggedIn(request);
  if (userLoggedIn) {
    return redirect("/companies");
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: "Invalid form submission" }, { status: 400 });
  }

  try {
    const token = await login(email, password);
    return createUserSession(token, "/companies");
  } catch (error) {
    return json({ error: (error as Error).message }, { status: 400 });
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const submit = useSubmit();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      submit(values, { method: "post" });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full border border-gray-400 space-y-10 p-10 bg-white rounded-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-10">Nedcgroup</h1>
          <h2 className="text-xl font-semibold text-gray-700">
            Welcome back — Login to continue
          </h2>
        </div>
        <Form
          method="post"
          onSubmit={formik.handleSubmit}
          className="mt-8 space-y-8"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-12 pr-4 py-4 border ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition duration-150 ease-in-out`}
                  placeholder="Enter your email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {formik.errors.email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full pl-12 pr-12 py-4 border ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition duration-150 ease-in-out`}
                  placeholder="Enter your password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff
                      className="h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-2 text-sm text-red-600" id="password-error">
                  {formik.errors.password}
                </p>
              )}
            </div>
          </div>

          {actionData?.error && (
            <div className="rounded-xl bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <div className="mt-2 text-sm text-red-700">
                    <p>{actionData.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-violet-500 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {navigation.state === "submitting" ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
