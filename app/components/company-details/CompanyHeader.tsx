"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
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
  FileText,
  DollarSign,
  Loader,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

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

interface CompanyHeaderProps {
  company: Company;
  isActive: boolean;
  isLoading: boolean;
  onBack: () => void;
  onToggleStatus: () => Promise<void>;
}

export function CompanyHeader({
  company,
  isActive,
  isLoading,
  onBack,
  onToggleStatus,
}: CompanyHeaderProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPinCode, setShowPinCode] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <Card className="mb-6 border-0 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 bg-white border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <Avatar className="h-16 w-16 mr-4 border-2 border-gray-100">
              <AvatarImage
                src={`https://avatar.vercel.sh/${company.name}.png`}
                alt={company.name}
              />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xl">
                {company.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {company.name}
              </CardTitle>
              <CardDescription className="text-gray-500 flex items-center mt-1">
                <Building className="h-4 w-4 mr-1" />
                {company.companyNumber}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full px-4 ${
                      isActive
                        ? "border-green-200 bg-green-50 hover:bg-green-100"
                        : "border-red-200 bg-red-50 hover:bg-red-100"
                    }`}
                    onClick={onToggleStatus}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : isActive ? (
                      <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    {isActive ? "Active" : "Inactive"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle company status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Contact Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm text-gray-700">
                  {company.managerEmail}
                </span>
              </div>
              <div className="flex items-start">
                <Phone className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm text-gray-700">
                  {company.deviceSerialNumber}
                </span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm text-gray-700">{`${company.address.city}, ${company.address.postNumber}`}</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Account Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <CreditCard className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm text-gray-700">
                  Credit Limit: {company.creditLimit}
                </span>
              </div>
              <div className="flex items-start">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm text-gray-700">
                  Registered: {formatDate(company.registredDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Security</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Key className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700 mr-2">
                  Manager Password:
                </span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                  {showPassword ? company.managerPassword : "••••••"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-1 h-6 w-6 p-0"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </Button>
              </div>
              <div className="flex items-center">
                <Key className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700 mr-2">PIN Code:</span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                  {showPinCode ? company.pinCode : "••••"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPinCode(!showPinCode)}
                  className="ml-1 h-6 w-6 p-0"
                >
                  {showPinCode ? (
                    <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Quick Actions
            </h3>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => {}}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => {}}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
