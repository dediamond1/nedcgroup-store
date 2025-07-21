"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChevronUp, ChevronLeft } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface SalesOverviewProps {
  salesData: Array<{
    type: string;
    amount: number;
    previousAmount: number;
  }>;
}

export function SalesOverview({ salesData }: SalesOverviewProps) {
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xl">Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {salesData.map((data, index) => {
            const isPositive = data.amount >= data.previousAmount;
            const change = calculatePercentageChange(
              data.amount,
              data.previousAmount
            );
            const periodLabel = data.type.toLowerCase().includes("today")
              ? "day"
              : data.type.toLowerCase().includes("weekly")
              ? "week"
              : "month";

            return (
              <Card
                key={index}
                className="border shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {data.type}
                      </p>
                      <h3 className="text-2xl font-bold mt-1">
                        {typeof data.amount === "number"
                          ? new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "SEK",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(data.amount)
                          : "N/A"}
                      </h3>
                    </div>
                    <div
                      className={`p-2 rounded-full ${
                        isPositive ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {isPositive ? (
                        <ChevronUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <ChevronLeft className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  {data.previousAmount > 0 &&
                    typeof data.amount === "number" && (
                      <div
                        className={`flex items-center mt-2 text-sm ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isPositive ? (
                          <ChevronUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronLeft className="h-3 w-3 mr-1" />
                        )}
                        <span>
                          {Math.abs(Number(change))}% from last {periodLabel}
                        </span>
                      </div>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
