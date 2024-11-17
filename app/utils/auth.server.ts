
import { create } from "apisauce";
import { redirect } from "@remix-run/node";

// Define the type of response for the login and register API calls
interface AuthResponse {
  token: string;
  message?: string;
}

// Your API base URL
const API_URL = "https://artinsgruppen2-a22da2d8d991.herokuapp.com/api"; // Replace with your actual API base URL

// Create an Apisauce instance
const api = create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Helper to set the token in a secure, HTTP-only cookie
function createSession(token: string) {
  return `token=${token}; HttpOnly; Secure; Path=/; Max-Age=${60 * 60 * 24}`;
}

// Improved error handling for API requests
function handleApiError(response: any) {
  if (!response.ok) {
    const errorMessage = response.data?.message || "Something went wrong";
    throw new Error(errorMessage);
  }
  return response.data;
}

// Login user with your external API using Apisauce
export async function loginUser(email: string, password: string): Promise<string> {
  const response = await api.post("/admin/login", { email, password });
  console.log(response)

  const data = handleApiError(response); // Handle potential errors

  return data.token; // Return the token if successful
}

// Register user with your external API using Apisauce
export async function registerUser(email: string, password: string): Promise<string> {
  const response = await api.post("/api/auth/register", { email, password });

  const data = handleApiError(response); // Handle potential errors

  return data.token; // Return the token if successful
}

// Middleware to verify the session (JWT token) from cookies
export async function requireAuth(request: Request): Promise<string> {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader?.match(/token=([^;]+)/)?.[1];

  if (!token) {
    throw redirect("/");
  }

  // Optionally verify the token with the API or decode it here if needed
  return token; // This would typically return the decoded user info or the token itself
}
