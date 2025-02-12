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
} from "recharts";
import { Chart, ChartTooltip } from "~/components/ui/chart";

interface RegistrationTrend {
  month: string;
  count: number;
  percentageChange: number;
}

interface RegistrationTrendsProps {
  trends: RegistrationTrend[];
}

export function RegistrationTrends({ trends }: RegistrationTrendsProps) {
  const colors = {
    count: "#4f46e5",
    percentageChange: "#10b981",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>New Registrations</CardTitle>
          <CardDescription>Monthly company registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart className="h-[200px]">
            <BarChart data={trends}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill={colors.count} name="Registrations" />
            </BarChart>
          </Chart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Growth Trend</CardTitle>
          <CardDescription>Monthly registration growth</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart className="h-[200px]">
            <LineChart data={trends}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="percentageChange"
                stroke={colors.percentageChange}
                name="% Change"
              />
            </LineChart>
          </Chart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration Summary</CardTitle>
          <CardDescription>Key registration statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Total Registrations
                </p>
                <p className="text-2xl font-bold">
                  {trends.reduce((sum, trend) => sum + trend.count, 0)}
                </p>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Average Growth
                </p>
                <p className="text-2xl font-bold">
                  {(
                    trends.reduce(
                      (sum, trend) => sum + trend.percentageChange,
                      0
                    ) / trends.length
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Highest Month
                </p>
                <p className="text-2xl font-bold">
                  {
                    trends.reduce((max, trend) =>
                      trend.count > max.count ? trend : max
                    ).month
                  }
                </p>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Peak Registrations
                </p>
                <p className="text-2xl font-bold">
                  {Math.max(...trends.map((trend) => trend.count))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
