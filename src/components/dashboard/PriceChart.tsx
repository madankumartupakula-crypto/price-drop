"use client";

import { Line, LineChart, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { PricePoint } from './ProductCard';

export function PriceChart({ data }: { data: PricePoint[] }) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2} 
            dot={false}
            animationDuration={1500}
          />
          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border px-2 py-1 rounded shadow-lg text-[10px] font-bold">
                    ${payload[0].value}
                  </div>
                );
              }
              return null;
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
