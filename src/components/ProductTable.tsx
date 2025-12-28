'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { IProduct } from '@/models/Product';
import { PlusCircle, Loader2, ArrowUpDown } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProductTableRow } from './ProductTableRow';
import { AddProductForm } from './AddProductForm';

type SortKey = 'productName' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

export const dynamic = 'force-dynamic';

export default function ProductTable() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'updatedAt', direction: 'desc' });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch products');
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

  const sortedProducts = useMemo(() => {
    const sortableProducts = [...products];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        let aValue: string | number, bValue: string | number;

        if (sortConfig.key === 'productName') {
          aValue = a.productName.toLowerCase();
          bValue = b.productName.toLowerCase();
        } else { // 'updatedAt'
          aValue = new Date(a.currentRate?.updatedAt || 0).getTime();
          bValue = new Date(b.currentRate?.updatedAt || 0).getTime();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [products, sortConfig]);


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
  
  const requestSort = (key: SortKey, direction: SortDirection) => {
    setSortConfig({ key, direction });
  };


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
          <style jsx>{`
            [data-radix-scroll-area-viewport] {
              -webkit-overflow-scrolling: touch;
            }
          `}</style>
            <Table>
              {!loading && !error && products.length === 0 && (
                <TableCaption>
                  No products found. Add one to get started!
                </TableCaption>
              )}
               {error && (
                <TableCaption className='text-destructive'>
                  Error loading products: {error}
                </TableCaption>
              )}
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] font-bold text-foreground">S.No</TableHead>
                  <TableHead className="font-bold text-foreground">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="-ml-4 h-8">
                          Product Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => requestSort('productName', 'asc')}>
                          Sort A-Z
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => requestSort('productName', 'desc')}>
                          Sort Z-A
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => requestSort('updatedAt', 'desc')}>
                          Sort by Newest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => requestSort('updatedAt', 'asc')}>
                          Sort by Oldest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead className="text-right font-bold text-foreground">Rate</TableHead>
                  <TableHead className="font-bold text-foreground">Unit</TableHead>
                  <TableHead className="text-right font-bold text-foreground">GST %</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Final Rate</TableHead>
                  <TableHead className="font-bold text-foreground">Party Name</TableHead>
                  <TableHead className="font-bold text-foreground">Page No.</TableHead>
                  <TableHead className="text-center w-[120px] font-bold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Loading ledger...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedProducts.map((product, index) => (
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
