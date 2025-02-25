"use client";

import { useState, useEffect, useRef } from "react";
import {
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Key,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreVertical,
  Trash,
  Loader,
  DollarSign,
  AlertCircle,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { requireUserToken } from "~/utils/auth.server";
import { baseUrl } from "~/constants/api";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Label } from "~/components/ui/label";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast, Toaster } from "react-hot-toast";
import { ConfirmationModal } from "~/components/ui/ConfirmationModal";

interface Company {
  _id: string;
  name: string;
  companyNumber: string;
  IsActive: boolean;
  deviceSerialNumber: string;
  managerEmail: string;
  managerPassword: string;
  password: string;
  pinCode: string;
  orgNumber: number;
  creditLimit: string;
  address: {
    city: string;
    postNumber: string;
  };
  registredDate: string;
}

interface SalesData {
  type: string;
  amount: number;
  previousAmount: number;
}

interface PaymentHistory {
  _id: string;
  companyId: string;
  EnteredBy: string;
  PaidAmount: string;
  PaidDate: string;
  id: string;
}

interface Order {
  _id: string;
  voucherNumber: string;
  voucherDescription: string;
  voucherAmount: number;
  voucherCurrency: string;
  OrderDate: string;
  expireDate: string;
  serialNumber: string;
}

type OrderType = "comviq" | "lyca";

