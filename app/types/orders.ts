export interface BaseOrder {
    _id: string
    company: string
    employeeId: string | null
    articleId: string
    voucherDescription: string
    voucherAmount: string
    totalvoucherAmount: string
    voucherCurrency: string
    expireDate: string
    voucherNumber: string
    serialNumber: string
    OrderDate: string
    __v: number
    id: string
  }
  
  export interface ComviqOrder extends BaseOrder {
    // Comviq-specific fields can be added here if needed
  }
  
  export interface LycaOrder extends BaseOrder {
    isLyca: string
  }

export interface TeliaOrder extends BaseOrder {
    isTelia: string
  }

export interface HalebopOrder extends BaseOrder {
    isHalebop: string
  }
  
  export type Order = ComviqOrder | LycaOrder | TeliaOrder | HalebopOrder
