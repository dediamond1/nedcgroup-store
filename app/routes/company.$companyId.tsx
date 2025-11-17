
import { useState, useEffect } from "react";
import { Loader, AlertCircle } from "lucide-react";
import {
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { requireUserToken } from "~/utils/auth.server";
import { baseUrl } from "~/constants/api";
import { ConfirmationModal } from "~/components/ui/ConfirmationModal";
import AddPaymentModal from "~/components/ui/PaymentHistoryModal";

// Import our new components
import { CompanyHeader } from "~/components/company-details/CompanyHeader";
import { SalesOverview } from "~/components/company-details/SalesOverview";
import { OrdersTab } from "~/components/company-details/OrdersTab";
import { InvoicesTab } from "~/components/company-details/InvoicesTab";
import { PaymentsTab } from "~/components/company-details/PaymentsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Types
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

type OrderType = "comviq" | "lyca" | "telia" | "halebop";

export const loader: LoaderFunction = async ({ params, request }) => {
  const token = await requireUserToken(request);
  const companyResponse = await fetch(
    `${baseUrl}/company/${params.companyId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!companyResponse.ok) throw new Error("Failed to fetch company details");

  const company = await companyResponse.json();

  const [
    comviqOrders,
    lycaOrders,
    teliaOrders,
    halebopOrders,
    salesData,
    paymentHistory,
  ] = await Promise.all([
    fetch(`${baseUrl}/order/detail/${company.company._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => (res.ok ? res.json() : { orderlist: [] })),
    fetch(`${baseUrl}/lyca-order/detail/${company.company._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => (res.ok ? res.json() : { orderlist: [] })),
    fetch(`${baseUrl}/teliaOrder/detail/${company.company._id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ operator: "telia" }),
    }).then((res) => (res.ok ? res.json() : { orderlist: [] })),
    fetch(`${baseUrl}/teliaOrder/detail/${company.company._id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ operator: "halebop" }),
    }).then((res) => (res.ok ? res.json() : { orderlist: [] })),
    fetch(
      `${baseUrl}/order/dailysale/${company.company._id}?includePrevious=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((res) => (res.ok ? res.json() : { companySelling: [] })),
    fetch(`${baseUrl}/paidhistory/${company.company._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => (res.ok ? res.json() : { orderHistoryList: [] })),
  ]);

  return json({
    company: company.company,
    comviqOrders: comviqOrders.orderlist,
    lycaOrders: lycaOrders.orderlist,
    teliaOrders: teliaOrders.orderlist,
    halebopOrders: halebopOrders.orderlist,
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
    teliaOrders,
    halebopOrders,
    salesData,
    paymentHistory: initialPaymentHistory,
    token,
  } = useLoaderData<{
    company: Company;
    comviqOrders: Order[];
    lycaOrders: Order[];
    teliaOrders: Order[];
    halebopOrders: Order[];
    salesData: SalesData[];
    paymentHistory: PaymentHistory[];
    token: string;
  }>();

  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(company.IsActive);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] =
    useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [isDeleteOrderModalOpen, setIsDeleteOrderModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const toggleStatus = async () => {
    const newStatus = !isActive;
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/company/status/${company._id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setIsActive(newStatus);
        toast.success(
          `Company status updated to ${newStatus ? "active" : "inactive"}`
        );
      } else {
        toast.error("Failed to update company status");
      }
    } catch (error) {
      toast.error("An error occurred while updating the company status");
    } finally {
      setIsLoading(false);
    }
  };

  const [orders, setOrders] = useState({
    comviq: comviqOrders,
    lyca: lycaOrders,
    telia: teliaOrders,
    halebop: halebopOrders,
  });

  const refetchOrders = async () => {
    try {
      const [comviq, lyca, telia, halebop] = await Promise.all([
        fetch(`${baseUrl}/order/detail/${company._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : { orderlist: [] })),
        fetch(`${baseUrl}/lyca-order/detail/${company._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : { orderlist: [] })),
        fetch(`${baseUrl}/teliaOrder/detail/${company._id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ operator: "telia" }),
        }).then((res) => (res.ok ? res.json() : { orderlist: [] })),
        fetch(`${baseUrl}/teliaOrder/detail/${company._id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ operator: "halebop" }),
        }).then((res) => (res.ok ? res.json() : { orderlist: [] })),
      ]);

      setOrders({
        comviq: comviq.orderlist,
        lyca: lyca.orderlist,
        telia: telia.orderlist,
        halebop: halebop.orderlist,
      });
    } catch (error) {
      toast.error("Failed to refresh orders");
    }
  };

  const handleDeleteOrder = async (
    orderId: string,
    orderType?: "comviq" | "lyca" | "telia" | "halebop",
    operator?: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      let url;
      if (orderType === "telia" || orderType === "halebop") {
        url = `${baseUrl}/teliaOrder/delete/${orderId}/${company._id}/${operator}`;
      } else if (orderType === "lyca") {
        url = `${baseUrl}/lyca-order/delete/${orderId}/${company._id}`;
      } else {
        url = `${baseUrl}/order/delete/${orderId}/${company._id}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Order deleted successfully");
        await refetchOrders();
      } else {
        toast.error("Failed to delete order");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the order");
    } finally {
      setIsLoading(false);
      setIsDeleteOrderModalOpen(false);
    }
  };

  const [paymentHistory, setPaymentHistory] = useState(initialPaymentHistory);
  const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
  const [adminNames, setAdminNames] = useState<Record<string, string>>({});
  const paymentsPerPage = 10;

  const refetchPayments = async () => {
    try {
      const response = await fetch(`${baseUrl}/paidhistory/${company._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const payments = data.orderHistoryList || [];

        // Fetch admin names for any new entries
        const newAdminIds = payments
          .map((p: PaymentHistory) => p.EnteredBy)
          .filter((id: any) => !adminNames[id]);

        if (newAdminIds.length > 0) {
          const namesResponse = await fetch(`${baseUrl}/admin/names`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ adminIds: newAdminIds }),
          });

          if (namesResponse.ok) {
            const namesData = await namesResponse.json();
            setAdminNames((prev) => ({ ...prev, ...namesData }));
          }
        }

        return payments;
      }
      return [];
    } catch (error) {
      toast.error("Failed to refresh payments");
      return [];
    }
  };

  const handleDeletePayment = async (paymentId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/paidhistory/${paymentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Payment deleted successfully");
        const updatedPayments = await refetchPayments();
        setPaymentHistory(updatedPayments);
      } else {
        toast.error("Failed to delete payment");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the payment");
    } finally {
      setIsLoading(false);
      setIsDeletePaymentModalOpen(false);
    }
  };

  const handlePaymentSuccess = async () => {
    const updatedPayments = await refetchPayments();
    setPaymentHistory(updatedPayments);
    setCurrentPaymentPage(1); // Reset to first page when new payment is added
    toast.success("Payment added successfully");
  };

  // Get current payments for pagination
  const indexOfLastPayment = currentPaymentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = paymentHistory.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );
  const totalPaymentPages = Math.ceil(paymentHistory.length / paymentsPerPage);

  return (
    <div className="min-h-screen mx-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <CompanyHeader
          company={company}
          isActive={isActive}
          isLoading={isLoading}
          onBack={() => navigate("/companies")}
          onToggleStatus={toggleStatus}
        />

        <SalesOverview salesData={salesData} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent h-12">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab
              comviqOrders={orders.comviq}
              lycaOrders={orders.lyca}
              teliaOrders={orders.telia}
              halebopOrders={orders.halebop}
              onDeleteOrder={handleDeleteOrder}
              onRequestDelete={(orderId, orderType, operator) => {
                setOrderToDelete(orderId);
                setIsDeleteOrderModalOpen(true);
              }}
              isMobile={isMobile}
            />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesTab
              companyId={company._id}
              token={token}
              isLoading={isLoading}
              onGenerateInvoice={async (startDate, endDate) => {
                setIsLoading(true);
                try {
                  // Format dates as YYYY-MM-DD strings
                  const formatDate = (date: Date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                  };

                  const response = await fetch(
                    `${baseUrl}/order/getInvoicebydate/${company._id}`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        fromdate: formatDate(startDate),
                        todate: formatDate(endDate),
                      }),
                    }
                  );
                  if (response.ok) {
                    const result = await response.json();
                    toast.success(
                      result.message || "Invoice generated successfully"
                    );
                  } else {
                    toast.error("Failed to generate invoice");
                  }
                } catch (error) {
                  toast.error("An error occurred while generating the invoice");
                } finally {
                  setIsLoading(false);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab
              paymentHistory={currentPayments}
              adminNames={adminNames}
              token={token}
              companyId={company._id}
              isLoading={isLoading}
              currentPage={currentPaymentPage}
              totalPages={totalPaymentPages}
              onPageChange={setCurrentPaymentPage}
              onAddPayment={() => setIsAddPaymentModalOpen(true)}
              onDeletePayment={async (paymentId) => {
                setPaymentToDelete(paymentId);
                setIsDeletePaymentModalOpen(true);
              }}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      <Toaster position="top-right" />
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <Loader className="h-5 w-5 text-blue-600 animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeletePaymentModalOpen}
        onClose={() => setIsDeletePaymentModalOpen(false)}
        onConfirm={() =>
          paymentToDelete && handleDeletePayment(paymentToDelete)
        }
        title="Delete Payment"
        message="Are you sure you want to delete this payment?"
      />

      <ConfirmationModal
        isOpen={isDeleteOrderModalOpen}
        onClose={() => setIsDeleteOrderModalOpen(false)}
        onConfirm={() => orderToDelete && handleDeleteOrder(orderToDelete)}
        title="Delete Order"
        message="Are you sure you want to delete this order?"
      />

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
    : "Oops! Something went wrong.";
  const errorMessage = isRouteErrorResponse(error)
    ? error.data
    : "An unexpected error occurred.";

  return (
    <div className="min-h-screen fixed w-full bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg p-8 shadow-md">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {errorTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
}
