
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import Modal from "~/components/ui/Modal";
import { Label } from "~/components/ui/label";

// Interface matching the backend expectations
interface CompanyFormData {
  id?: string; // Only for updates
  name: string;
  companyNumber: string;
  managerEmail: string;
  creditLimit: string;
  deviceSerialNumber?: string; // Optional - can be empty or any length
  orgNumber: number;
  city: string;
  postNumber: string;
}

// Interface for display/state management
interface Company extends Omit<CompanyFormData, "city" | "postNumber"> {
  address: {
    city: string;
    postNumber: string;
  };
}

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (company: CompanyFormData) => void;
  modalMode: "create" | "edit";
  currentCompany: Company | null;
}

export function CompanyModal({
  isOpen,
  onClose,
  onSubmit,
  modalMode,
  currentCompany,
}: CompanyModalProps) {
  const [company, setCompany] = useState<Company>({
    name: "",
    companyNumber: "",
    managerEmail: "",
    creditLimit: "",
    deviceSerialNumber: "",
    orgNumber: 0,
    address: {
      city: "",
      postNumber: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentCompany && modalMode === "edit") {
      setCompany(currentCompany);
    } else {
      setCompany({
        name: "",
        companyNumber: "",
        managerEmail: "",
        creditLimit: "",
        deviceSerialNumber: "",
        orgNumber: 0,
        address: {
          city: "",
          postNumber: "",
        },
      });
    }
    setErrors({});
  }, [currentCompany, modalMode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!company.name) newErrors.name = "Company name is required";
    if (!company.companyNumber)
      newErrors.companyNumber = "Company number is required";
    if (!company.managerEmail)
      newErrors.managerEmail = "Manager email is required";
    if (!company.creditLimit)
      newErrors.creditLimit = "Credit limit is required";
    // deviceSerialNumber validation removed - can be empty or any length
    if (!company.orgNumber)
      newErrors.orgNumber = "Organization number is required";
    if (!company.address.city) newErrors["address.city"] = "City is required";
    if (!company.address.postNumber)
      newErrors["address.postNumber"] = "Post number is required";

    if (!company.managerEmail.includes("@")) {
      newErrors.managerEmail = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setCompany((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (name === "orgNumber") {
      setCompany((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setCompany((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      // Transform the data to match backend expectations
      const formData: CompanyFormData = {
        name: company.name,
        companyNumber: company.companyNumber,
        managerEmail: company.managerEmail,
        creditLimit: company.creditLimit,
        deviceSerialNumber: company.deviceSerialNumber,
        orgNumber: company.orgNumber,
        city: company.address.city,
        postNumber: company.address.postNumber,
      };

      // Add id only for updates
      if (modalMode === "edit" && company.id) {
        //Fixed:  company._id changed to company.id
        formData.id = company.id;
      }

      onSubmit(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === "create" ? "Add New Company" : "Edit Company"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Company Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={company.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="companyNumber">Company Number</Label>
          <Input
            type="text"
            id="companyNumber"
            name="companyNumber"
            value={company.companyNumber}
            onChange={handleChange}
            className={errors.companyNumber ? "border-red-500" : ""}
          />
          {errors.companyNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.companyNumber}</p>
          )}
        </div>

        <div>
          <Label htmlFor="managerEmail">Manager Email</Label>
          <Input
            type="email"
            id="managerEmail"
            name="managerEmail"
            value={company.managerEmail}
            onChange={handleChange}
            className={errors.managerEmail ? "border-red-500" : ""}
          />
          {errors.managerEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.managerEmail}</p>
          )}
        </div>

        <div>
          <Label htmlFor="creditLimit">Credit Limit</Label>
          <Input
            type="text"
            id="creditLimit"
            name="creditLimit"
            value={company.creditLimit}
            onChange={handleChange}
            className={errors.creditLimit ? "border-red-500" : ""}
          />
          {errors.creditLimit && (
            <p className="text-red-500 text-sm mt-1">{errors.creditLimit}</p>
          )}
        </div>

        <div>
          <Label htmlFor="deviceSerialNumber">Device Serial Number (Optional)</Label>
          <Input
            type="text"
            id="deviceSerialNumber"
            name="deviceSerialNumber"
            value={company.deviceSerialNumber || ""}
            onChange={handleChange}
            className={errors.deviceSerialNumber ? "border-red-500" : ""}
            placeholder="Optional - can be empty or any length"
          />
          {errors.deviceSerialNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.deviceSerialNumber}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="orgNumber">Organization Number</Label>
          <Input
            type="number"
            id="orgNumber"
            name="orgNumber"
            value={company.orgNumber || ""}
            onChange={handleChange}
            className={errors.orgNumber ? "border-red-500" : ""}
          />
          {errors.orgNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.orgNumber}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address.city">City</Label>
          <Input
            type="text"
            id="address.city"
            name="address.city"
            value={company.address.city}
            onChange={handleChange}
            className={errors["address.city"] ? "border-red-500" : ""}
          />
          {errors["address.city"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["address.city"]}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="address.postNumber">Post Number</Label>
          <Input
            type="text"
            id="address.postNumber"
            name="address.postNumber"
            value={company.address.postNumber}
            onChange={handleChange}
            className={errors["address.postNumber"] ? "border-red-500" : ""}
          />
          {errors["address.postNumber"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["address.postNumber"]}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {modalMode === "create" ? "Create" : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
