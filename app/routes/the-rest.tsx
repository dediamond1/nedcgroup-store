"use client";

import { useState, useCallback } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DatePicker } from "~/components/ui/date-picker";
import { Button } from "~/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import { format } from "date-fns";

import { requireUserToken } from "~/utils/auth.server";
import { TotalSales } from "~/components/companies/reset/TotalSales";
import { SuccessInvoices } from "~/components/companies/reset/SuccessInvoices";
import { FailedInvoices } from "~/components/companies/reset/FailedInvoices";
import { ArticleData } from "~/components/companies/reset/ArticleData";
import { baseUrl } from "~/constants/api";

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

export const loader: LoaderFunction = async ({ request }) => {
  const token = await requireUserToken(request);
  return json({ token });
};

export default function OvrigaTjansterPage() {
  const { token } = useLoaderData<{ token: string }>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [generateStartDate, setGenerateStartDate] = useState<Date | null>(null);
  const [generateEndDate, setGenerateEndDate] = useState<Date | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const fetcher = useFetcher();
  //const { toast } = useToast()

  const resetDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const resetGenerateDates = () => {
    setGenerateStartDate(null);
    setGenerateEndDate(null);
    setCompanies([]);
    setProgress(0);
    setIsGenerating(false);
  };

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/company`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companylist);
      } else {
        throw new Error("Failed to fetch companies");
      }
    } catch (error) {
      toast.error("Failed to fetch companies");
    }
  }, [token]);

  const generateInvoices = async () => {
    if (!generateStartDate || !generateEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];

      try {
        const response = await fetch(
          `${baseUrl}/order/getInvoicebydate/${company._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fromdate: format(generateStartDate, "yyyy-MM-dd"),
              todate: format(generateEndDate, "yyyy-MM-dd"),
            }),
          }
        );

        const data = await response.json();

        if (data.status) {
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(`Failed to generate invoice for ${company.name}`);
        //toast.error(`Failed to generate invoice for ${company.name}`);
      }

      setProgress(((i + 1) / companies.length) * 100);
    }

    setIsGenerating(false);
  };

  return (
    <div className="md:container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6">Övriga tjänster</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <DatePicker
          selected={startDate}
          onChange={(date: any) => setStartDate(date)}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={(date: any) => setEndDate(date)}
          placeholderText="End Date"
        />
      </div>

      <TotalSales
        token={token}
        startDate={startDate}
        endDate={endDate}
        onReset={resetDates}
      />

      <Tabs defaultValue="articles" className="mt-6">
        <TabsList>
          <TabsTrigger value="articles">Article Data</TabsTrigger>
          <TabsTrigger value="success">Success Invoices</TabsTrigger>
          <TabsTrigger value="failed">Failed Invoices</TabsTrigger>
          <TabsTrigger value="generate">Generate Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">
          <ArticleData token={token} startDate={startDate} endDate={endDate} />
        </TabsContent>
        <TabsContent value="success">
          <SuccessInvoices
            token={token}
            startDate={startDate}
            endDate={endDate}
          />
        </TabsContent>
        <TabsContent value="failed">
          <FailedInvoices
            token={token}
            startDate={startDate}
            endDate={endDate}
          />
        </TabsContent>
        <TabsContent value="generate">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-4">
                <DatePicker
                  selected={generateStartDate}
                  onChange={(date: any) => setGenerateStartDate(date)}
                  placeholderText="From Date"
                />
                <DatePicker
                  selected={generateEndDate}
                  onChange={(date: any) => setGenerateEndDate(date)}
                  placeholderText="To Date"
                />
              </div>
              <Button onClick={fetchCompanies}>Fetch Companies</Button>
              <Button
                onClick={generateInvoices}
                disabled={isGenerating || companies.length === 0}
              >
                Generate Invoices
              </Button>
              <Button onClick={resetGenerateDates} variant="outline">
                Reset
              </Button>
            </div>
            {isGenerating && (
              <div className="flex justify-center items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    ></circle>
                    <circle
                      className="text-blue-600 progress-ring stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (progress / 100) * 251.2}
                    ></circle>
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-semibold">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
