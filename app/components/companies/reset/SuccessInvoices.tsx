"use client";

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
import { baseUrl } from "~/constants/api";

interface SuccessInvoicesProps {
  token: string;
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

export function SuccessInvoices({ token }: SuccessInvoicesProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/order/getCompInvoiceS`, {
          method: "POST",

          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setInvoices(data.Invoicelist);
          setFilteredInvoices(data.Invoicelist);
        }
      } catch (error) {
        console.error("Error fetching success invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [token]);

  useEffect(() => {
    if (startDate && endDate) {
      const filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.fromDate);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
      setFilteredInvoices(filtered);
      setCurrentPage(1);
    } else {
      setFilteredInvoices(invoices);
    }
  }, [startDate, endDate, invoices]);

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <DatePicker
          selected={startDate}
          onChange={(date: any) => setStartDate(date)}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={(date: any) => setEndDate(date)}
          placeholderText="End Date"
        />
      </div>

      <p className="mb-4">
        Total Amount: {totalAmount ? totalAmount.toFixed(2) : totalAmount} SEK
      </p>

      {loading ? (
        <p>Loading success invoices...</p>
      ) : isMobile ? (
        <div className="space-y-4">
          {paginatedInvoices.map((invoice) => (
            <Card key={invoice._id}>
              <CardContent className="p-4">
                <p>
                  <strong>Company:</strong> {invoice.companyname}
                </p>
                <p>
                  <strong>From:</strong>{" "}
                  {new Date(invoice.fromDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>To:</strong>{" "}
                  {new Date(invoice.toDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {invoice.invoiceStatus}
                </p>
                <p>
                  <strong>Amount:</strong> {invoice.totalAmount?.toFixed(2)} SEK
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>From Date</TableHead>
              <TableHead>To Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>{invoice.companyname}</TableCell>
                <TableCell>
                  {new Date(invoice.fromDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(invoice.toDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{invoice.invoiceStatus}</TableCell>
                <TableCell>{invoice.totalAmount?.toFixed(2)} SEK</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="mt-4 flex justify-center space-x-2">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
