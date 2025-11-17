
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { baseUrl } from "~/constants/api";

export interface FailedInvoicesProps {
  token: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface Invoice {
  _id: string;
  fromDate: string;
  toDate: string;
  invoiceStatus: string;
  companyId: string;
  companyname: string;
  totalAmount: number;
}

export function FailedInvoices({
  token,
  startDate: externalStartDate,
  endDate: externalEndDate,
}: FailedInvoicesProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [internalStartDate, setInternalStartDate] = useState<Date | null>(
    externalStartDate || null
  );
  const [internalEndDate, setInternalEndDate] = useState<Date | null>(
    externalEndDate || null
  );
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5; // Reduced for better UI

  // Update internal dates when external dates change
  useEffect(() => {
    if (externalStartDate !== undefined) {
      setInternalStartDate(externalStartDate);
    }
    if (externalEndDate !== undefined) {
      setInternalEndDate(externalEndDate);
    }
  }, [externalStartDate, externalEndDate]);

  // Detect mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);

      try {
        const requestBody: any = {};

        // Add date filters if provided
        if (internalStartDate && internalEndDate) {
          requestBody.fromDate = format(internalStartDate, "yyyy-MM-dd");
          requestBody.toDate = format(internalEndDate, "yyyy-MM-dd");
        }

        const response = await fetch(`${baseUrl}/order/getCompInvoiceF`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: Object.keys(requestBody).length
            ? JSON.stringify(requestBody)
            : undefined,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();

        if (data.message === "No Failed Invoices Data Found") {
          setInvoices([]);
          setFilteredInvoices([]);
          setTotalAmount(0);
        } else {
          setInvoices(data.Invoicelist || []);
          setFilteredInvoices(data.Invoicelist || []);

          // Calculate total amount
          const total = (data.Invoicelist || []).reduce(
            (sum: number, invoice: Invoice) => sum + (invoice.totalAmount || 0),
            0
          );
          setTotalAmount(total);
        }
      } catch (error) {
        console.error("Error fetching failed invoices:", error);
        setError("Failed to load invoice data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [token, internalStartDate, internalEndDate]);

  // Filter invoices when dates change
  useEffect(() => {
    if (internalStartDate && internalEndDate) {
      const filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.fromDate);
        return (
          invoiceDate >= internalStartDate && invoiceDate <= internalEndDate
        );
      });
      setFilteredInvoices(filtered);
      setCurrentPage(1);
    } else {
      setFilteredInvoices(invoices);
    }
  }, [internalStartDate, internalEndDate, invoices]);

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Only show internal date pickers if external ones aren't provided
  const showDatePickers =
    externalStartDate === undefined && externalEndDate === undefined;

  return (
    <div className="space-y-5">
      {showDatePickers && (
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="w-full sm:w-auto flex flex-1 flex-col min-w-[150px]">
            <div className="flex items-center mb-1">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm font-medium">Start Date</span>
            </div>
            <DatePicker
              selected={internalStartDate}
              onChange={(date: any) => setInternalStartDate(date)}
              placeholderText="Select start date"
            />
          </div>
          <div className="w-full sm:w-auto flex flex-1 flex-col min-w-[150px]">
            <div className="flex items-center mb-1">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm font-medium">End Date</span>
            </div>
            <DatePicker
              selected={internalEndDate}
              onChange={(date: any) => setInternalEndDate(date)}
              placeholderText="Select end date"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <h3 className="font-medium">Failed Invoices</h3>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            {filteredInvoices.length} Invoices
          </Badge>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Total Amount:{" "}
            <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border">
            <XCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">
              No failed invoices found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              No errors detected in the selected period
            </p>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {paginatedInvoices.map((invoice) => (
              <Card
                key={invoice._id}
                className="overflow-hidden border-l-4 border-l-red-400"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{invoice.companyname}</h3>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">From:</p>
                      <p>{formatDate(invoice.fromDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">To:</p>
                      <p>{formatDate(invoice.toDate)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Status:</p>
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700"
                      >
                        {invoice.invoiceStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Company</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {invoice.companyname}
                    </TableCell>
                    <TableCell>{formatDate(invoice.fromDate)}</TableCell>
                    <TableCell>{formatDate(invoice.toDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700"
                      >
                        {invoice.invoiceStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredInvoices.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
