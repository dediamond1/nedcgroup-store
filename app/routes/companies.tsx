"use client";

import { useState, useEffect, useCallback } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { create } from "apisauce";
import { toast, Toaster } from "react-hot-toast";
import { debounce } from "lodash-es";

import { requireUserToken } from "~/utils/auth.server";
import { baseUrl } from "~/constants/api";
import { HeroSection } from "~/components/companies/HeroSection";
import { RegistrationTrends } from "~/components/companies/RegistrationTrends";
import { CompanyList } from "~/components/companies/CompanyList";
import { Pagination } from "~/components/companies/Pagination";
import { CompanyModal } from "~/components/companies/CompanyModal";
import Spinner from "~/components/ui/Spinner";
import { ConfirmationModal } from "~/components/ui/ConfirmationModal";

// API setup
const api = create({
  baseURL: baseUrl,
});

// Types
interface Company {
  _id: string;
  name: string;
  companyNumber: string;
  IsActive: boolean;
  deviceSerialNumber: string;
  managerEmail: string;
  orgNumber: number;
  creditLimit: string;
  address: {
    city: string;
    postNumber: string;
  };
  registredDate: string;
}

interface RegistrationTrend {
  month: string;
  count: number;
  percentageChange: number;
}

interface LoaderData {
  companies: Company[];
  registrationTrends: RegistrationTrend[];
  token: string;
  totalCompanies: number;
}

// Helper function to decode text
const decodeText = (text: string): string => {
  if (typeof text !== "string") return text;
  try {
    return decodeURIComponent(text.replace(/\+/g, " "));
  } catch (e) {
    console.error("Decoding failed", e);
    return text;
  }
};

// Helper function to calculate registration trends
const calculateRegistrationTrends = (
  companies: Company[]
): RegistrationTrend[] => {
  // ... (keep the existing implementation)
  const trends: RegistrationTrend[] = [];
  const companiesByMonth = companies.reduce((acc, company) => {
    const month = company.registredDate.slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const sortedMonths = Object.keys(companiesByMonth).sort();

  for (let i = 0; i < sortedMonths.length; i++) {
    const month = sortedMonths[i];
    const count = companiesByMonth[month];
    const previousMonthCount =
      i > 0 ? companiesByMonth[sortedMonths[i - 1]] : 0;
    const percentageChange =
      previousMonthCount === 0
        ? 100
        : ((count - previousMonthCount) / previousMonthCount) * 100;
    trends.push({ month, count, percentageChange });
  }

  return trends;
};

// Loader function
export const loader: LoaderFunction = async ({ request }) => {
  const token = await requireUserToken(request);
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search") || "";
  const isActive = url.searchParams.get("isActive");
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);

  const response = (await api.get(
    "/company",
    {
      search: searchTerm,
      isActive: isActive,
      page: page,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Charset": "UTF-8",
      },
    }
  )) as any;

  if (!response.ok) {
    throw new Error("Failed to fetch companies");
  }

  const companies = response.data.companylist.map((company: Company) => ({
    ...company,
    name: decodeText(company.name),
    address: {
      ...company.address,
      city: decodeText(company.address.city),
      postNumber: decodeText(company.address.postNumber),
    },
  }));
  const registrationTrends = calculateRegistrationTrends(companies);
  const totalCompanies = response.data.totalCompanies || companies.length;

  return json({ companies, registrationTrends, token, totalCompanies });
};

