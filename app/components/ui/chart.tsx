import type React from "react";
import { ResponsiveContainer, type ResponsiveContainerProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface ChartProps extends Omit<ResponsiveContainerProps, "children"> {
  children: React.ReactElement;
}

export function Chart({ children, ...props }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={170} {...props}>
      {children}
    </ResponsiveContainer>
  );
}

import type { TooltipProps } from "recharts";

interface ChartTooltipProps extends TooltipProps<ValueType, NameType> {}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};
