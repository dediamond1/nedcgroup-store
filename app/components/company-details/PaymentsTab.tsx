
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  DollarSign,
  Plus,
  PlusCircle,
  Trash,
  Clock,
  UserCircle,
  Loader,
} from "lucide-react";
import { Button } from "~/components/ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface PaymentHistory {
  _id: string;
  companyId: string;
  EnteredBy: string;
  PaidAmount: string;
  PaidDate: string;
  id: string;
}

interface PaymentsTabProps {
  paymentHistory: PaymentHistory[];
  adminNames: Record<string, string>;
  token: string;
  companyId: string;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddPayment: () => void;
  onDeletePayment: (paymentId: string) => Promise<void>;
}

export function PaymentsTab({
  paymentHistory,
  adminNames,
  token,
  companyId,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onAddPayment,
  onDeletePayment,
}: PaymentsTabProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="p-0">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">Payment History</h3>
        <Button onClick={onAddPayment} className="flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {paymentHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No Payment History
          </h3>
          <p className="text-gray-500 mt-1">
            This company doesn't have any recorded payments yet.
          </p>
          <Button onClick={onAddPayment} className="mt-4">
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
              {paymentHistory.map((payment) => (
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
                      {adminNames[payment.EnteredBy] || payment.EnteredBy}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDeletePayment(payment._id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
