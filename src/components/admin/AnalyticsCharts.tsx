"use client";

import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const responseTimeData = [
  { name: 'Public Works', time: 48 },
  { name: 'Transport', time: 72 },
  { name: 'Sanitation', time: 24 },
  { name: 'Parks & Rec', time: 96 },
  { name: 'Police', time: 12 },
];

const resolutionRateData = [
  { name: 'Resolved', value: 250 },
  { name: 'Open', value: 75 },
];

const PIE_COLORS = ['hsl(var(--chart-3))', 'hsl(var(--chart-5))'];

export function AnalyticsCharts() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Avg. Response Time (Hours)</h3>
        <ChartContainer config={{}} className="h-[150px] w-full">
            <BarChart data={responseTimeData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                <Bar dataKey="time" radius={4}>
                   {responseTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Resolution Rate</h3>
        <ChartContainer config={{}} className="h-[150px] w-full">
            <PieChart>
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Pie data={resolutionRateData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} label={({payload}) => payload.name} labelLine={false} strokeWidth={2}>
                 {resolutionRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
              </Pie>
            </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}
