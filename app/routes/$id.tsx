"use client";

import { useState, useEffect } from "react";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
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
import { toast } from "react-hot-toast";
import type { LycaOrder, ComviqOrder } from "~/types/orders";
import { Toaster } from "react-hot-toast";

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

type OrderType = "comviq" | "lyca";

export const loader: LoaderFunction = async ({ params, request }) => {
  const token = await requireUserToken(request);
  const companyResponse = await fetch(`${baseUrl}/company/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

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

  if (!comviqOrdersResponse.ok) {
    throw new Error("Failed to fetch Comviq orders");
  }

  const comviqOrders = await comviqOrdersResponse.json();

  const lycaOrdersResponse = await fetch(
    `${baseUrl}/lyca-order/detail/${company.company._id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!lycaOrdersResponse.ok) {
    throw new Error("Failed to fetch Lyca orders");
  }

  const lycaOrders = await lycaOrdersResponse.json();

  const salesResponse = await fetch(
    `${baseUrl}/order/dailysale/${company.company._id}?includePrevious=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!salesResponse.ok) {
    throw new Error("Failed to fetch sales data");
  }

  const salesData = await salesResponse.json();

  return json({
    company: company.company,
    comviqOrders: comviqOrders.orderlist,
    lycaOrders: lycaOrders.orderlist,
    salesData: salesData.companySelling,
    token,
  });
};

export default function CompanyDetails() {
  const { company, comviqOrders, lycaOrders, salesData, token } =
    useLoaderData<{
      company: Company;
      comviqOrders: ComviqOrder[];
      lycaOrders: LycaOrder[];
      salesData: SalesData[];
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
  const [filteredOrders, setFilteredOrders] = useState<
    (ComviqOrder | LycaOrder)[]
  >([]);
  const [invoiceStartDate, setInvoiceStartDate] = useState<Date | null>(null);
  const [invoiceEndDate, setInvoiceEndDate] = useState<Date | null>(null);
  const ordersPerPage = 10;
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        `${baseUrl}/order/delete/${company._id}/${orderId}`,
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
        // Remove the deleted order from the state
        setFilteredOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId)
        );
      } else {
        toast.dismiss();
        toast.error("Failed to delete order");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while deleting the order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
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

        <div className="grid gap-6 md:grid-cols-3">
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
                <Button variant="outline" size="icon" onClick={toggleStatus}>
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
            <CardTitle>Orders and Invoices</CardTitle>
            <CardDescription>
              Manage orders and generate invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="invoices">Generate Invoice</TabsTrigger>
              </TabsList>
              <TabsContent value="orders">
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-1/3">
                      <Label htmlFor="startDate">Start Date</Label>
                      <DatePicker
                        id="startDate"
                        selected={startDate}
                        onChange={(date: Date | null) => {
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
                        onChange={(date: Date | null) => {
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
                  {isMobile ? (
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
                                    onClick={() => handleDeleteOrder(order._id)}
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
                                    onClick={() => handleDeleteOrder(order._id)}
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
                        onChange={(date: Date | null) =>
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
                        onChange={(date: Date | null) =>
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
    </div>
  );
}
