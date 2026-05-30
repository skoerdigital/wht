"use client";

import { PieChart, Pie, Cell } from "recharts";
import { formatPLN } from "@/lib/format";

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export function WhtDonut({ data, total }: { data: DonutDatum[]; total: number }) {
  return (
    <div className="relative h-44 w-44">
      <PieChart width={176} height={176}>
        <Pie
          data={data}
          dataKey="value"
          cx={84}
          cy={84}
          innerRadius={58}
          outerRadius={80}
          paddingAngle={2}
          stroke="none"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] text-slate-400">WHT 2025</span>
        <span className="text-base font-semibold text-slate-900 tnum">{formatPLN(total)}</span>
      </div>
    </div>
  );
}
