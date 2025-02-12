"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X, RotateCcw, Plus } from "lucide-react";
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  return (
    <motion.div
      className={`sticky top-0 z-10 mt-10 rounded-xl bg-white transition-all duration-300 ease-in-out ${
        isScrolled ? "py-2" : "py-6"
      }`}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.h2
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Companies
              </motion.h2>
              <motion.span
                className="text-lg text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                ({companyCount})
              </motion.span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="w-full sm:w-auto flex-grow relative">
              <Input
                type="text"
                placeholder="Search by Name, Org number, or Company number..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pr-8"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() =>
                    handleSearch({
                      target: { value: "" },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Select value={isActive} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
        <motion.div
          className="mt-4 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