export default function Companies() {
  const {
    companies: initialCompanies,
    registrationTrends,
    token,
    totalCompanies,
  } = useLoaderData<LoaderData>();
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [filteredCompanies, setFilteredCompanies] =
    useState<Company[]>(initialCompanies);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [isActive, setIsActive] = useState<string>(
    searchParams.get("isActive") || "all"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "create">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    Number.parseInt(searchParams.get("page") || "1", 10)
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [companyToResetPassword, setCompanyToResetPassword] = useState<
    string | null
  >(null);
  const [companyToResetPin, setCompanyToResetPin] = useState<string | null>(
    null
  );
  const [companyToChangeStatus, setCompanyToChangeStatus] = useState<
    string | null
  >(null);
  const [newStatus, setNewStatus] = useState<boolean>(false);
  const companiesPerPage = 10;
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
      filterCompanies(value, isActive);
    }, 300),
    [isActive]
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleReset = useCallback(() => {
    setSearchTerm("");
    setIsActive("all");
    setCurrentPage(1);
    setFilteredCompanies(companies);
  }, [companies]);

  const filterCompanies = useCallback(
    (search: string, active: string) => {
      let filtered = companies;

      if (search) {
        filtered = filtered.filter((company) =>
          Object.values(company).some(
            (value) =>
              typeof value === "string" &&
              value.toLowerCase().includes(search.toLowerCase())
          )
        );
      }

      if (active !== "all") {
        filtered = filtered.filter(
          (company) => company.IsActive === (active === "active")
        );
      }

      setFilteredCompanies(filtered);
    },
    [companies]
  );

  const handleFilterChange = (value: string) => {
    setIsActive(value);
    setCurrentPage(1);
    filterCompanies(searchTerm, value);
  };

  const handleEdit = (company: Company) => {
    setCurrentCompany(company);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentCompany(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await api.delete(
        `/company/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        toast.success("Company deleted successfully");
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company._id !== id)
        );
        filterCompanies(searchTerm, isActive);
      } else {
        toast.error("Failed to delete company");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the company");
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setCompanyToDelete(null);
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await api.post(
        "/company/resetPassword",
        { cid: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        toast.success("Password reset successfully");
      } else {
        toast.error("Failed to reset password");
      }
    } catch (error) {
      toast.error("An error occurred while resetting the password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPin = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await api.post(
        "/company/resetPin",
        { cid: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        toast.success("PIN reset successfully");
      } else {
        toast.error("Failed to reset PIN");
      }
    } catch (error) {
      toast.error("An error occurred while resetting the PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (companyData: Company) => {
    try {
      setIsLoading(true);
      let response;
      if (modalMode === "create") {
        response = (await api.post("/company", companyData, {
          headers: { Authorization: `Bearer ${token}` },
        })) as any;
      } else {
        response = await api.put("/company", companyData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (response.ok) {
        toast.success(
          `Company ${
            modalMode === "create" ? "created" : "updated"
          } successfully`
        );
        setIsModalOpen(false);
        if (modalMode === "create") {
          setCompanies((prevCompanies) => [...prevCompanies, response.data]);
        } else {
          setCompanies((prevCompanies) =>
            prevCompanies.map((company) =>
              company._id === companyData._id ? companyData : company
            )
          );
        }
        filterCompanies(searchTerm, isActive);
      } else {
        toast.error(`Failed to ${modalMode} company`);
      }
    } catch (error) {
      toast.error(
        `An error occurred while ${
          modalMode === "create" ? "creating" : "updating"
        } the company`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/company/status/${id}`,
        { IsActive: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        toast.success("Company status updated successfully");
        setCompanies((prevCompanies) =>
          prevCompanies.map((company) =>
            company._id === id ? { ...company, IsActive: newStatus } : company
          )
        );
        filterCompanies(searchTerm, isActive);
      } else {
        toast.error("Failed to update company status");
      }
    } catch (error) {
      toast.error("An error occurred while updating the company status");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    filterCompanies(searchTerm, isActive);
  }, [filterCompanies, searchTerm, isActive]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newSearchParams.set("search", searchTerm);
    } else {
      newSearchParams.delete("search");
    }
    if (isActive !== "all") {
      newSearchParams.set("isActive", isActive);
    } else {
      newSearchParams.delete("isActive");
    }
    newSearchParams.set("page", currentPage.toString());
    setSearchParams(newSearchParams);
  }, [searchTerm, isActive, currentPage, setSearchParams]);

  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfFirstCompany,
    indexOfLastCompany
  );
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Spinner />
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <RegistrationTrends trends={registrationTrends} />
        <HeroSection
          companyCount={companies.length}
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          handleFilterChange={handleFilterChange}
          isActive={isActive}
          handleCreate={handleCreate}
          handleReset={handleReset}
        />

        <div className="mt-8">
          {filteredCompanies.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>No companies found</p>
            </div>
          ) : (
            <CompanyList
              companies={currentCompanies}
              isLoading={isLoading}
              handleEdit={(data: any) => handleEdit(data)}
              handleDelete={(id) => {
                setIsDeleteModalOpen(true);
                setCompanyToDelete(id);
              }}
              handleResetPassword={(id) => {
                setIsResetPasswordModalOpen(true);
                setCompanyToResetPassword(id);
              }}
              handleResetPin={(id) => {
                setIsResetPinModalOpen(true);
                setCompanyToResetPin(id);
              }}
              handleStatusChange={(id, status) => {
                setIsChangeStatusModalOpen(true);
                setCompanyToChangeStatus(id);
                setNewStatus(status);
              }}
            />
          )}
        </div>

        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data: any) => handleSubmit(data)}
        modalMode={modalMode}
        currentCompany={currentCompany}
      />

      <ConfirmationModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onConfirm={() => {
          if (companyToResetPassword) {
            handleResetPassword(companyToResetPassword);
          }
        }}
        title="Confirm Password Reset"
        message={`Are you sure you want to reset the password for this company?`}
        confirmText="Reset Password"
        cancelText="Cancel"
      />
      <ConfirmationModal
        isOpen={isResetPinModalOpen}
        onClose={() => setIsResetPinModalOpen(false)}
        onConfirm={() => {
          if (companyToResetPin) {
            handleResetPin(companyToResetPin);
          }
        }}
        title="Confirm PIN Reset"
        message={`Are you sure you want to reset the PIN for this company?`}
        confirmText="Reset PIN"
        cancelText="Cancel"
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (companyToDelete) {
            handleDelete(companyToDelete);
          }
        }}
        title="Confirm Delete"
        message="Are you sure you want to delete this company?"
        confirmText="Delete"
        cancelText="Cancel"
      />
      <ConfirmationModal
        isOpen={isChangeStatusModalOpen}
        onClose={() => setIsChangeStatusModalOpen(false)}
        onConfirm={() => {
          if (companyToChangeStatus !== null) {
            handleStatusChange(companyToChangeStatus, newStatus);
            setIsChangeStatusModalOpen(false);
          }
        }}
        title="Confirm Status Change"
        message={`Are you sure you want to change the status to ${
          newStatus ? "active" : "inactive"
        }?`}
        confirmText="Change Status"
        cancelText="Cancel"
      />
    </div>
  );
}
