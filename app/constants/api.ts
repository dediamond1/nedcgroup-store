export const baseUrl = "http://localhost:3004/api"

export const endpoints = {
  login: "/admin/login",
  adminUser: "/admin/me",

  register: "/api/auth/register", // Adjust this if the registration endpoint is different
  // Add other endpoints as needed
}

export const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
})

