import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface RegistrationTrend {
  month: string;
  count: number;
  percentageChange: number;
}

interface RegistrationTrendsProps {
  trends: RegistrationTrend[];
}

export function RegistrationTrends({ trends }: RegistrationTrendsProps) {
  // Format data for better visualization
  const formattedTrends = trends.map((trend) => {
    const [year, month] = trend.month.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = parseInt(month) - 1;
    return {
      ...trend,
      formattedMonth: `${monthNames[monthIndex]} ${year.substring(2)}`,
    };
  });

  // Get the last 6 months for more focused display
  const recentTrends = formattedTrends.slice(-6);

  // Calculate key statistics
  const totalRegistrations = trends.reduce(
    (sum, trend) => sum + trend.count,
    0
  );
  const averageGrowth = trends.length
    ? (
        trends.reduce((sum, trend) => sum + trend.percentageChange, 0) /
        trends.length
      ).toFixed(1)
    : "0";
  const highestMonth =
    trends.length > 0
      ? trends.reduce((max, trend) => (trend.count > max.count ? trend : max))
          .month
      : "N/A";
  const peakRegistrations =
    trends.length > 0 ? Math.max(...trends.map((trend) => trend.count)) : 0;
  const latestTrend =
    trends.length > 0 ? trends[trends.length - 1].percentageChange : 0;
  const growthIsPositive = latestTrend >= 0;

  // Custom chart colors
  const colors = {
    count: "#4f46e5",
    percentageChange: "#10b981",
    grid: "#e5e7eb",
    negative: "#ef4444",
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-md rounded-md border border-gray-100 text-xs">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center mt-1">
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: </span>
              <span className="font-medium ml-1">
                {entry.name === "% Change"
                  ? `${entry.value.toFixed(1)}%`
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-indigo-500" />
                New Registrations
              </CardTitle>
              <CardDescription>Monthly company registrations</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {totalRegistrations} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={recentTrends}
                margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={colors.grid}
                />
                <XAxis
                  dataKey="formattedMonth"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill={colors.count}
                  name="Registrations"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-emerald-500" />
                Growth Trend
              </CardTitle>
              <CardDescription>Monthly registration changes</CardDescription>
            </div>
            <Badge
              variant="outline"
              className={
                growthIsPositive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }
            >
              {growthIsPositive ? "+" : ""}
              {Number(latestTrend).toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={recentTrends}
                margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={colors.grid}
                />
                <XAxis
                  dataKey="formattedMonth"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="percentageChange"
                  stroke={colors.percentageChange}
                  name="% Change"
                  dot={{ fill: colors.percentageChange, r: 3 }}
                  activeDot={{ r: 5 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Registration Summary</CardTitle>
          <CardDescription>Key registration statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">
                  Total Registrations
                </p>
                <div className="flex items-center">
                  <p className="text-xl font-bold text-gray-800">
                    {totalRegistrations}
                  </p>
                  <div className="ml-2 p-1 bg-blue-100 rounded">
                    <BarChart3 className="h-3 w-3 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Average Growth</p>
                <div className="flex items-center">
                  <p className="text-xl font-bold text-gray-800">
                    {averageGrowth}%
                  </p>
                  <div className="ml-2 p-1 bg-green-100 rounded">
                    {Number(averageGrowth) >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-700" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-700" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Highest Month</p>
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-800">
                    {highestMonth !== "N/A" ? highestMonth : "No data"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Peak Registrations</p>
                <div className="flex items-center">
                  <p className="text-xl font-bold text-gray-800">
                    {peakRegistrations}
                  </p>
                  <div className="ml-2 p-1 bg-indigo-100 rounded">
                    <ArrowUpRight className="h-3 w-3 text-indigo-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
