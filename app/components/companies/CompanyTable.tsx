// Update in app/components/companies/CompanyTable.tsx
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
  MoreHorizontal,
  Edit,
  Trash,
  RefreshCw,
  Key,
  ExternalLink,
  DollarSign,
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
  handleAddPayment: (id: string, name: string) => void; // New handler
}

export function CompanyTable({
  companies,
  handleEdit,
  handleDelete,
  handleResetPassword,
  handleResetPin,
  handleStatusChange,
  handleAddPayment, // New handler
}: CompanyTableProps) {
  const getDropdownItems = (company: Company) => [
    {
      icon: ExternalLink,
      label: "Manage Company",
      onClick: () => {},
      link: `/company/${company._id}`,
    },
    {
      icon: Edit,
      label: "Edit",
      onClick: () => handleEdit(company),
    },
    {
      icon: DollarSign,
      label: "Add Payment",
      onClick: () => handleAddPayment(company._id, company.name),
    },
    { isSeparator: true },
    {
      icon: Key,
      label: "Reset Password",
      onClick: () => handleResetPassword(company._id),
    },
    {
      icon: RefreshCw,
      label: "Reset PIN",
      onClick: () => handleResetPin(company._id),
    },
    { isSeparator: true },
    {
      icon: Trash,
      label: "Delete",
      onClick: () => handleDelete(company._id),
      className: "text-red-600",
    },
  ];

  return (
    <div className="w-full overflow-x-auto table:overflow-x-visible p-5 bg-white rounded-xl">
      <Table>
        <TableBody className="divide-y divide-gray-200">
          {companies?.length &&
            companies.map((company, index) => (
              <TableRow key={company._id} className="hover:rounded-xl">
                <TableCell className="py-4">{company?.companyNumber}</TableCell>
                <TableCell className="py-4">{company?.name}</TableCell>
                <TableCell className="py-4">{company?.managerEmail}</TableCell>
                <TableCell className="py-4">
                  {company?.creditLimit} kr
                </TableCell>
                <TableCell className="py-4">{company?.address.city}</TableCell>
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
                    <DropdownMenuContent align="end" className="w-56 p-2">
                      {getDropdownItems(company).map((item: any, index) =>
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
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
