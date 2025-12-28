
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters.'),
  rate: z.coerce.number().positive('Rate must be a positive number.'),
  gst: z.coerce.number().min(0, 'GST must be 0 or more.'),
  unit: z.string().min(1, 'Unit is required.'),
  partyName: z.string().min(2, 'Party name must be at least 2 characters.'),
  billDate: z.string().optional(),
  pageNo: z.string().optional(),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddProductFormProps {
  onProductAdded: () => void;
  uniqueUnits: string[];
  uniquePartyNames: string[];
}

export function AddProductForm({ onProductAdded, uniqueUnits, uniquePartyNames }: AddProductFormProps) {
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
      billDate: '',
      pageNo: '',
      category: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    
    const submittedValues = {
      ...values,
      extraDetails: {
        billDate: values.billDate || undefined,
        pageNo: values.pageNo || undefined,
        category: values.category || undefined,
      },
    };
    
    try {
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedValues),
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
                  <div>
                    <Input placeholder="e.g., Kg, Pkt" {...field} list="unit-suggestions" />
                    <datalist id="unit-suggestions">
                      {uniqueUnits.map(unit => <option key={unit} value={unit} />)}
                    </datalist>
                  </div>
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
                   <div>
                    <Input placeholder="e.g., Sharma Traders" {...field} list="party-suggestions" />
                    <datalist id="party-suggestions">
                      {uniquePartyNames.map(party => <option key={party} value={party} />)}
                    </datalist>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="billDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Date (Opt.)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Page No. (Opt.)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., F-123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Opt.)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spices" {...field} />
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
