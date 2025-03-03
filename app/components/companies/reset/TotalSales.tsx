"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  ArrowRight,
  BadgePercent,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { baseUrl } from "~/constants/api";

export interface TotalSalesProps {
  token: string;
  startDate?: Date | null;
  endDate?: Date | null;
  onReset?: () => void;
}

interface TotalSale {
  type: string;
  amount: number;
  previousAmount?: number;
}

export function TotalSales({
  token,
  startDate,
  endDate,
  onReset,
}: TotalSalesProps) {
  const [comviqTotal, setComviqTotal] = useState<TotalSale | null>(null);
  const [lycaTotal, setLycaTotal] = useState<TotalSale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTotals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [comviqResponse, lycaResponse] = await Promise.all([
        fetch(`${baseUrl}/accounts/totalamount`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/lyca/accounts/totalamount`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!comviqResponse.ok || !lycaResponse.ok) {
        throw new Error("Failed to fetch sales data");
      }

      const comviqData = await comviqResponse.json();
      const lycaData = await lycaResponse.json();

      setComviqTotal(comviqData.TotalSale);
      setLycaTotal(lycaData.TotalSale);
    } catch (error) {
      console.error("Error fetching total sales:", error);
      setError("Failed to load sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchFilteredTotals = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const [comviqResponse, lycaResponse] = await Promise.all([
        fetch(`${baseUrl}/accounts/getAllOrdersbydateCompanies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromdate: startDate.toISOString(),
            todate: endDate.toISOString(),
          }),
        }),
        fetch(`${baseUrl}/lyca/accounts/getAllOrdersbydateCompanies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromdate: startDate.toISOString(),
            todate: endDate.toISOString(),
          }),
        }),
      ]);

      if (!comviqResponse.ok || !lycaResponse.ok) {
        throw new Error("Failed to fetch filtered sales data");
      }

      const comviqData = await comviqResponse.json();
      const lycaData = await lycaResponse.json();

      setComviqTotal(comviqData.TotalSale);
      setLycaTotal(lycaData.TotalSale);
    } catch (error) {
      console.error("Error fetching filtered total sales:", error);
      setError("Failed to load filtered sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate]);

  // Initial load
  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  // When date filter changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchFilteredTotals();
    }
  }, [fetchFilteredTotals, startDate, endDate]);

  const handleReset = async () => {
    try {
      await fetchTotals();
      if (onReset) onReset();
    } catch (error) {
      console.error("Error refetching data:", error);
    }
  };

  // Calculate percentage change
  const calculatePercentage = (current: number = 0, previous: number = 0) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Formats number for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </>
        ) : (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-2">
                <CardTitle className="text-lg flex justify-between">
                  <span>Comviq Sales</span>
                  <BadgePercent className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {comviqTotal ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-2xl font-bold">
                        {formatCurrency(comviqTotal.amount || 0)}
                      </h3>
                      {comviqTotal.previousAmount && (
                        <div className="flex items-center">
                          {calculatePercentage(
                            comviqTotal.amount,
                            comviqTotal.previousAmount
                          ) > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              calculatePercentage(
                                comviqTotal.amount,
                                comviqTotal.previousAmount
                              ) > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {Math.abs(
                              calculatePercentage(
                                comviqTotal.amount,
                                comviqTotal.previousAmount
                              )
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      )}
                    </div>
                    {comviqTotal.previousAmount && (
                      <p className="text-sm text-gray-500">
                        Previous period:{" "}
                        {formatCurrency(comviqTotal.previousAmount)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 pb-2">
                <CardTitle className="text-lg flex justify-between">
                  <span>Lyca Sales</span>
                  <BadgePercent className="h-5 w-5 text-purple-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {lycaTotal ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-2xl font-bold">
                        {formatCurrency(lycaTotal.amount || 0)}
                      </h3>
                      {lycaTotal.previousAmount && (
                        <div className="flex items-center">
                          {calculatePercentage(
                            lycaTotal.amount,
                            lycaTotal.previousAmount
                          ) > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              calculatePercentage(
                                lycaTotal.amount,
                                lycaTotal.previousAmount
                              ) > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {Math.abs(
                              calculatePercentage(
                                lycaTotal.amount,
                                lycaTotal.previousAmount
                              )
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      )}
                    </div>
                    {lycaTotal.previousAmount && (
                      <p className="text-sm text-gray-500">
                        Previous period:{" "}
                        {formatCurrency(lycaTotal.previousAmount)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={loading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        {startDate && endDate && (
          <Button size="sm" onClick={fetchFilteredTotals} disabled={loading}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}
