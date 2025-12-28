'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import type { IProduct } from '@/models/Product';
import { calculateFinalRate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';

const formSchema = z.object({
  rate: z.coerce.number().positive('Rate must be a positive number.'),
  gst: z.coerce.number().min(0, 'GST must be 0 or more.'),
  partyName: z.string().min(2, 'Party name must be at least 2 characters.'),
  billDate: z.string().optional(),
  pageNo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateRateFormProps {
  product: IProduct;
  onRateUpdated: () => void;
}

export function UpdateRateForm({ product, onRateUpdated }: UpdateRateFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rate: product.currentRate?.rate ?? 0,
      gst: product.currentRate?.gst ?? 0,
      partyName: product.currentRate?.partyName ?? '',
      billDate: product.currentRate?.billDate instanceof Date ? product.currentRate.billDate.toLocaleDateString() : product.currentRate?.billDate ?? '',
      pageNo: product.currentRate?.pageNo ?? '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    
    const payload = { 
        ...values,
        billDate: values.billDate || undefined,
        pageNo: values.pageNo || undefined,
    };

    try {
      const response = await fetch(`/api/product/${product._id}/update-rate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      toast({
        title: 'Rate Updated!',
        description: `New rate for "${product.productName}" is now active.`,
      });
      onRateUpdated();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not update rate.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {product.currentRate && (
        <Card className="mb-4 bg-muted/50 border-dashed">
            <CardContent className="p-3 text-sm">
                <p className='font-semibold mb-2'>Current Rate Details:</p>
                <div className='grid grid-cols-2 gap-1 text-muted-foreground'>
                    <span>Rate: {product.currentRate.rate.toFixed(2)}</span>
                    <span>GST: {product.currentRate.gst.toFixed(2)}%</span>
                    <span>Final: {product.currentRate.finalRate.toFixed(2)}</span>
                    <span>Party: {product.currentRate.partyName}</span>
                    {product.currentRate.billDate && <span>Bill Date: {product.currentRate.billDate instanceof Date ? product.currentRate.billDate.toLocaleDateString() : product.currentRate.billDate}</span>}
                    {product.currentRate.pageNo && <span>Page No: {product.currentRate.pageNo}</span>}
                </div>
            </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Rate</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New GST %</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="partyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Party Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="billDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bill Date</FormLabel>
                    <FormControl>
                        <Input type="text" placeholder="e.g., 25/12/2024" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="pageNo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Page No.</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., F-12, 23" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </div>


          <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Rate
          </Button>
        </form>
      </Form>
    </>
  );
}