export const loader: LoaderFunction = async ({ params, request }) => {
  const token = await requireUserToken(request);
  const companyResponse = await fetch(
    `${baseUrl}/company/${params.companyId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!companyResponse.ok) {
    throw new Error("Failed to fetch company details");
  }

  const company = await companyResponse.json();

  const comviqOrdersResponse = await fetch(
    `${baseUrl}/order/detail/${company.company._id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const lycaOrdersResponse = await fetch(
    `${baseUrl}/lyca-order/detail/${company.company._id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const salesResponse = await fetch(
    `${baseUrl}/order/dailysale/${company.company._id}?includePrevious=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const paymentHistoryResponse = await fetch(
    `${baseUrl}/paidhistory/${company.company._id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const [comviqOrders, lycaOrders, salesData, paymentHistory] =
    await Promise.all([
      comviqOrdersResponse.ok ? comviqOrdersResponse.json() : { orderlist: [] },
      lycaOrdersResponse.ok ? lycaOrdersResponse.json() : { orderlist: [] },
      salesResponse.ok ? salesResponse.json() : { companySelling: [] },
      paymentHistoryResponse.ok
        ? paymentHistoryResponse.json()
        : { orderHistoryList: [] },
    ]);

  return json({
    company: company.company,
    comviqOrders: comviqOrders.orderlist,
    lycaOrders: lycaOrders.orderlist,
    salesData: salesData.companySelling,
    paymentHistory: paymentHistory.orderHistoryList || [],
    token,
  });
};

export default function CompanyDetails() {
  const {
    company,
    comviqOrders,
    lycaOrders,
    salesData,
    paymentHistory,
    token,
  } = useLoaderData<{
    company: Company;
    comviqOrders: Order[];
    lycaOrders: Order[];
    salesData: SalesData[];
    paymentHistory: PaymentHistory[];
    token: string;
  }>();

  console.log(comviqOrders);
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState<boolean>(company.IsActive);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPinCode, setShowPinCode] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [orderType, setOrderType] = useState<OrderType>("comviq");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [invoiceStartDate, setInvoiceStartDate] = useState<Date | null>(null);
  const [invoiceEndDate, setInvoiceEndDate] = useState<Date | null>(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] =
    useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [isDeleteOrderModalOpen, setIsDeleteOrderModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<{
    [key: string]: { name: string; email: string };
  }>({});
  const [paymentHistoryState, setPaymentHistoryState] =
    useState<PaymentHistory[]>(paymentHistory);
  const hasInitialFetchRef = useRef(false);
  const ordersPerPage = 10;

  useEffect(() => {
    const orders = orderType === "comviq" ? comviqOrders : lycaOrders;
    const filtered = orders
      .filter((order) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.voucherNumber.toLowerCase().includes(searchLower) ||
          order.voucherDescription.toLowerCase().includes(searchLower) ||
          order.serialNumber.toLowerCase().includes(searchLower)
        );
      })
      .filter((order) => {
        const orderDate = new Date(order.OrderDate);
        if (startDate && !endDate) {
          return orderDate >= startDate;
        }
        if (!startDate && endDate) {
          return orderDate <= endDate;
        }
        if (startDate && endDate) {
          return orderDate >= startDate && orderDate <= endDate;
        }
        return true;
      });
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, orderType, comviqOrders, lycaOrders]);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    paymentHistoryState.forEach((payment) => {
      if (payment.EnteredBy && !adminInfo[payment.EnteredBy]) {
        fetchAdminInfo(payment.EnteredBy);
      }
    });
  }, [paymentHistoryState, adminInfo]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (hasInitialFetchRef.current) return;
      hasInitialFetchRef.current = true;

      const updatedHistoryResponse = await fetch(
        `${baseUrl}/paidhistory/${company._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (updatedHistoryResponse.ok) {
        const updatedHistory = await updatedHistoryResponse.json();
        if (updatedHistory.message === "No Paid History Data Found") {
          setPaymentHistoryState([]);
        } else {
          setPaymentHistoryState(updatedHistory.orderHistoryList || []);
        }
      }
    };
    fetchPaymentHistory();
  }, [company._id, token]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const toggleStatus = async () => {
    const newStatus = !isActive;
    setIsLoading(true);
    toast.loading("Updating company status...");

    try {
      const response = await fetch(`${baseUrl}/company/status/${company._id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ IsActive: newStatus }),
      });

      if (response.ok) {
        setIsActive(newStatus);
        toast.dismiss();
        toast.success(
          `Company status updated to ${newStatus ? "active" : "inactive"}`
        );
      } else {
        toast.dismiss();
        toast.error("Failed to update company status");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while updating the company status");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const handleGenerateInvoice = async () => {
    if (!invoiceStartDate || !invoiceEndDate) {
      toast.error("Please select both start and end dates for the invoice");
      return;
    }

    setIsLoading(true);
    toast.loading("Generating invoice...");

    try {
      const response = await fetch(
        `${baseUrl}/order/getInvoicebydate/${company._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromdate: invoiceStartDate.toISOString(),
            todate: invoiceEndDate.toISOString(),
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.dismiss();
        toast.success(result.message || "Invoice generated successfully");
      } else {
        toast.dismiss();
        toast.error("Failed to generate invoice");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while generating the invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setIsLoading(true);
    toast.loading("Deleting order...");

    try {
      const response = await fetch(
        `${baseUrl}/order/delete/${orderId}/${company._id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.dismiss();
        toast.success("Order deleted successfully");
        // Refetch orders
        const updatedOrdersResponse = await fetch(
          `${baseUrl}/order/detail/${company._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (updatedOrdersResponse.ok) {
          const updatedOrders = await updatedOrdersResponse.json();
          setFilteredOrders(updatedOrders.orderlist || []);
        }
      } else {
        toast.dismiss();
        toast.error("Failed to delete order");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while deleting the order");
    } finally {
      setIsLoading(false);
      setIsDeleteOrderModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleAddPayment = async () => {
    if (!newPaymentAmount) {
      toast.error("Please enter a payment amount");
      return;
    }

    setIsLoading(true);
    toast.loading("Adding payment...");

    try {
      const response = await fetch(`${baseUrl}/paidhistory/${company._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "",
          PaidAmount: newPaymentAmount,
        }),
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("Payment added successfully");
        setNewPaymentAmount("");
        // Refetch payment history
        const updatedHistoryResponse = await fetch(
          `${baseUrl}/paidhistory/${company._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (updatedHistoryResponse.ok) {
          const updatedHistory = await updatedHistoryResponse.json();
          if (updatedHistory.message === "No Paid History Data Found") {
            setPaymentHistoryState([]);
          } else {
            setPaymentHistoryState(updatedHistory.orderHistoryList || []);
          }
        }
      } else {
        toast.dismiss();
        toast.error("Failed to add payment");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while adding the payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaymentHistory = async (paymentId: string) => {
    setIsLoading(true);
    toast.loading("Deleting payment history...");

    try {
      const response = await fetch(`${baseUrl}/paidhistory/${paymentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("Payment history deleted successfully");
        // Remove the deleted payment from the state
        setPaymentHistoryState((prevState) => {
          const updatedState = prevState.filter(
            (payment) => payment._id !== paymentId
          );
          // If this was the last payment, set the state to an empty array
          return updatedState.length === 0 ? [] : updatedState;
        });
      } else {
        toast.dismiss();
        toast.error("Failed to delete payment history");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while deleting the payment history");
    } finally {
      setIsLoading(false);
      setIsDeletePaymentModalOpen(false);
      setPaymentToDelete(null);
    }
  };

  const fetchAdminInfo = async (adminId: string) => {
    try {
      const response = await fetch(`${baseUrl}/admin/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const adminData = await response.json();
        setAdminInfo((prevInfo) => ({
          ...prevInfo,
          [adminId]: { name: adminData.name, email: adminData.email },
        }));
      }
    } catch (error) {
      console.error("Error fetching admin info:", error);
    }
  };

  return (
    <div className="min-h-screen md:container mx-auto bg-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/companies")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
        </Button>

        <div className="grid  gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">
                {company.name}
              </CardTitle>
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${company.name}.png`}
                  alt={company.name}
                />
                <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>{company.companyNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{company.managerEmail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{company.deviceSerialNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{`${company.address.city}, ${company.address.postNumber}`}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span>Credit Limit: {company.creditLimit}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Registered:{" "}
                    {new Date(company.registredDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-gray-500" />
                  <span>Manager Password: </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  {showPassword ? company.managerPassword : "••••••"}
                </div>
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-gray-500" />
                  <span>PIN Code: </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPinCode(!showPinCode)}
                  >
                    {showPinCode ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  {showPinCode ? company.pinCode : "••••"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Status</CardTitle>
              <CardDescription>Manage company's active status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">
                  {isActive ? "Active" : "Inactive"}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleStatus()}
                >
                  {isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-500" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {salesData.map((data, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {data.type}
                      </CardTitle>
                      {data.type.includes("Today") && (
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      )}
                      {data.type.includes("Weekly") && (
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      )}
                      {data.type.includes("Monthly") && (
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {typeof data.amount === "number"
                          ? data.amount.toFixed(2)
                          : "N/A"}
                      </div>
                      {data.previousAmount > 0 &&
                        typeof data.amount === "number" && (
                          <p className="text-xs text-muted-foreground">
                            {calculatePercentageChange(
                              data.amount,
                              data.previousAmount
                            )}
                            % from last{" "}
                            {data.type.toLowerCase().includes("today")
                              ? "day"
                              : data.type.toLowerCase().includes("weekly")
                              ? "week"
                              : "month"}
                          </p>
                        )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Orders, Invoices, and Payments</CardTitle>
            <CardDescription>
              Manage orders, generate invoices, and view payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="invoices">Generate Invoice</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
              </TabsList>
              <TabsContent value="orders">
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-1/3">
                      <Label htmlFor="startDate">Start Date</Label>
                      <DatePicker
                        id="startDate"
                        selected={startDate}
                        onChange={(date: any) => {
                          setStartDate(date);
                          if (date && endDate && date > endDate) {
                            setEndDate(null);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="w-1/3">
                      <Label htmlFor="endDate">End Date</Label>
                      <DatePicker
                        id="endDate"
                        selected={endDate}
                        onChange={(date: any) => {
                          setEndDate(date);
                          if (date && startDate && date < startDate) {
                            setStartDate(null);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="w-1/3">
                      <Label htmlFor="orderType">Order Type</Label>
                      <Select
                        value={orderType}
                        onValueChange={(value: OrderType) =>
                          setOrderType(value)
                        }
                      >
                        <SelectTrigger id="orderType">
                          <SelectValue placeholder="Select order type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comviq">Comviq</SelectItem>
                          <SelectItem value="lyca">Lyca</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by voucher number, description, or serial number"
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchTerm(e.target.value)
                      }
                      className="pl-8"
                    />
                  </div>
                  {filteredOrders.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No orders found for the selected criteria.
                    </p>
                  ) : isMobile ? (
                    <div className="space-y-4">
                      {currentOrders.map((order) => (
                        <Card key={order._id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">
                                  {order.voucherNumber}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {order.voucherDescription}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setOrderToDelete(order._id);
                                      setIsDeleteOrderModalOpen(true);
                                    }}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="mt-2">
                              <p>
                                Amount: {order.voucherAmount}{" "}
                                {order.voucherCurrency}
                              </p>
                              <p>
                                Date:{" "}
                                {new Date(order.OrderDate).toLocaleDateString()}
                              </p>
                              <p>
                                Expire Date:{" "}
                                {new Date(
                                  order.expireDate
                                ).toLocaleDateString()}
                              </p>
                              <p>Serial Number: {order.serialNumber}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voucher Number</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Expire Date</TableHead>
                          <TableHead>Serial Number</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentOrders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>{order.voucherNumber}</TableCell>
                            <TableCell>{order.voucherDescription}</TableCell>
                            <TableCell>
                              {order.voucherAmount} {order.voucherCurrency}
                            </TableCell>
                            <TableCell>
                              {new Date(order.OrderDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(order.expireDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{order.serialNumber}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setOrderToDelete(order._id);
                                      setIsDeleteOrderModalOpen(true);
                                    }}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  {filteredOrders.length > 0 && (
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="invoices">
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      <Label htmlFor="invoiceStartDate">Start Date</Label>
                      <DatePicker
                        id="invoiceStartDate"
                        selected={invoiceStartDate}
                        onChange={(date: Date | null | any) =>
                          setInvoiceStartDate(date)
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="w-1/2">
                      <Label htmlFor="invoiceEndDate">End Date</Label>
                      <DatePicker
                        id="invoiceEndDate"
                        selected={invoiceEndDate}
                        onChange={(date: Date | null | any) =>
                          setInvoiceEndDate(date)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateInvoice}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Invoice
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="payments">
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-3/4">
                      <Label htmlFor="newPaymentAmount">Payment Amount</Label>
                      <Input
                        id="newPaymentAmount"
                        type="number"
                        value={newPaymentAmount}
                        onChange={(e) => setNewPaymentAmount(e.target.value)}
                        placeholder="Enter payment amount"
                      />
                    </div>
                    <div className="w-1/4 flex items-end">
                      <Button
                        onClick={handleAddPayment}
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Add Payment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {paymentHistoryState.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No payment history found.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Entered By</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistoryState.map((payment) => (
                          <TableRow key={payment._id}>
                            <TableCell>
                              {new Date(payment.PaidDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{payment.PaidAmount}</TableCell>
                            <TableCell>
                              {adminInfo[payment.EnteredBy]
                                ? `${adminInfo[payment.EnteredBy].name} (${
                                    adminInfo[payment.EnteredBy].email
                                  })`
                                : payment.EnteredBy}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPaymentToDelete(payment._id);
                                  setIsDeletePaymentModalOpen(true);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
      <Toaster position="top-right" />
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center space-x-2">
            <Loader className="animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={isDeletePaymentModalOpen}
        onClose={() => setIsDeletePaymentModalOpen(false)}
        onConfirm={() => {
          if (paymentToDelete) {
            handleDeletePaymentHistory(paymentToDelete);
          }
        }}
        title="Confirm Delete Payment"
        message="Are you sure you want to delete this payment history?"
        confirmText="Delete"
        cancelText="Cancel"
      />
      <ConfirmationModal
        isOpen={isDeleteOrderModalOpen}
        onClose={() => setIsDeleteOrderModalOpen(false)}
        onConfirm={() => {
          if (orderToDelete) {
            handleDeleteOrder(orderToDelete);
          }
        }}
        title="Confirm Delete Order"
        message="Are you sure you want to delete this order?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  const errorTitle = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Oops! Något gick fel.";

  const errorMessage = isRouteErrorResponse(error)
    ? error.data
    : "Ett oväntat fel inträffade. Vi ber om ursäkt för besväret.";

  return (
    <div className="min-h-screen fixed w-full bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl leading-relaxed font-extrabold text-gray-900">
            {errorTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {errorMessage}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <RefreshCw
                  className="h-5 w-5 text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm leading-relaxed text-blue-700">
                  Prova att uppdatera sidan. Om problemet kvarstår, vänligen
                  kontakta vår support.
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">
              Behöver du hjälp?
            </h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MessageCircle
                    className="h-6 w-6 text-green-500"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <p className="text-gray-700 leading-relaxed">
                    Använd chattwidgeten i nedre högra hörnet för att prata med
                    oss. Du kan både chatta och ringa via widgeten.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Phone
                    className="h-6 w-6 text-yellow-500"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <p className="text-gray-700 leading-relaxed ">
                    Om du inte kan använda chattwidgeten, ring oss på:
                  </p>
                  <a
                    href="tel:+46793394031"
                    className="text-yellow-600 hover:text-yellow-500 font-medium"
                  >
                    +46 79 339 40 31
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
