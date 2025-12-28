
'use client';

import { useState, Fragment } from 'react';
import type { IProduct, IRate } from '@/models/Product';
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
import { PlusSquare, Trash2, ChevronRight, Pencil } from 'lucide-react';
import { UpdateRateForm } from './UpdateRateForm';
import { EditDetailsForm } from './EditDetailsForm';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProductTableRowProps {
  product: IProduct;
  index: number;
  onRateUpdated: () => void;
  onProductDeleted: (productId: string) => void;
}

export function ProductTableRow({ product, index, onRateUpdated, onProductDeleted }: ProductTableRowProps) {
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isEditDetailsModalOpen, setEditDetailsModalOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const { toast } = useToast();

  const handleSuccess = () => {
    setUpdateModalOpen(false);
    setEditDetailsModalOpen(false);
    onRateUpdated();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
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

  const handleDeleteHistory = async (e: React.MouseEvent, historyEntry: IRate) => {
    e.stopPropagation();
     try {
      const response = await fetch(`/api/product/${product._id}/history`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedAt: historyEntry.updatedAt }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete history entry');
      }

      toast({
        title: 'History Deleted',
        description: `Rate from ${new Date(historyEntry.updatedAt).toLocaleDateString()} has been removed.`,
      });
      onRateUpdated(); // This will re-fetch products and update the UI
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not delete history entry.',
        variant: 'destructive',
      });
    }
  }
  
  const hasHistory = product.rateHistory && product.rateHistory.length > 0;

  if (!product.currentRate) {
     // This case should ideally not happen with good data, but it's a safeguard.
     return (
        <TableRow>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{product.productName}</TableCell>
            <TableCell colSpan={8} className="text-muted-foreground">Product data is incomplete.</TableCell>
             <TableCell className="text-center no-print">
                <div className="flex items-center justify-center space-x-1">
                  <Dialog open={isUpdateModalOpen} onOpenChange={setUpdateModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        Add Rate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                      <DialogHeader>
                        <DialogTitle className='font-headline'>Update Rate for {product.productName}</DialogTitle>
                      </DialogHeader>
                      <UpdateRateForm product={product} onRateUpdated={handleSuccess} />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon" title="Delete Product" onClick={(e) => e.stopPropagation()}>
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
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
            </TableCell>
        </TableRow>
    );
  }

  return (
    <Fragment>
      <TableRow 
        onClick={() => hasHistory && setHistoryOpen(!isHistoryOpen)} 
        className={cn('font-medium bg-card hover:bg-card/90', hasHistory && 'cursor-pointer', isHistoryOpen && 'border-b-0')}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {hasHistory ? (
              <ChevronRight className={cn('h-4 w-4 transition-transform no-print', isHistoryOpen && 'rotate-90')} />
            ) : (
              <span className="w-4 no-print" />
            )}
            {index + 1}
          </div>
        </TableCell>
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
        <TableCell>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="truncate max-w-[200px]">{product.currentRate.partyName}</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{product.currentRate.partyName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell>{product.currentRate.billDate ? new Date(product.currentRate.billDate).toLocaleDateString() : '-'}</TableCell>
        <TableCell>{product.currentRate.pageNo || '-'}</TableCell>
        <TableCell>{product.currentRate.category || '-'}</TableCell>
        <TableCell className="text-center no-print">
          <div className="flex items-center justify-center space-x-1">
            <Dialog open={isUpdateModalOpen} onOpenChange={setUpdateModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Update Rate" onClick={(e) => e.stopPropagation()}>
                  <PlusSquare className="h-5 w-5 text-green-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className='font-headline'>Update Rate for {product.productName}</DialogTitle>
                </DialogHeader>
                <UpdateRateForm product={product} onRateUpdated={handleSuccess} />
              </DialogContent>
            </Dialog>
            <Dialog open={isEditDetailsModalOpen} onOpenChange={setEditDetailsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Edit Details" onClick={(e) => e.stopPropagation()}>
                  <Pencil className="h-4 w-4 text-blue-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className='font-headline'>Edit Details for {product.productName}</DialogTitle>
                </DialogHeader>
                <EditDetailsForm product={product} onDetailsUpdated={handleSuccess} />
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Delete Product" onClick={(e) => e.stopPropagation()}>
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
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
      {isHistoryOpen && hasHistory && product.rateHistory.map((history, i) => (
        <TableRow key={`${product._id}-history-${i}`} className="text-muted-foreground text-xs bg-muted/30 hover:bg-muted/50">
          <TableCell></TableCell>
          <TableCell>
            <span className="pl-4">↳ {new Date(history.updatedAt).toLocaleDateString()}</span>
          </TableCell>
          <TableCell className="text-right">{history.rate.toFixed(2)}</TableCell>
          <TableCell></TableCell>
          <TableCell className="text-right">{history.gst.toFixed(2)}%</TableCell>
          <TableCell className="text-right font-medium">{history.finalRate.toFixed(2)}</TableCell>
          <TableCell>{history.partyName}</TableCell>
          <TableCell>{history.billDate ? new Date(history.billDate).toLocaleDateString() : '-'}</TableCell>
          <TableCell>{history.pageNo || '-'}</TableCell>
          <TableCell>{history.category || '-'}</TableCell>
          <TableCell className="text-center no-print">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Delete History Entry" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                  <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this history entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the rate from {new Date(history.updatedAt).toLocaleDateString()} for "{product.productName}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={(e) => handleDeleteHistory(e, history)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TableCell>
        </TableRow>
      ))}
    </Fragment>
  );
}
