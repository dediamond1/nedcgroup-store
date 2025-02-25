"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { baseUrl } from "~/constants/api";

interface TotalSalesProps {
  token: string;
  startDate: Date | null;
  endDate: Date | null;
  onReset: () => void;
}

interface TotalSale {
  type: string;
  amount: number;
}

export function TotalSales({
  token,
  startDate,
  endDate,
  onReset,
}: TotalSalesProps) {
  const [comviqTotal, setComviqTotal] = useState<TotalSale | null>(null);
  const [lycaTotal, setLycaTotal] = useState<TotalSale | null>(null);

  const fetchTotals = useCallback(async () => {
    try {
      const [comviqResponse, lycaResponse] = await Promise.all([
        fetch(`${baseUrl}/accounts/totalamount`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/lyca/accounts/totalamount`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (comviqResponse.ok) {
        const comviqData = await comviqResponse.json();
        setComviqTotal(comviqData.TotalSale);
      }

      if (lycaResponse.ok) {
        const lycaData = await lycaResponse.json();
        setLycaTotal(lycaData.TotalSale);
      }
    } catch (error) {
      console.error("Error fetching total sales:", error);
    }
  }, [token]);

  const fetchFilteredTotals = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
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

      if (comviqResponse.ok) {
        const comviqData = await comviqResponse.json();
        setComviqTotal(comviqData.TotalSale);
      }

      if (lycaResponse.ok) {
        const lycaData = await lycaResponse.json();
        setLycaTotal(lycaData.TotalSale);
      }
    } catch (error) {
      console.error("Error fetching filtered total sales:", error);
    }
  }, [token, startDate, endDate]);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchFilteredTotals();
    }
  }, [fetchFilteredTotals, startDate, endDate]);

  const handleReset = async () => {
    try {
      await fetchTotals();
      onReset();
    } catch (error) {
      console.log("error refetc", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button onClick={handleReset}>Reset</Button>
        <Button onClick={fetchFilteredTotals}>Refetch</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comviq Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {comviqTotal ? (
              <p className="text-2xl font-bold">{comviqTotal.amount} SEK</p>
            ) : (
              <p>No data available</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lyca Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {lycaTotal ? (
              <p className="text-2xl font-bold">{lycaTotal.amount} SEK</p>
            ) : (
              <p>No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
