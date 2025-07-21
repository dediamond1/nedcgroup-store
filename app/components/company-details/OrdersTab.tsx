"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  Trash,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Label } from "~/components/ui/label";

interface OrdersTabProps {
  comviqOrders: Array<{
    _id: string;
    voucherNumber: string;
    voucherDescription: string;
    voucherAmount: number;
    voucherCurrency: string;
    OrderDate: string;
    expireDate: string;
    serialNumber: string;
  }>;
  lycaOrders: Array<{
    _id: string;
    voucherNumber: string;
    voucherDescription: string;
    voucherAmount: number;
    voucherCurrency: string;
    OrderDate: string;
    expireDate: string;
    serialNumber: string;
  }>;
  teliaOrders: Array<{
    _id: string;
    voucherNumber: string;
    voucherDescription: string;
    voucherAmount: number;
    voucherCurrency: string;
    OrderDate: string;
    expireDate: string;
    serialNumber: string;
  }>;
  halebopOrders: Array<{
    _id: string;
    voucherNumber: string;
    voucherDescription: string;
    voucherAmount: number;
    voucherCurrency: string;
    OrderDate: string;
    expireDate: string;
    serialNumber: string;
  }>;
  onDeleteOrder: (
    orderId: string,
    orderType?: "comviq" | "lyca" | "telia" | "halebop",
    operator?: string
  ) => Promise<void>;
  isMobile: boolean;
  onRequestDelete?: (
    orderId: string,
    orderType?: "comviq" | "lyca" | "telia" | "halebop",
    operator?: string
  ) => void;
}

export function OrdersTab({
  comviqOrders = [],
  lycaOrders = [],
  teliaOrders = [],
  halebopOrders = [],
  onDeleteOrder,
  isMobile,
  onRequestDelete,
}: OrdersTabProps) {
  const [selectedOrderType, setSelectedOrderType] = useState<
    "comviq" | "lyca" | "telia" | "halebop"
  >("comviq");
  const orders =
    selectedOrderType === "comviq"
      ? comviqOrders || []
      : selectedOrderType === "lyca"
      ? lycaOrders || []
      : selectedOrderType === "telia"
      ? teliaOrders || []
      : halebopOrders || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (e) {
      return "Invalid date";
    }
  };

  const filteredOrders = orders
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
      if (startDate && !endDate) return orderDate >= startDate;
      if (!startDate && endDate) return orderDate <= endDate;
      if (startDate && endDate)
        return orderDate >= startDate && orderDate <= endDate;
      return true;
    });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="p-0">
      <div className="p-4 bg-white border-b">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by voucher number, description, or serial number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <Select
              value={selectedOrderType}
              onValueChange={(value: "comviq" | "lyca" | "telia" | "halebop") =>
                setSelectedOrderType(value)
              }
            >
              <SelectTrigger id="orderType" className="w-full md:w-36">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comviq">Comviq</SelectItem>
                <SelectItem value="lyca">Lyca</SelectItem>
                <SelectItem value="telia">Telia</SelectItem>
                <SelectItem value="halebop">Halebop</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <div className="w-40">
                <Label htmlFor="startDate" className="sr-only">
                  Start Date
                </Label>
                <DatePicker
                  id="startDate"
                  selected={startDate}
                  onChange={(date: Date | undefined) => {
                    setStartDate(date || null);
                    if (date && endDate && date > endDate) setEndDate(null);
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
                  onChange={(date: Date | undefined) => {
                    setEndDate(date || null);
                    if (date && startDate && date < startDate)
                      setStartDate(null);
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
          </div>
        </div>
      </div>

      <div className="p-0">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No Orders Found
            </h3>
            <p className="text-gray-500 mt-1">
              No orders match your search criteria. Try changing your filters.
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
              <div key={order._id}>
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
                          {order.voucherAmount} {order.voucherCurrency}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-0 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="text-sm">{order.voucherDescription}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Serial Number</p>
                          <p className="text-sm font-mono">
                            {order.serialNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Order Date</p>
                          <p className="text-sm">
                            {formatDate(order.OrderDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Expire Date</p>
                          <p className="text-sm">
                            {formatDate(order.expireDate)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() =>
                          onRequestDelete?.(
                            order._id,
                            selectedOrderType,
                            selectedOrderType === "telia"
                              ? "telia"
                              : selectedOrderType === "halebop"
                              ? "halebop"
                              : undefined
                          ) ||
                          onDeleteOrder(
                            order._id,
                            selectedOrderType,
                            selectedOrderType === "telia"
                              ? "telia"
                              : selectedOrderType === "halebop"
                              ? "halebop"
                              : undefined
                          )
                        }
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Order
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
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
                    <TableCell>{formatDate(order.OrderDate)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {order.serialNumber}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() =>
                          onRequestDelete?.(
                            order._id,
                            selectedOrderType,
                            selectedOrderType === "telia"
                              ? "telia"
                              : selectedOrderType === "halebop"
                              ? "halebop"
                              : undefined
                          ) ||
                          onDeleteOrder(
                            order._id,
                            selectedOrderType,
                            selectedOrderType === "telia"
                              ? "telia"
                              : selectedOrderType === "halebop"
                              ? "halebop"
                              : undefined
                          )
                        }
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
      </div>
    </div>
  );
}
