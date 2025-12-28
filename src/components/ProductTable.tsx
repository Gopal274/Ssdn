'use client';

import { useState, useEffect, useCallback } from 'react';
import type { IProduct } from '@/models/Product';
import { PlusCircle, Loader2 } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProductTableRow } from './ProductTableRow';
import { AddProductForm } from './AddProductForm';

export default function ProductTable() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch products');
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

  const handleProductAdded = () => {
    setAddModalOpen(false);
    fetchProducts();
  };

  const handleRateUpdated = () => {
    fetchProducts();
  };

  const handleProductDeleted = (deletedProductId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p._id !== deletedProductId));
  }

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="font-headline">Goods Rate Register</CardTitle>
          <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="font-headline">Add New Product</DialogTitle>
              </DialogHeader>
              <AddProductForm onProductAdded={handleProductAdded} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              {!loading && products.length === 0 && (
                <TableCaption>
                  {error ? `Error: ${error}` : 'No products found. Add one to get started!'}
                </TableCaption>
              )}
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">S.No</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">GST %</TableHead>
                  <TableHead className="text-right font-bold">Final Rate</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead className="text-center w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Loading ledger...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product, index) => (
                    <ProductTableRow
                      key={product._id}
                      product={product}
                      index={index}
                      onRateUpdated={handleRateUpdated}
                      onProductDeleted={handleProductDeleted}
                    />
                  ))
                )}
              </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
