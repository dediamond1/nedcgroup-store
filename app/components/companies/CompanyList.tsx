"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { CompanyCard } from "./CompanyCard";
import { CompanyTable } from "./CompanyTable";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

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
}

export function CompanyList({
  companies,
  isLoading,
  handleEdit,
  handleDelete,
  handleResetPassword,
  handleResetPin,
  handleStatusChange,
}: CompanyListProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Adjusted breakpoint for better table display
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isMobile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {companies.map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                onEdit={() => handleEdit(company)}
                onDelete={() => handleDelete(company._id)}
                onResetPassword={() => handleResetPassword(company._id)}
                onResetPin={() => handleResetPin(company._id)}
                onStatusChange={(newStatus) =>
                  handleStatusChange(company._id, newStatus)
                }
              />
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
        />
      )}
    </div>
  );
}
