import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TrackingFunnelChartProps {
  clicks: number;
  valuations: number;
  registrations: number;
  listings: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(45, 93%, 47%)",
  "hsl(152, 69%, 41%)",
  "hsl(262, 83%, 58%)",
];

export function TrackingFunnelChart({ clicks, valuations, registrations, listings }: TrackingFunnelChartProps) {
  const data = [
    { name: "Clicks", value: clicks },
    { name: "Valuations", value: valuations, dropOff: clicks > 0 ? ((1 - valuations / clicks) * 100).toFixed(1) : "0" },
    { name: "Registrations", value: registrations, dropOff: valuations > 0 ? ((1 - registrations / valuations) * 100).toFixed(1) : "0" },
    { name: "Listings", value: listings, dropOff: registrations > 0 ? ((1 - listings / registrations) * 100).toFixed(1) : "0" },
  ];

  if (clicks === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        No tracking data yet. Create a link and start driving traffic.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={100} />
        <Tooltip
          formatter={(value: number, _name: string, props: any) => {
            const drop = props.payload.dropOff;
            return [value.toLocaleString() + (drop ? ` (${drop}% drop-off)` : ""), "Count"];
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
