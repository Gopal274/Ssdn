'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from "date-fns"

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { calculateFinalRate, cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const formSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters.'),
  rate: z.coerce.number().positive('Rate must be a positive number.'),
  gst: z.coerce.number().min(0, 'GST must be 0 or more.'),
  unit: z.string().min(1, 'Unit is required.'),
  partyName: z.string().min(2, 'Party name must be at least 2 characters.'),
  billDate: z.date().optional(),
  pageNo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddProductFormProps {
  onProductAdded: () => void;
}

export function AddProductForm({ onProductAdded }: AddProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      rate: 0,
      gst: 0,
      unit: '',
      partyName: '',
      billDate: undefined,
      pageNo: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    const finalRate = calculateFinalRate(values.rate, values.gst);
    
    const payload = { ...values, billDate: values.billDate ? values.billDate.toISOString() : undefined, finalRate };

    try {
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }
      
      toast({
        title: 'Success!',
        description: `Product "${values.productName}" has been added.`,
        variant: 'default',
      });
      onProductAdded();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not add product.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Basmati Rice" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Rate</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                <FormLabel>GST %</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                      <Input placeholder="e.g., Kg, Pkt" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
          />
          <FormField
              control={form.control}
              name="partyName"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Party Name</FormLabel>
                  <FormControl>
                      <Input placeholder="e.g., Sharma Traders" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="billDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Bill Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
          Add Product
        </Button>
      </form>
    </Form>
  );
}
