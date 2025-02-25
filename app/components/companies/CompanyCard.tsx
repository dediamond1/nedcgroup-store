import { motion } from "framer-motion";
import {
  Edit,
  Trash,
  RefreshCw,
  Key,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Switch } from "~/components/ui/switch";
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
}

export function CompanyCard({
  company,
  onEdit,
  onDelete,
  onResetPassword,
  onResetPin,
  onStatusChange,
}: CompanyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {company.name}
              </CardTitle>
              <p className="text-sm text-gray-500">{company.companyNumber}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {company.IsActive ? "Active" : "Inactive"}
              </span>
              <Switch
                checked={company.IsActive}
                onCheckedChange={onStatusChange}
                aria-label="Toggle company status"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Manager</p>
              <p className="font-medium truncate" title={company.managerEmail}>
                {company.managerEmail}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Credit Limit</p>
              <p className="font-medium">{company.creditLimit}</p>
            </div>
            <div>
              <p className="text-gray-500">City</p>
              <p className="font-medium">{company.address.city}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="h-10">
                  <Link to={`/company/${company._id}`}>
                    <ExternalLink className="mr-2 h-5 w-5" />
                    <span>Manage Company</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit} className="h-10">
                  <Edit className="mr-2 h-5 w-5" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onResetPassword} className="h-10">
                  <Key className="mr-2 h-5 w-5" />
                  <span>Reset Password</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onResetPin} className="h-10">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  <span>Reset PIN</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="h-10 text-red-600"
                >
                  <Trash className="mr-2 h-5 w-5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
