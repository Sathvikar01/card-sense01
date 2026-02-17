'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryBreakdownProps {
  data: Record<string, number>;
  totalSpend: number;
}

// Category colors matching the transaction list
const CATEGORY_COLORS_MAP: Record<string, string> = {
  'Food & Dining': '#fb923c',
  'Groceries': '#4ade80',
  'Shopping': '#c084fc',
  'Transportation': '#60a5fa',
  'Entertainment': '#f472b6',
  'Bills & Utilities': '#facc15',
  'Healthcare': '#f87171',
  'Travel': '#818cf8',
  'Education': '#22d3ee',
  'Personal Care': '#2dd4bf',
  'Fuel': '#94a3b8',
  'Online Shopping': '#a78bfa',
  'Subscriptions': '#e879f9',
  'Other': '#9ca3af',
};

const RADIAN = Math.PI / 180;

interface PieLabelRenderProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined ||
    percent === undefined
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show labels for slices less than 5%

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="font-semibold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CategoryBreakdown({ data, totalSpend }: CategoryBreakdownProps) {
  // Transform data for pie chart
  const chartData: CategoryData[] = Object.entries(data)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalSpend) * 100,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  const isEmpty = chartData.length === 0 || totalSpend === 0;

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Your spending breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No spending data available. Add transactions to see your category breakdown.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Your spending breakdown by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] md:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS_MAP[entry.category] || CATEGORY_COLORS_MAP['Other']}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CategoryData;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-semibold">{data.category}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm font-medium">
                          {data.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                content={({ payload }) => {
                  return (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                      {payload?.slice(0, 5).map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                      {payload && payload.length > 5 && (
                        <span className="text-xs text-muted-foreground">
                          +{payload.length - 5} more
                        </span>
                      )}
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top categories list */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold">Top Categories</h4>
          {chartData.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS_MAP[item.category] || CATEGORY_COLORS_MAP['Other'],
                  }}
                />
                <span className="text-sm font-medium">{item.category}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
