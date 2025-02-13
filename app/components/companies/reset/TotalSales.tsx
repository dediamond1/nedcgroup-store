"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { baseUrl } from "~/constants/api";

interface TotalSalesProps {
  token: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface TotalSale {
  type: string;
  amount: number;
}

export function TotalSales({ token, startDate, endDate }: TotalSalesProps) {
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

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  useEffect(() => {
    if (startDate && endDate) {
      const fetchFilteredTotals = async () => {
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
      };

      fetchFilteredTotals();
    }
  }, [token, startDate, endDate]);

  return (
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
  );
}
