"use client";

import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { login, createUserSession, isUserLoggedIn } from "~/utils/auth.server";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const userLoggedIn = await isUserLoggedIn(request);
  if (userLoggedIn) {
    return redirect("/lager");
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
    console.log("token", token);
    return createUserSession(token, "/lager");
  } catch (error) {
    return json({ error: (error as Error).message }, { status: 400 });
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex bg-gray-100">
      <div className="w-1/2 bg-blue-600 flex items-center justify-center">
        <div className="text-white">
          <svg className="w-32 h-32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <h1 className="mt-6 text-4xl font-bold">Nedcgroup</h1>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <Form
            method="post"
            onSubmit={formik.handleSubmit}
            className="mt-8 space-y-6"
          >
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`mt-1 ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : ""
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.email}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={`mt-1 ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500"
                        : ""
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </div>

            {actionData?.error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <p className="text-sm text-red-700">{actionData.error}</p>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={navigation.state === "submitting" || !formik.isValid}
                className="w-full"
              >
                {navigation.state === "submitting"
                  ? "Signing in..."
                  : "Sign in"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
