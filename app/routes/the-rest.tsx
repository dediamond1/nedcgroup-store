import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DatePicker } from "~/components/ui/date-picker";

import { requireUserToken } from "~/utils/auth.server";
import { TotalSales } from "~/components/companies/reset/TotalSales";
import { SuccessInvoices } from "~/components/companies/reset/SuccessInvoices";
import { FailedInvoices } from "~/components/companies/reset/FailedInvoices";
import { ArticleData } from "~/components/companies/reset/ArticleData";

export const loader: LoaderFunction = async ({ request }) => {
  const token = await requireUserToken(request);
  return json({ token });
};

export default function OvrigaTjansterPage() {
  const { token } = useLoaderData<{ token: string }>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Övriga tjänster</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
        />
      </div>

      <TotalSales token={token} startDate={startDate} endDate={endDate} />

      <Tabs defaultValue="articles" className="mt-6">
        <TabsList>
          <TabsTrigger value="articles">Article Data</TabsTrigger>
          <TabsTrigger value="success">Success Invoices</TabsTrigger>
          <TabsTrigger value="failed">Failed Invoices</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
