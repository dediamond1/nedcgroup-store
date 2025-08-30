 //export const baseUrl = "http://localhost:3004/api"
 export const baseUrl = "https://nedc-api.techdevcyber.se/api"
//  export const baseUrl = "http://192.168.1.88:3004/api"


export const endpoints = {
  login: "/admin/login",
  adminUser: "/admin/me",
  register: "/api/auth/register",
  
  // Order endpoints
  comviqOrders: "/order/detail",
  lycaOrders: "/lyca-order/detail", 
  teliaOrders: "/teliaOrder/details",
  halebopOrders: "/teliaOrder/details",
  
  // Other endpoints
  dailySales: "/order/dailysale",
  paymentHistory: "/paidhistory",
  companyStatus: "/company/status",
  generateInvoice: "/order/getInvoicebydate"
}

export const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
})


