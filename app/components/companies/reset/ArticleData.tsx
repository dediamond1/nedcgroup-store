
import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DatePicker } from "~/components/ui/date-picker";
import { Link } from "@remix-run/react";
import { baseUrl } from "~/constants/api";

interface ArticleDataProps {
  token: string;
  startDate: any;
  endDate: any;
}

interface Article {
  _id: string;
  name: string;
  articleId: string;
}

interface Order {
  _id: string;
  company: {
    _id: string;
    name: string;
  };
  employeeId: string | null;
  articleId: string;
  voucherDescription: string;
  voucherAmount: string;
  totalvoucherAmount: string;
  voucherCurrency: string;
  expireDate: string;
  voucherNumber: string;
  serialNumber: string;
  OrderDate: string;
}

export function ArticleData({ token }: ArticleDataProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/subcategory/articles`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articallist);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [token]);

  const fetchOrders = useCallback(async () => {
    if (!selectedArticle || !startDate || !endDate) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/order/article/${selectedArticle}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromdate: startDate.toISOString(),
            todate: endDate.toISOString(),
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orderlist);
        setDataFetched(true);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedArticle, startDate, endDate, token]);

  useEffect(() => {
    if (selectedArticle && startDate && endDate && !dataFetched) {
      fetchOrders();
    }
  }, [selectedArticle, startDate, endDate, fetchOrders, dataFetched]);

  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <Select onValueChange={(value) => setSelectedArticle(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select an article" />
          </SelectTrigger>
          <SelectContent>
            {articles.map((article) => (
              <SelectItem key={article._id} value={article.articleId}>
                {article.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Button
          onClick={() => {
            setDataFetched(false);
            fetchOrders();
          }}
          disabled={!selectedArticle || !startDate || !endDate}
        >
          Fetch Data
        </Button>
        <Button
          onClick={() => {
            setDataFetched(false);
            fetchOrders();
          }}
          disabled={!selectedArticle || !startDate || !endDate}
        >
          Refresh Data
        </Button>
      </div>

      {loading && orders.length === 0 ? (
        <p>Loading article data...</p>
      ) : selectedArticle ? (
        isMobile ? (
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <Card key={order._id}>
                <CardContent className="p-4">
                  <p>
                    <strong>Company:</strong>{" "}
                    <Link
                      to={`/companies/${order.company._id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {order.company.name}
                    </Link>
                  </p>
                  <p>
                    <strong>Description:</strong> {order.voucherDescription}
                  </p>
                  <p>
                    <strong>Amount:</strong> {order.voucherAmount}{" "}
                    {order.voucherCurrency}
                  </p>
                  <p>
                    <strong>Voucher Number:</strong> {order.voucherNumber}
                  </p>
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {new Date(order.OrderDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Voucher Number</TableHead>
                <TableHead>Order Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Link
                      to={`/companies/${order.company._id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {order.company.name}
                    </Link>
                  </TableCell>
                  <TableCell>{order.voucherDescription}</TableCell>
                  <TableCell>
                    {order.voucherAmount} {order.voucherCurrency}
                  </TableCell>
                  <TableCell>{order.voucherNumber}</TableCell>
                  <TableCell>
                    {new Date(order.OrderDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      ) : (
        <p>Please select an article and date range to view data.</p>
      )}

      {selectedArticle && orders.length > 0 && (
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
