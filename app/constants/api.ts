 //export const baseUrl = "http://localhost:3004/api"
 export const baseUrl = "https://artinsgruppen2-a22da2d8d991.herokuapp.com/api"


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

