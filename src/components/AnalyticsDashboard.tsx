
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { IProduct } from '@/models/Product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from 'recharts';
import { Pie, PieChart, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

const GST_SLABS = [0, 5, 12, 18, 28];
const PIE_CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function AnalyticsDashboard() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) {
        const contentType = res.headers.get('content-type') || '';
        let message = `Failed to fetch products (${res.status} ${res.statusText})`;
        if (contentType.includes('application/json')) {
          try {
            const errorData = await res.json();
            message = errorData?.message || message;
          } catch (e) {
            // ignore and fallback to default message
          }
        } else {
          const text = await res.text();
          if (text && /^\s*</.test(text)) {
            const statusText = (res.statusText || '').trim();
            message = statusText ? `Server error (${res.status} ${statusText})` : `Server error (${res.status})`;
          } else if (text) {
            message = text;
          }
        }
        throw new Error(message);
      }
      const data = await res.json();
      setProducts(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const gstChartData = useMemo(() => {
    const slabCounts = GST_SLABS.reduce((acc, slab) => {
      acc[slab] = 0;
      return acc;
    }, {} as Record<number, number>);

    products.forEach(product => {
      const gst = product.currentRate?.gst;
      if (gst !== undefined && slabCounts[gst] !== undefined) {
        slabCounts[gst]++;
      }
    });
    
    return GST_SLABS.map(slab => ({
        name: `${slab}%`,
        count: slabCounts[slab],
        fill: 'hsl(var(--chart-1))',
    }));
  }, [products]);

  const partyChartData = useMemo(() => {
    const partyCounts = products.reduce((acc, product) => {
      const party = product.currentRate?.partyName;
      if (party) {
        acc[party] = (acc[party] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(partyCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a,b) => b.count - a.count) // Sort to show biggest suppliers first
        .slice(0, 10); // Take top 10 suppliers
  }, [products]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Loading Analytics...</span>
        </div>
    );
  }

  if (error) {
    return (
        <Card className="flex justify-center items-center h-[400px] bg-destructive/10 border-destructive">
            <p className='text-destructive text-lg'>Error: {error}</p>
        </Card>
    );
  }
  
  if (products.length === 0) {
    return (
        <Card className="flex justify-center items-center h-[400px]">
            <p className='text-muted-foreground text-lg'>No product data available to generate analytics.</p>
        </Card>
    );
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Products by GST Slab</CardTitle>
                <CardDescription>Count of products in each standard GST tax slab.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={gstChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="count" radius={8}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Top Suppliers by Product Count</CardTitle>
                <CardDescription>Distribution of products supplied by different parties (Top 10).</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={{}} className="h-[300px] w-full">
                    <PieChart>
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie 
                            data={partyChartData} 
                            dataKey="count" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={110}
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return percent > 0.05 ? ( // Only show label if slice is > 5%
                                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                ) : null;
                            }}
                        >
                            {partyChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                 </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}
