
import { useState } from "react";
import { FileText, AlertCircle, Loader } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface InvoicesTabProps {
  companyId: string;
  token: string;
  isLoading: boolean;
  onGenerateInvoice: (startDate: Date, endDate: Date) => Promise<void>;
}

export function InvoicesTab({
  companyId,
  token,
  isLoading,
  onGenerateInvoice,
}: InvoicesTabProps) {
  const [invoiceStartDate, setInvoiceStartDate] = useState<Date | null>(null);
  const [invoiceEndDate, setInvoiceEndDate] = useState<Date | null>(null);

  const handleGenerateInvoice = async () => {
    if (!invoiceStartDate || !invoiceEndDate) return;
    await onGenerateInvoice(invoiceStartDate, invoiceEndDate);
  };

  return (
    <CardContent className="p-4 md:p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <FileText className="h-12 w-12 text-blue-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Generate Invoice
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Create an invoice for this company for a specific date range
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
                  onChange={(date: Date | undefined) =>
                    setInvoiceStartDate(date || null)
                  }
                  className="w-full mt-1"
                  placeholderText="Select start date"
                />
              </div>
              <div>
                <Label htmlFor="invoiceEndDate" className="text-sm font-medium">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  id="invoiceEndDate"
                  selected={invoiceEndDate}
                  onChange={(date: Date | undefined) =>
                    setInvoiceEndDate(date || null)
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
  );
}
