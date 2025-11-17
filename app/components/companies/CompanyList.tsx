
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyCard } from "./CompanyCard";
import { CompanyTable } from "./CompanyTable";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { LayoutGrid, List, AlertCircle } from "lucide-react";

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

interface CompanyListProps {
  companies: Company[];
  isLoading: boolean;
  handleEdit: (company: Company) => void;
  handleDelete: (id: string) => void;
  handleResetPassword: (id: string) => void;
  handleResetPin: (id: string) => void;
  handleStatusChange: (id: string, newStatus: boolean) => void;
  handleAddPayment: (id: string, name: string) => void;
}

export function CompanyList({
  companies,
  isLoading,
  handleEdit,
  handleDelete,
  handleResetPassword,
  handleResetPin,
  handleStatusChange,
  handleAddPayment,
}: CompanyListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // On mobile, always default to grid view
      if (mobile && viewMode !== "grid") {
        setViewMode("grid");
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [viewMode]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end mb-4">
          <div className="bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-md"
              disabled
            >
              <LayoutGrid className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-md"
              disabled
            >
              <List className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                  <div className="pt-4 flex justify-between">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg border shadow-sm">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          No Companies Found
        </h3>
        <p className="text-gray-500 mt-1 max-w-md">
          We couldn't find any companies matching your criteria. Try changing
          your filters or create a new company.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isMobile && (
        <div className="flex justify-end mb-2">
          <div className="bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className={`h-9 w-9 p-0 rounded-md ${
                viewMode === "grid" ? "bg-white shadow-sm" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className={`h-9 w-9 p-0 rounded-md ${
                viewMode === "table" ? "bg-white shadow-sm" : ""
              }`}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === "grid" || isMobile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {companies.map((company) => (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <CompanyCard
                    company={company}
                    onEdit={() => handleEdit(company)}
                    onDelete={() => handleDelete(company._id)}
                    onResetPassword={() => handleResetPassword(company._id)}
                    onResetPin={() => handleResetPin(company._id)}
                    onStatusChange={(newStatus) =>
                      handleStatusChange(company._id, newStatus)
                    }
                    onAddPayment={() =>
                      handleAddPayment(company._id, company.name)
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <CompanyTable
            companies={companies}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleResetPassword={handleResetPassword}
            handleResetPin={handleResetPin}
            handleStatusChange={handleStatusChange}
            handleAddPayment={handleAddPayment}
          />
        )}
      </motion.div>
    </div>
  );
}
