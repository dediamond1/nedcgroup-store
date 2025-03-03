import { useState } from "react";
import { DollarSign, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { baseUrl } from "~/constants/api";
import Modal from "~/components/ui/Modal";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  token: string;
  onSuccess?: () => void;
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  token,
  onSuccess,
}: AddPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPayment = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount))) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsLoading(true);
    toast.loading("Adding payment...");

    try {
      const response = await fetch(`${baseUrl}/paidhistory/${companyId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "",
          PaidAmount: paymentAmount,
        }),
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("Payment added successfully");
        setPaymentAmount("");
        onClose();
        if (onSuccess) {
          onSuccess();
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Payment - ${companyName}`}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="paymentAmount">Payment Amount (SEK)</Label>
          <div className="relative mt-1">
            <Input
              id="paymentAmount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter payment amount"
              className="pl-8"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddPayment}
            disabled={isLoading || !paymentAmount}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Add Payment"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
