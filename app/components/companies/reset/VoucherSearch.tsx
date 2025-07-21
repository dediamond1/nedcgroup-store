"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { baseUrl } from "~/constants/api";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import {
  ChevronDown,
  Search,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  Hash,
  CreditCard,
} from "lucide-react";

interface VoucherSearchProps {
  token: string;
}

const operators = [
  { value: "comviq", label: "Comviq", color: "bg-purple-500" },
  { value: "lyca", label: "Lyca", color: "bg-orange-500" },
  { value: "telia", label: "Telia", color: "bg-blue-500" },
  { value: "halebop", label: "Halebop", color: "bg-green-500" },
];

// Custom Select Component with better positioning
const CustomSelect = ({ value, onValueChange, placeholder, options }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt: any) => opt.value === value);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 200; // Approximate dropdown height

      // Check if there's enough space below
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let top = buttonRect.bottom + window.scrollY;

      // If not enough space below but enough above, show above
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        top = buttonRect.top + window.scrollY - dropdownHeight;
      }

      setDropdownStyle({
        position: "fixed",
        top: buttonRect.bottom,
        left: buttonRect.left,
        width: buttonRect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
        >
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Portal-like dropdown using fixed positioning */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto"
        >
          {options.map((option: any) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
            >
              <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

// Custom Input Component
const CustomInput = ({ placeholder, value, onChange, className = "" }: any) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 placeholder-gray-500 ${className}`}
  />
);

// Custom Button Component
const CustomButton = ({ onClick, disabled, children, className = "" }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 ${className}`}
  >
    {children}
  </button>
);

export function VoucherSearch({ token }: VoucherSearchProps) {
  const [operator, setOperator] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async () => {
    if (!operator || !serialNumber) {
      toast.error("Vänligen välj operatör och ange ett serienummer.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/search?serialNumber=${serialNumber}&operator=${operator}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast.error("Ett tekniskt fel uppstod vid sökningen.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (!result.success) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                Fel uppstod
              </h3>
              <p className="text-red-700 mt-1">
                {result.message || "Ingen voucher hittades."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    const { data } = result;
    const { company } = data;
    const selectedOperator = operators.find((op) => op.value === data.operator);

    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg overflow-hidden">
        <div className="bg-green-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Voucher hittad!</h2>
              <p className="text-green-100 mt-1">Voucher information</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-lg p-5 border-2 border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Butiksinformation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <span className="text-sm text-gray-600">Butik</span>
                  <div className="font-semibold text-gray-900">
                    {company.name}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <span className="text-sm text-gray-600">Stad</span>
                  <div className="font-semibold text-gray-900">
                    {company.address.city}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <span className="text-sm text-gray-600">Postnummer</span>
                  <div className="font-semibold text-gray-900">
                    {company.address.postNumber}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <span className="text-sm text-gray-600">
                    Organisationsnummer
                  </span>
                  <div className="font-semibold text-gray-900">
                    {company.orgNumber}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voucher Information */}
          <div className="bg-white rounded-lg p-5 border-2 border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-500" />
              Voucher-detaljer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${selectedOperator?.color} mt-1.5`}
                ></div>
                <div>
                  <span className="text-sm text-gray-600">Operatör</span>
                  <div className="font-semibold text-gray-900 capitalize">
                    {data.operator}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Voucher-nummer</span>
                  <div className="font-semibold text-gray-900 font-mono">
                    {data.voucherNumber}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">
                    Registreringsdatum
                  </span>
                  <div className="font-semibold text-gray-900">
                    {format(
                      new Date(company.registredDate),
                      "PPP 'kl.' HH:mm",
                      {
                        locale: sv,
                      }
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Voucher datum</span>
                  <div className="font-semibold text-gray-900">
                    {format(new Date(data.orderDate), "PPP 'kl.' HH:mm", {
                      locale: sv,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-visible">
          <div className="bg-gray-100 px-8 py-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
              <Search className="w-6 h-6 text-blue-500" />
              Sök Voucher
            </h2>
            <p className="text-gray-600 mt-2">
              Välj operatör och ange serienummer för att söka
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Operatör
                </label>
                <CustomSelect
                  value={operator}
                  onValueChange={setOperator}
                  placeholder="Välj operatör"
                  options={operators}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Serienummer
                </label>
                <CustomInput
                  placeholder="Ange serienummer"
                  value={serialNumber}
                  onChange={(e: any) => setSerialNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  &nbsp;
                </label>
                <CustomButton
                  onClick={handleSearch}
                  disabled={isLoading || !operator || !serialNumber}
                  className="w-full h-12 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Söker...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Sök
                    </>
                  )}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {renderResult()}
      </div>
    </div>
  );
}
