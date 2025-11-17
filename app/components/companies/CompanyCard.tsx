
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Key,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Mail,
  Building,
  MapPin,
  CreditCard,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Link } from "@remix-run/react";

interface Company {
  _id: string;
  name: string;
  companyNumber: string;
  IsActive: boolean;
  managerEmail: string;
  creditLimit: string;
  address: {
    city: string;
  };
}

interface CompanyCardProps {
  company: Company;
  onEdit: () => void;
  onDelete: () => void;
  onResetPassword: () => void;
  onResetPin: () => void;
  onStatusChange: (newStatus: boolean) => void;
  onAddPayment: () => void;
}

export function CompanyCard({
  company,
  onEdit,
  onDelete,
  onResetPassword,
  onResetPin,
  onStatusChange,
  onAddPayment,
}: CompanyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Create dropdown items similar to table component
  const getDropdownItems = () => [
    {
      icon: ExternalLink,
      label: "Manage Company",
      onClick: () => {},
      link: `/company/${company._id}`,
    },
    {
      icon: Edit,
      label: "Edit",
      onClick: onEdit,
    },
    {
      icon: DollarSign,
      label: "Add Payment",
      onClick: onAddPayment,
    },
    { isSeparator: true },
    {
      icon: Key,
      label: "Reset Password",
      onClick: onResetPassword,
    },
    {
      icon: RefreshCw,
      label: "Reset PIN",
      onClick: onResetPin,
    },
    { isSeparator: true },
    {
      icon: Trash,
      label: "Delete",
      onClick: onDelete,
      className: "text-red-600",
    },
  ];

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={`border overflow-hidden transition-shadow duration-200 ${
          isHovered ? "shadow-md" : "shadow-sm"
        }`}
      >
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 bg-primary-50">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {company.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-base text-gray-900 line-clamp-1">
                    {company.name}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Building className="h-3 w-3 mr-1" />
                    <span className="line-clamp-1">
                      {company.companyNumber}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                variant={company.IsActive ? "default" : "destructive"}
                className="ml-2 text-xs whitespace-nowrap"
              >
                {company.IsActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start">
                <Mail className="h-3.5 w-3.5 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm text-gray-600 line-clamp-1">
                  {company.managerEmail}
                </span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-3.5 w-3.5 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm text-gray-600">
                  {company.address.city}
                </span>
              </div>
              <div className="flex items-start">
                <CreditCard className="h-3.5 w-3.5 text-gray-500 mt-0.5 mr-2" />
                <span className="text-sm text-gray-600">
                  Credit Limit: {company.creditLimit}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-5 text-white bg-blue-500 hover:bg-blue-600 shadow-sm"
                  onClick={onAddPayment}
                >
                  <DollarSign className="h-4 w-4 mr-1.5" />
                  <span>Add Payment</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Payment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => onStatusChange(!company.IsActive)}
                  >
                    {company.IsActive ? (
                      <ToggleRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{company.IsActive ? "Deactivate" : "Activate"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    onClick={onEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Company</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                {getDropdownItems().map((item: any, index) =>
                  item.isSeparator ? (
                    <DropdownMenuSeparator key={index} />
                  ) : (
                    <DropdownMenuItem
                      key={index}
                      onClick={item.onClick}
                      className={`py-3 ${item.className || ""}`}
                    >
                      {item.link ? (
                        <Link
                          to={item.link}
                          className="flex items-center w-full"
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <>
                          <item.icon className="mr-3 h-4 w-4" />
                          <span>{item.label}</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
