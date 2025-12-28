'use client';

import { useState, Fragment } from 'react';
import type { IProduct } from '@/models/Product';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusSquare, Trash2 } from 'lucide-react';
import { UpdateRateForm } from './UpdateRateForm';
import { useToast } from '@/hooks/use-toast';

interface ProductTableRowProps {
  product: IProduct;
  index: number;
  onRateUpdated: () => void;
  onProductDeleted: (productId: string) => void;
}

export function ProductTableRow({ product, index, onRateUpdated, onProductDeleted }: ProductTableRowProps) {
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdateSuccess = () => {
    setUpdateModalOpen(false);
    onRateUpdated();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/product/${product._id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete product');
      }
      toast({
        title: 'Product Deleted',
        description: `"${product.productName}" has been removed.`,
      });
      onProductDeleted(product._id);
    } catch (error) {
       toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not delete product.',
        variant: 'destructive',
      });
    }
  };
  
  const hasHistory = product.rateHistory && product.rateHistory.length > 0;

  if (!product.currentRate) {
    // This case should ideally not happen with valid data, but it's a good safeguard.
     return (
        <TableRow>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{product.productName}</TableCell>
            <TableCell colSpan={5} className="text-muted-foreground">Product data is incomplete.</TableCell>
             <TableCell className="text-center">
                <Dialog open={isUpdateModalOpen} onOpenChange={setUpdateModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add Rate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle className='font-headline'>Update Rate for {product.productName}</DialogTitle>
                    </DialogHeader>
                    <UpdateRateForm product={product} onRateUpdated={handleUpdateSuccess} />
                  </DialogContent>
                </Dialog>
            </TableCell>
        </TableRow>
    );
  }

  return (
    <Fragment>
      <TableRow className='font-medium bg-card hover:bg-card/90 border-b-2 border-background'>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{product.productName}</TableCell>
        <TableCell className="text-right">
          {product.currentRate.rate.toFixed(2)}
        </TableCell>
        <TableCell>{product.unit}</TableCell>
        <TableCell className="text-right">
          {product.currentRate.gst.toFixed(2)}%
        </TableCell>
        <TableCell className="text-right font-bold text-primary">
          {product.currentRate.finalRate.toFixed(2)}
        </TableCell>
        <TableCell>{product.currentRate.partyName}</TableCell>
        <TableCell className="text-center space-x-1">
          <Dialog open={isUpdateModalOpen} onOpenChange={setUpdateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Update Rate">
                <PlusSquare className="h-5 w-5 text-green-700" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className='font-headline'>Update Rate for {product.productName}</DialogTitle>
              </DialogHeader>
              <UpdateRateForm product={product} onRateUpdated={handleUpdateSuccess} />
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Delete Product">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product "{product.productName}" and all of its rate history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TableCell>
      </TableRow>
      {hasHistory && product.rateHistory.map((history, i) => (
        <TableRow key={`${product._id}-history-${i}`} className="bg-muted/30 text-muted-foreground hover:bg-muted/40 text-xs">
          <TableCell></TableCell>
          <TableCell>
            <span className="pl-4">↳ {new Date(history.updatedAt).toLocaleDateString()}</span>
          </TableCell>
          <TableCell className="text-right">{history.rate.toFixed(2)}</TableCell>
          <TableCell></TableCell>
          <TableCell className="text-right">{history.gst.toFixed(2)}%</TableCell>
          <TableCell className="text-right font-medium">{history.finalRate.toFixed(2)}</TableCell>
          <TableCell>{history.partyName}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      ))}
    </Fragment>
  );
}
