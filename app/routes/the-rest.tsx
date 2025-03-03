"use client";

import { useState, useCallback, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { toast, Toaster } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import { Separator } from "~/components/ui/separator";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  RefreshCw,
  Calendar,
  CreditCard,
  TrendingUp,
  DownloadCloud,
  Info,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart3,
  FileSpreadsheet,
  HelpCircle,
} from "lucide-react";

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
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await requireUserToken(request);
  return json({ token });
};

export default function UtilitiesPage() {
  const { token } = useLoaderData<{ token: string }>();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [generateStartDate, setGenerateStartDate] = useState<Date | null>(null);
  const [generateEndDate, setGenerateEndDate] = useState<Date | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingCompanies, setIsFetchingCompanies] = useState(false);
  const [generateStats, setGenerateStats] = useState({
    success: 0,
    failure: 0,
    total: 0,
  });
  const [showDateAlert, setShowDateAlert] = useState(false);

  // Track if tab content has been loaded
  const [tabsLoaded, setTabsLoaded] = useState({
    dashboard: false,
    articleData: false,
    generator: false,
  });

  // Update loaded state when tab changes
  useEffect(() => {
    if (!tabsLoaded[selectedTab as keyof typeof tabsLoaded]) {
      setTabsLoaded((prev) => ({
        ...prev,
        [selectedTab]: true,
      }));
    }
  }, [selectedTab, tabsLoaded]);

  // Effect to check if end date is before start date
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setShowDateAlert(true);
    } else {
      setShowDateAlert(false);
    }
  }, [startDate, endDate]);

  // Same for generate dates
  useEffect(() => {
    if (
      generateStartDate &&
      generateEndDate &&
      generateEndDate < generateStartDate
    ) {
      setShowDateAlert(true);
    } else {
      setShowDateAlert(false);
    }
  }, [generateStartDate, generateEndDate]);

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
    setGenerateStats({ success: 0, failure: 0, total: 0 });
  };

  const fetchCompanies = useCallback(async () => {
    try {
      setIsFetchingCompanies(true);
      toast.loading("Hämtar företag...", { id: "fetchCompanies" });

      const response = await fetch(`${baseUrl}/company`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(
          data.companylist.filter((company: any) => company.IsActive)
        );
        toast.success(`Hämtade ${data.companylist.length} företag`, {
          id: "fetchCompanies",
        });
      } else {
        throw new Error("Kunde inte hämta företag");
      }
    } catch (error) {
      toast.error("Kunde inte hämta företag", { id: "fetchCompanies" });
    } finally {
      setIsFetchingCompanies(false);
    }
  }, [token]);

  const generateInvoices = async () => {
    if (!generateStartDate || !generateEndDate) {
      toast.error("Välj både start- och slutdatum");
      return;
    }

    if (generateEndDate < generateStartDate) {
      toast.error("Slutdatum måste vara efter startdatum");
      return;
    }

    if (companies.length === 0) {
      toast.error("Hämta företag först");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGenerateStats({ success: 0, failure: 0, total: companies.length });

    toast.loading(`Genererar fakturor för ${companies.length} företag...`, {
      id: "generateInvoices",
    });

    let successCount = 0;
    let failureCount = 0;

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
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        failureCount++;
      }

      // Update progress and stats
      const newProgress = Math.floor(((i + 1) / companies.length) * 100);
      setProgress(newProgress);
      setGenerateStats({
        success: successCount,
        failure: failureCount,
        total: companies.length,
      });
    }

    toast.success(
      `Generering klar. Lyckades: ${successCount}, Misslyckades: ${failureCount}`,
      { id: "generateInvoices" }
    );
    setIsGenerating(false);
  };

  const getProgressColor = () => {
    if (progress < 30) return "bg-blue-500";
    if (progress < 70) return "bg-blue-600";
    return "bg-blue-700";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      <div className="container mx-auto p-6 max-w-6xl">
        <header className="mb-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Verktyg</h1>
            <p className="text-gray-500">
              Hantera försäljningsrapporter, fakturering och dataanalys enkelt
            </p>
          </div>
        </header>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <div className="mb-8">
            <TabsList className="flex w-full bg-white rounded-lg shadow-sm p-1 border border-gray-200">
              <TabsTrigger
                value="dashboard"
                className="flex-1 py-3 text-base rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Översikt
              </TabsTrigger>
              <TabsTrigger
                value="article-data"
                className="flex-1 py-3 text-base rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Artikeldata
              </TabsTrigger>
              <TabsTrigger
                value="generator"
                className="flex-1 py-3 text-base rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Fakturagenerator
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {tabsLoaded.dashboard && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <CardTitle className="text-gray-800">
                              Datumintervall
                            </CardTitle>
                            <CardDescription>Filtrera all data</CardDescription>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={resetDates}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Återställ
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Rensa datumval</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-sm font-medium mb-1 block text-gray-700">
                            Startdatum
                          </label>
                          <DatePicker
                            selected={startDate}
                            onChange={(date: any) => setStartDate(date)}
                            placeholderText="Välj startdatum"
                            className="w-full border border-gray-300 rounded-md p-2"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium mb-1 block text-gray-700">
                            Slutdatum
                          </label>
                          <DatePicker
                            selected={endDate}
                            onChange={(date: any) => setEndDate(date)}
                            placeholderText="Välj slutdatum"
                            className="w-full border border-gray-300 rounded-md p-2"
                          />
                        </div>
                      </div>

                      {showDateAlert && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Ogiltigt datumintervall</AlertTitle>
                          <AlertDescription>
                            Slutdatum måste vara efter startdatum.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <CardTitle className="text-gray-800">
                            Total försäljning
                          </CardTitle>
                          <CardDescription>
                            Sammanfattning av försäljning
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <TotalSales
                        token={token}
                        startDate={startDate}
                        endDate={endDate}
                        onReset={resetDates}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <CardTitle className="text-gray-800">
                            Fakturastatus
                          </CardTitle>
                          <CardDescription>
                            Översikt av lyckade och misslyckade fakturor
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                          <CardHeader className="pb-2 bg-green-50">
                            <div className="flex items-center">
                              <div className="mr-2 p-2 bg-green-100 rounded-full">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  Lyckade fakturor
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  Behandlade utan fel
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <SuccessInvoices token={token} />
                          </CardContent>
                        </Card>

                        <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                          <CardHeader className="pb-2 bg-red-50">
                            <div className="flex items-center">
                              <div className="mr-2 p-2 bg-red-100 rounded-full">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  Misslyckade fakturor
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  Fakturor med behandlingsfel
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <FailedInvoices token={token} />
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Article Data Tab */}
          <TabsContent value="article-data" className="space-y-6">
            {tabsLoaded.articleData && (
              <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <CardTitle className="text-gray-800">
                          Artikeldata
                        </CardTitle>
                        <CardDescription>
                          Visa och analysera artikeldata
                        </CardDescription>
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <HelpCircle className="h-5 w-5 text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Den här fliken visar all artikeldata. Använd
                            datumfilter från översiktsfliken för att begränsa
                            resultaten.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-800">
                          Använda datumfilter
                        </h3>
                        <p className="text-sm text-blue-600">
                          Datumfilter som ställts in på översiktsfliken används
                          även här.
                          {(!startDate || !endDate) && (
                            <span className="block mt-1 font-medium">
                              Inget datumintervall är valt. Visar all data.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ArticleData
                    token={token}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Batch Invoice Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            {tabsLoaded.generator && (
              <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <CardTitle className="text-gray-800">
                        Fakturagenerator
                      </CardTitle>
                      <CardDescription>
                        Generera fakturor för flera företag samtidigt
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-800">
                          Hur du genererar fakturor
                        </h3>
                        <ol className="mt-2 ml-4 list-decimal text-sm text-blue-700 space-y-1">
                          <li>Välj start- och slutdatum för fakturaperioden</li>
                          <li>
                            Klicka på "Hämta företag" för att ladda
                            företagslistan
                          </li>
                          <li>
                            Klicka på "Skapa fakturor" för att starta processen
                          </li>
                          <li>
                            Övervaka förloppet och vänta tills det är klart
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="border border-gray-200 shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                          <CardTitle className="text-base">
                            Fakturaperiod
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block text-gray-700">
                              Startdatum <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                              selected={generateStartDate}
                              onChange={(date: any) =>
                                setGenerateStartDate(date)
                              }
                              placeholderText="Från datum"
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block text-gray-700">
                              Slutdatum <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                              selected={generateEndDate}
                              onChange={(date: any) => setGenerateEndDate(date)}
                              placeholderText="Till datum"
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                        </div>

                        {showDateAlert && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Ogiltigt datumintervall</AlertTitle>
                            <AlertDescription>
                              Slutdatum måste vara efter startdatum.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
                          <CardTitle className="text-base">Företag</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-4">
                          <Button
                            onClick={fetchCompanies}
                            disabled={isGenerating || isFetchingCompanies}
                            className="w-full"
                          >
                            <RefreshCw
                              className={`mr-2 h-4 w-4 ${
                                isFetchingCompanies ? "animate-spin" : ""
                              }`}
                            />
                            {isFetchingCompanies
                              ? "Hämtar..."
                              : "Hämta företag"}
                          </Button>

                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                            <span className="text-sm font-medium">
                              Inlästa företag:
                            </span>
                            <Badge variant="outline" className="bg-blue-50">
                              {companies.length > 0 ? companies.length : "Inga"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-6">
                    <div className="flex flex-col space-y-4">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                        onClick={generateInvoices}
                        disabled={
                          isGenerating ||
                          companies.length === 0 ||
                          !generateStartDate ||
                          !generateEndDate ||
                          (generateEndDate &&
                            generateStartDate &&
                            generateEndDate < generateStartDate)
                        }
                      >
                        <DownloadCloud className="mr-2 h-5 w-5" />
                        {isGenerating ? "Skapar fakturor..." : "Skapa fakturor"}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={resetGenerateDates}
                        disabled={isGenerating}
                      >
                        Återställ alla fält
                      </Button>
                    </div>

                    {isGenerating && (
                      <Card className="border border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm font-medium">
                              <span>Förlopp</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress
                              value={progress}
                              className="h-3 bg-blue-100"
                              indicatorClassName={getProgressColor()}
                            />

                            <div className="grid grid-cols-3 gap-4 text-center pt-2">
                              <div className="bg-white p-3 rounded-md border border-gray-200">
                                <p className="text-sm text-gray-500">Totalt</p>
                                <p className="text-lg font-bold text-gray-800">
                                  {generateStats.total}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-md border border-green-200">
                                <p className="text-sm text-gray-500">Lyckade</p>
                                <p className="text-lg font-bold text-green-600">
                                  {generateStats.success}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-md border border-red-200">
                                <p className="text-sm text-gray-500">
                                  Misslyckade
                                </p>
                                <p className="text-lg font-bold text-red-600">
                                  {generateStats.failure}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {!isGenerating && generateStats.total > 0 && (
                      <Card className="border border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                          <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-green-800">
                                Fakturagenerering klar
                              </h3>
                              <div className="grid grid-cols-3 gap-4 text-center mt-4">
                                <div className="bg-white p-3 rounded-md border border-gray-200">
                                  <p className="text-sm text-gray-500">
                                    Totalt
                                  </p>
                                  <p className="text-lg font-bold text-gray-800">
                                    {generateStats.total}
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded-md border border-green-200">
                                  <p className="text-sm text-gray-500">
                                    Lyckade
                                  </p>
                                  <p className="text-lg font-bold text-green-600">
                                    {generateStats.success}
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded-md border border-red-200">
                                  <p className="text-sm text-gray-500">
                                    Misslyckade
                                  </p>
                                  <p className="text-lg font-bold text-red-600">
                                    {generateStats.failure}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
