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
  const [originalAmount, setOriginalAmount] = useState<string>("");
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountChange = (value: string) => {
    setOriginalAmount(value);

    // Calculate amount + 9% in real-time
    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      const totalWithCommission = amount * 1.09; // Add 9% to the amount
      setCommissionAmount(totalWithCommission);
    } else {
      setCommissionAmount(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && originalAmount && !isLoading) {
      handleAddPayment();
    }
  };

  const handleAddPayment = async () => {
    if (!originalAmount || isNaN(Number(originalAmount))) {
      toast.error("Vänligen ange ett giltigt betalningsbelopp");
      return;
    }

    setIsLoading(true);
    toast.loading("Lägger till betalning...");

    try {
      const response = await fetch(`${baseUrl}/paidhistory/${companyId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "",
          PaidAmount: commissionAmount.toFixed(2), // Save the amount with +9%
        }),
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("Betalning tillagd framgångsrikt");
        setOriginalAmount("");
        setCommissionAmount(0);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.dismiss();
        toast.error("Misslyckades att lägga till betalning");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Ett fel uppstod vid tillägg av betalning");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Lägg till betalning - ${companyName}`}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="paymentAmount">Betalningsbelopp (SEK)</Label>
          <div className="relative mt-1">
            <Input
              id="paymentAmount"
              type="number"
              value={originalAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ange betalningsbelopp"
              className="pl-8"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {commissionAmount > 0 && (
          <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="text-sm text-blue-800">
              <div className="font-medium">Totalt med 9% provision: {commissionAmount.toFixed(2)} SEK</div>
              <div className="text-xs mt-1">
                Ursprungligt belopp: {originalAmount} SEK (+9% = {(!isNaN(parseFloat(originalAmount)) ? (parseFloat(originalAmount) * 0.09).toFixed(2) : '0.00')} SEK)
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Avbryt
          </Button>
          <Button
            onClick={handleAddPayment}
            disabled={isLoading || !originalAmount}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Bearbetar...
              </>
            ) : (
              "Lägg till betalning"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
