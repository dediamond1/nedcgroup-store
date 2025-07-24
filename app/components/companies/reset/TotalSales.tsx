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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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

// Helper function to format a date to YYYY-MM-DD in local timezone
function formatLocalDate(date: Date): string {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

export function TotalSales({
  token,
  startDate,
  endDate,
  onReset,
}: TotalSalesProps) {
  const [operator, setOperator] = useState<string>("comviq");
  const [operatorTotal, setOperatorTotal] = useState<TotalSale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);

  const fetchTotals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${baseUrl}/accounts/totalamount/${operator}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }

      const data = await response.json();
      setOperatorTotal(data.TotalSale);
    } catch (error) {
      console.error("Error fetching total sales:", error);
      setError("Failed to load sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, operator]);

  const fetchFilteredTotals = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      // Convert dates to YYYY-MM-DD format in local timezone
      const fromDate = formatLocalDate(startDate);
      const toDate = formatLocalDate(endDate);

      const response = await fetch(
        `${baseUrl}/accounts/getAllOrdersbydateCompaniess/${operator}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromdate: fromDate,
            todate: toDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch filtered sales data");
      }

      const data = await response.json();
      setOperatorTotal(data.TotalSale);
    } catch (error) {
      console.error("Error fetching filtered total sales:", error);
      setError("Failed to load filtered sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, operator]);

  // Initial load and when operator changes
  useEffect(() => {
    fetchTotals();
  }, [fetchTotals, operator]);

  // When date filter or operator changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchFilteredTotals();
      setAutoRefreshEnabled(true);
    } else {
      setAutoRefreshEnabled(false);
    }
  }, [fetchFilteredTotals, startDate, endDate, operator]);

  // Auto-refresh when dates are selected
  useEffect(() => {
    if (!autoRefreshEnabled || !startDate || !endDate) return;

    const interval = setInterval(() => {
      fetchFilteredTotals();
      setTimeUntilRefresh(10); // Reset countdown
    }, 10000);

    const countdownInterval = setInterval(() => {
      setTimeUntilRefresh((prev) => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [autoRefreshEnabled, fetchFilteredTotals, startDate, endDate]);

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

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Select value={operator} onValueChange={setOperator}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comviq">Comviq</SelectItem>
              <SelectItem value="lyca">Lyca</SelectItem>
              <SelectItem value="telia">Telia</SelectItem>
              <SelectItem value="halebop">Halebop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Skeleton className="h-36 w-full" />
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-2">
              <CardTitle className="text-lg flex justify-between">
                <span>
                  {operator.charAt(0).toUpperCase() + operator.slice(1)} Sales
                </span>
                <BadgePercent className="h-5 w-5 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {operatorTotal ? (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-bold">
                      {formatCurrency(operatorTotal.amount || 0)}
                    </h3>
                    {operatorTotal.previousAmount && (
                      <div className="flex items-center">
                        {calculatePercentage(
                          operatorTotal.amount,
                          operatorTotal.previousAmount
                        ) > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            calculatePercentage(
                              operatorTotal.amount,
                              operatorTotal.previousAmount
                            ) > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {Math.abs(
                            calculatePercentage(
                              operatorTotal.amount,
                              operatorTotal.previousAmount
                            )
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                  {operatorTotal.previousAmount && (
                    <p className="text-sm text-gray-500">
                      Previous period:{" "}
                      {formatCurrency(operatorTotal.previousAmount)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end">
        <div className="flex space-x-3">
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
    </div>
  );
}
