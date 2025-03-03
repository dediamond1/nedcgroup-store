"use client";

import { useState, useEffect } from "react";
import {
  X,
  RotateCcw,
  Plus,
  Search,
  Filter,
  Users,
  Building,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { motion } from "framer-motion";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface HeroSectionProps {
  searchTerm: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterChange: (value: string) => void;
  isActive: string;
  handleCreate: () => void;
  handleReset: () => void;
  companyCount: number;
}

export function HeroSection({
  searchTerm,
  handleSearch,
  handleFilterChange,
  isActive,
  handleCreate,
  handleReset,
  companyCount,
}: HeroSectionProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return (
    <motion.div
      className={`sticky top-0 z-10 mb-6 bg-white rounded-lg shadow-sm border transition-all duration-300 ease-in-out ${
        isScrolled ? "py-3" : "py-4"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardContent className="p-0 px-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <motion.h2
                  className="text-xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Companies
                </motion.h2>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="text-sm text-gray-500 bg-gray-50"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {companyCount}
                  </Badge>
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </motion.div>
          </div>

          <div
            className={`flex ${
              isMobile ? "flex-col space-y-3" : "items-center space-x-3"
            }`}
          >
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search by name, email, company number..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() =>
                    handleSearch({
                      target: { value: "" },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div
              className={`flex ${
                isMobile ? "w-full" : "w-auto"
              } items-center space-x-2`}
            >
              <div className={`${isMobile ? "flex-grow" : "w-40"}`}>
                <Select value={isActive} onValueChange={handleFilterChange}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-gray-300 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </motion.div>
  );
}
