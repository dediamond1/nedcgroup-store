import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { baseUrl, endpoints } from "~/constants/api"
import { create } from "apisauce"

const sessionSecret: string | undefined = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set")
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
})

const apiClient = create({
  baseURL: baseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
})

export async function createUserSession(token: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set("token", token)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  })
}

export async function getUserToken(request: Request): Promise<string | null> {
  const session = await storage.getSession(request.headers.get("Cookie"))
  const token = session.get("token")
  if (!token || typeof token !== "string") return null
  return token
}

export async function requireUserToken(request: Request, redirectTo = "/login"): Promise<string> {
  const token = await getUserToken(request)
  if (!token) {
    throw redirect(redirectTo)
  }
  return token
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"))
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  })
}

export async function login(email: string, password: string): Promise<string> {
  const response = await apiClient.post<{ message: string; token?: string }>(endpoints.login, { email, password })
  if (!response.ok || !response.data) {
    throw new Error(response.data?.message || "Login failed")
  }


  if (!response.data.token) {
    throw new Error("No token received from server")
  }

  return response.data.token
}

export async function isUserLoggedIn(request: Request): Promise<boolean> {
  const token = await getUserToken(request)
  return !!token
}

export async function getUser(request: Request): Promise<any | null> {
  const token = await getUserToken(request)
  if (!token) return null

  const response = await apiClient.get<any>(endpoints.adminUser, {}, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) {
    console.error("Error fetching user data:", response.problem)
    return null
  }

  console.log(response.data)
  return response.data?.user
}

