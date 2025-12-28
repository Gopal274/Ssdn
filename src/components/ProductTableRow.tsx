'use client';

import { useState, Fragment } from 'react';
import type { IProduct } from '@/models/Product';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UpdateRateForm } from './UpdateRateForm';

interface ProductTableRowProps {
  product: IProduct;
  index: number;
  onRateUpdated: () => void;
}

export function ProductTableRow({ product, index, onRateUpdated }: ProductTableRowProps) {
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);

  const handleUpdateSuccess = () => {
    setUpdateModalOpen(false);
    onRateUpdated();
  };

  const hasHistory = product.rateHistory && product.rateHistory.length > 0;

  if (!product.currentRate) {
    return (
        <TableRow>
            <TableCell></TableCell>
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
    <Collapsible key={product._id} open={isHistoryOpen} onOpenChange={setHistoryOpen} asChild>
      <Fragment>
        <TableRow className={cn('font-medium', isHistoryOpen && 'border-b-0')}>
          <TableCell className="sticky left-0 bg-card">
            {hasHistory && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronDown className={cn('h-4 w-4 transition-transform', isHistoryOpen && 'rotate-180')} />
                  <span className="sr-only">Toggle history</span>
                </Button>
              </CollapsibleTrigger>
            )}
          </TableCell>
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
          <TableCell className="text-center">
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
          </TableCell>
        </TableRow>
        {hasHistory && (
          <CollapsibleContent asChild>
            <TableRow className="bg-muted/30 hover:bg-muted/40">
              <TableCell colSpan={9} className="p-0">
                <div className="p-4">
                  <h4 className="mb-2 text-sm font-semibold">Rate History</h4>
                  <div className="grid gap-2">
                    {product.rateHistory.map((history, i) => (
                      <div key={i} className="grid grid-cols-5 gap-x-4 text-sm text-muted-foreground p-2 rounded-md bg-background">
                        <div className="truncate"><strong>Rate:</strong> {history.rate.toFixed(2)}</div>
                        <div className="truncate"><strong>GST:</strong> {history.gst.toFixed(2)}%</div>
                        <div className="truncate"><strong>Final:</strong> {history.finalRate.toFixed(2)}</div>
                        <div className="truncate col-span-1"><strong>Party:</strong> {history.partyName}</div>
                        <div className="truncate"><strong>Date:</strong> {new Date(history.updatedAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </CollapsibleContent>
        )}
      </Fragment>
    </Collapsible>
  );
}
