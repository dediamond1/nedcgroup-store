import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  Edit,
  Trash,
  RefreshCw,
  Key,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { Link } from "@remix-run/react";
import { Switch } from "~/components/ui/switch";

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

interface CompanyTableProps {
  companies: Company[];
  handleEdit: (company: Company) => void;
  handleDelete: (id: string) => void;
  handleResetPassword: (id: string) => void;
  handleResetPin: (id: string) => void;
  handleStatusChange: (id: string, newStatus: boolean) => void;
}

export function CompanyTable({
  companies,
  handleEdit,
  handleDelete,
  handleResetPassword,
  handleResetPin,
  handleStatusChange,
}: CompanyTableProps) {
  return (
    <div className="w-full overflow-x-auto table:overflow-x-visible p-5 bg-white rounded-xl">
      <Table>
        <TableBody className="divide-y divide-gray-200">
          {companies.map((company, index) => (
            <TableRow key={company._id} className="hover:rounded-xl">
              <TableCell className="py-4">{company.companyNumber}</TableCell>
              <TableCell className="py-4">{company.name}</TableCell>
              <TableCell className="py-4">{company.managerEmail}</TableCell>
              <TableCell className="py-4">{company.creditLimit} kr</TableCell>
              <TableCell className="py-4">{company.address.city}</TableCell>
              <TableCell className="py-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={company.IsActive}
                    onCheckedChange={(checked) =>
                      handleStatusChange(company._id, checked)
                    }
                    aria-label="Toggle company status"
                  />
                  <span className="text-sm text-gray-500">
                    {company.IsActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/companies/${company._id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>Manage Company</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(company)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleResetPassword(company._id)}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      <span>Reset Password</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleResetPin(company._id)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      <span>Reset PIN</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(company._id)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
