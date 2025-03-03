"use client";

import { useState, useEffect, useRef } from "react";
import {
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
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
  TrendingDown,
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
  Plus,
  ChevronUp,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  UserCircle,
  PlusCircle,
  Info,
} from "lucide-react";
import { requireUserToken } from "~/utils/auth.server";
import { baseUrl } from "~/constants/api";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea } from "~/components/ui/scroll-area";
import AddPaymentModal from "~/components/ui/PaymentHistoryModal";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] =
    useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [isDeleteOrderModalOpen, setIsDeleteOrderModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{
    [key: string]: { name: string; email: string };
  }>({});
  const [paymentHistoryState, setPaymentHistoryState] =
    useState<PaymentHistory[]>(paymentHistory);
  const [activeTab, setActiveTab] = useState("orders");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const hasInitialFetchRef = useRef(false);
  const ordersPerPage = 10;

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Filter orders based on search, date range, and order type
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

  // Check if on mobile device
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Fetch admin info for each payment
  useEffect(() => {
    paymentHistoryState.forEach((payment) => {
      if (payment.EnteredBy && !adminInfo[payment.EnteredBy]) {
        fetchAdminInfo(payment.EnteredBy);
      }
    });
  }, [paymentHistoryState, adminInfo]);

  // Initial fetch of payment history
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

  // Pagination variables
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Toggle company active status
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

  // Change pagination page
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Calculate percentage change for sales metrics
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  // Generate invoice for selected date range
  const handleGenerateInvoice = async () => {
    if (!invoiceStartDate || !invoiceEndDate) {
      toast.error("Please select both start and end dates for the invoice");
      return;
    }

    if (invoiceEndDate < invoiceStartDate) {
      toast.error("End date must be after start date");
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
        // Reset dates after successful generation
        setInvoiceStartDate(null);
        setInvoiceEndDate(null);
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

  // Delete an order
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

  // Refresh payment history after adding new payment
  const handlePaymentSuccess = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  // Delete a payment history item
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

  // Fetch admin information for payment history
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

  // Reset filters
  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen mx-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/companies")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
          </Button>
          <Badge
            variant={isActive ? "default" : "destructive"}
            className="text-sm font-medium px-3 py-1"
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Company Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-2 bg-white border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <Avatar className="h-16 w-16 mr-4 border-2 border-gray-100">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${company.name}.png`}
                      alt={company.name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xl">
                      {company.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {company.name}
                    </CardTitle>
                    <CardDescription className="text-gray-500 flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {company.companyNumber}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-full px-4 ${
                            isActive
                              ? "border-green-200 bg-green-50 hover:bg-green-100"
                              : "border-red-200 bg-red-50 hover:bg-red-100"
                          }`}
                          onClick={toggleStatus}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-red-600 mr-2" />
                          )}
                          {isActive ? "Active" : "Inactive"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle company status</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Contact Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Mail className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <span className="text-sm text-gray-700">
                        {company.managerEmail}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <span className="text-sm text-gray-700">
                        {company.deviceSerialNumber}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <span className="text-sm text-gray-700">{`${company.address.city}, ${company.address.postNumber}`}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Account Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CreditCard className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <span className="text-sm text-gray-700">
                        Credit Limit: {company.creditLimit}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <span className="text-sm text-gray-700">
                        Registered: {formatDate(company.registredDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Security
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Key className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 mr-2">
                        Manager Password:
                      </span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        {showPassword ? company.managerPassword : "••••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-1 h-6 w-6 p-0"
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center">
                      <Key className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 mr-2">
                        PIN Code:
                      </span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        {showPinCode ? company.pinCode : "••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPinCode(!showPinCode)}
                        className="ml-1 h-6 w-6 p-0"
                      >
                        {showPinCode ? (
                          <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Quick Actions
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        setActiveTab("invoices");
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        setIsAddPaymentModalOpen(true);
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Payment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl">Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {salesData.map((data, index) => {
                  // Determine if the trend is up or down
                  const isPositive = data.amount >= data.previousAmount;
                  const change = calculatePercentageChange(
                    data.amount,
                    data.previousAmount
                  );
                  const periodLabel = data.type.toLowerCase().includes("today")
                    ? "day"
                    : data.type.toLowerCase().includes("weekly")
                    ? "week"
                    : "month";

                  return (
                    <Card
                      key={index}
                      className="border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              {data.type}
                            </p>
                            <h3 className="text-2xl font-bold mt-1">
                              {typeof data.amount === "number"
                                ? new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "SEK",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(data.amount)
                                : "N/A"}
                            </h3>
                          </div>
                          <div
                            className={`p-2 rounded-full ${
                              isPositive ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </div>
                        {data.previousAmount > 0 &&
                          typeof data.amount === "number" && (
                            <div
                              className={`flex items-center mt-2 text-sm ${
                                isPositive ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isPositive ? (
                                <ChevronUp className="h-3 w-3 mr-1" />
                              ) : (
                                <ChevronLeft className="h-3 w-3 mr-1" />
                              )}
                              <span>
                                {Math.abs(Number(change))}% from last{" "}
                                {periodLabel}
                              </span>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b">
                <ScrollArea className="w-full">
                  <div className="flex p-1">
                    <TabsList className="bg-transparent h-12">
                      <TabsTrigger
                        value="orders"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 px-4"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Orders
                      </TabsTrigger>
                      <TabsTrigger
                        value="invoices"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 px-4"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Generate Invoice
                      </TabsTrigger>
                      <TabsTrigger
                        value="payments"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 px-4"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Payment History
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </ScrollArea>
              </div>

              {/* Orders Tab */}
              <TabsContent value="orders" className="p-0">
                <div className="p-4 bg-white border-b">
                  <div className="flex flex-col md:flex-row gap-4 md:items-end">
                    <div className="grow">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by voucher number, description, or serial number"
                          value={searchTerm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearchTerm(e.target.value)
                          }
                          className="pl-10 bg-white focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                      <Select
                        value={orderType}
                        onValueChange={(value: OrderType) =>
                          setOrderType(value)
                        }
                      >
                        <SelectTrigger
                          id="orderType"
                          className="w-full md:w-36"
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comviq">Comviq</SelectItem>
                          <SelectItem value="lyca">Lyca</SelectItem>
                        </SelectContent>
                      </Select>

                      {isMobile ? (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-full md:w-auto"
                            >
                              <Filter className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="right">
                            <div className="space-y-4 pt-4">
                              <h3 className="text-lg font-medium">
                                Filter Orders
                              </h3>
                              <div>
                                <Label
                                  htmlFor="mobileStartDate"
                                  className="text-sm"
                                >
                                  Start Date
                                </Label>
                                <DatePicker
                                  id="mobileStartDate"
                                  selected={startDate}
                                  onChange={(date: any) => {
                                    setStartDate(date);
                                    if (date && endDate && date > endDate) {
                                      setEndDate(null);
                                    }
                                  }}
                                  className="w-full mt-1"
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor="mobileEndDate"
                                  className="text-sm"
                                >
                                  End Date
                                </Label>
                                <DatePicker
                                  id="mobileEndDate"
                                  selected={endDate}
                                  onChange={(date: any) => {
                                    setEndDate(date);
                                    if (date && startDate && date < startDate) {
                                      setStartDate(null);
                                    }
                                  }}
                                  className="w-full mt-1"
                                />
                              </div>
                              <Button
                                className="w-full mt-2"
                                onClick={handleResetFilters}
                                variant="outline"
                              >
                                Clear Filters
                              </Button>
                            </div>
                          </SheetContent>
                        </Sheet>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-40">
                            <Label htmlFor="startDate" className="sr-only">
                              Start Date
                            </Label>
                            <DatePicker
                              id="startDate"
                              selected={startDate}
                              onChange={(date: any) => {
                                setStartDate(date);
                                if (date && endDate && date > endDate) {
                                  setEndDate(null);
                                }
                              }}
                              placeholderText="Start Date"
                              className="w-full"
                            />
                          </div>
                          <div className="w-40">
                            <Label htmlFor="endDate" className="sr-only">
                              End Date
                            </Label>
                            <DatePicker
                              id="endDate"
                              selected={endDate}
                              onChange={(date: any) => {
                                setEndDate(date);
                                if (date && startDate && date < startDate) {
                                  setStartDate(null);
                                }
                              }}
                              placeholderText="End Date"
                              className="w-full"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="text-gray-500"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reset
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="p-0">
                  {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">
                        No Orders Found
                      </h3>
                      <p className="text-gray-500 mt-1">
                        No orders match your search criteria. Try changing your
                        filters.
                      </p>
                      {(searchTerm || startDate || endDate) && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={handleResetFilters}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : isMobile ? (
                    <div className="space-y-1 p-2">
                      {currentOrders.map((order) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Accordion type="single" collapsible>
                            <AccordionItem
                              value={order._id}
                              className="border rounded-md mb-2 overflow-hidden"
                            >
                              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex justify-between items-center w-full">
                                  <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">
                                      {order.voucherNumber}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {formatDate(order.OrderDate)}
                                    </span>
                                  </div>
                                  <Badge>
                                    {order.voucherAmount}{" "}
                                    {order.voucherCurrency}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-3 pt-0 bg-gray-50">
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Description
                                    </p>
                                    <p className="text-sm">
                                      {order.voucherDescription}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Serial Number
                                    </p>
                                    <p className="text-sm font-mono">
                                      {order.serialNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Order Date
                                    </p>
                                    <p className="text-sm">
                                      {formatDate(order.OrderDate)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Expire Date
                                    </p>
                                    <p className="text-sm">
                                      {formatDate(order.expireDate)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  onClick={() => {
                                    setOrderToDelete(order._id);
                                    setIsDeleteOrderModalOpen(true);
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete Order
                                </Button>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Voucher Number</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Expire Date</TableHead>
                            <TableHead>Serial Number</TableHead>
                            <TableHead className="w-16">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentOrders.map((order) => (
                            <TableRow key={order._id}>
                              <TableCell className="font-medium">
                                {order.voucherNumber}
                              </TableCell>
                              <TableCell>{order.voucherDescription}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {order.voucherAmount} {order.voucherCurrency}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDate(order.OrderDate)}
                              </TableCell>
                              <TableCell>
                                {formatDate(order.expireDate)}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {order.serialNumber}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setOrderToDelete(order._id);
                                    setIsDeleteOrderModalOpen(true);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {filteredOrders.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-gray-500">
                        Showing {indexOfFirstOrder + 1}-
                        {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                        {filteredOrders.length} orders
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </TabsContent>

              {/* Invoices Tab */}
              <TabsContent value="invoices">
                <CardContent className="p-4 md:p-6">
                  <div className="max-w-md mx-auto">
                    <div className="text-center mb-6">
                      <FileText className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Generate Invoice
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Create an invoice for this company for a specific date
                        range
                      </p>
                    </div>

                    <Card className="border shadow-sm">
                      <CardContent className="p-4 space-y-4 pt-4">
                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor="invoiceStartDate"
                              className="text-sm font-medium"
                            >
                              Start Date <span className="text-red-500">*</span>
                            </Label>
                            <DatePicker
                              id="invoiceStartDate"
                              selected={invoiceStartDate}
                              onChange={(date: Date | null | any) =>
                                setInvoiceStartDate(date)
                              }
                              className="w-full mt-1"
                              placeholderText="Select start date"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="invoiceEndDate"
                              className="text-sm font-medium"
                            >
                              End Date <span className="text-red-500">*</span>
                            </Label>
                            <DatePicker
                              id="invoiceEndDate"
                              selected={invoiceEndDate}
                              onChange={(date: Date | null | any) =>
                                setInvoiceEndDate(date)
                              }
                              className="w-full mt-1"
                              placeholderText="Select end date"
                            />
                          </div>
                        </div>

                        {invoiceStartDate &&
                          invoiceEndDate &&
                          invoiceEndDate < invoiceStartDate && (
                            <div className="p-2 bg-red-50 text-red-700 text-sm rounded border border-red-200 flex items-start">
                              <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                              <span>End date must be after start date</span>
                            </div>
                          )}

                        <Button
                          onClick={handleGenerateInvoice}
                          className="w-full mt-2"
                          disabled={
                            isLoading ||
                            !invoiceStartDate ||
                            !invoiceEndDate ||
                            (invoiceStartDate &&
                              invoiceEndDate &&
                              invoiceEndDate < invoiceStartDate)
                          }
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
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium">Payment History</h3>
                    <Button
                      onClick={() => setIsAddPaymentModalOpen(true)}
                      className="flex items-center"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Payment
                    </Button>
                  </div>

                  {paymentHistoryState.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">
                        No Payment History
                      </h3>
                      <p className="text-gray-500 mt-1">
                        This company doesn't have any recorded payments yet.
                      </p>
                      <Button
                        onClick={() => setIsAddPaymentModalOpen(true)}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Payment
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Entered By</TableHead>
                            <TableHead className="w-16">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentHistoryState.map((payment) => (
                            <TableRow key={payment._id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                  {formatDate(payment.PaidDate)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "SEK",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(Number(payment.PaidAmount))}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <UserCircle className="h-4 w-4 text-gray-400 mr-2" />
                                  {adminInfo[payment.EnteredBy] ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger className="text-blue-600 hover:underline cursor-help">
                                          {adminInfo[payment.EnteredBy].name}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            {adminInfo[payment.EnteredBy].email}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    payment.EnteredBy
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                    </div>
                  )}
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </motion.div>

      {/* Toaster for notifications */}
      <Toaster position="top-right" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-sm">
          <Card className="w-auto p-4 flex items-center space-x-3">
            <Loader className="h-5 w-5 text-blue-600 animate-spin" />
            <span>Processing...</span>
          </Card>
        </div>
      )}

      {/* Confirmation modals */}
      <ConfirmationModal
        isOpen={isDeletePaymentModalOpen}
        onClose={() => setIsDeletePaymentModalOpen(false)}
        onConfirm={() => {
          if (paymentToDelete) {
            handleDeletePaymentHistory(paymentToDelete);
          }
        }}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? This action cannot be undone."
        confirmText="Delete Payment"
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
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete Order"
        cancelText="Cancel"
      />

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        companyId={company._id}
        companyName={company.name}
        token={token}
        onSuccess={handlePaymentSuccess}
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
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg p-8 shadow-md">
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
