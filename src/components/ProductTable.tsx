
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { IProduct } from '@/models/Product';
import { PlusCircle, Loader2, ArrowUpDown, Filter, Search, Printer, SortAsc, SortDesc, ChevronLeft, ChevronRight } from 'lucide-react';

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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ProductTableRow } from './ProductTableRow';
import { AddProductForm } from './AddProductForm';
import { ScrollArea } from './ui/scroll-area';

type SortKey = 'productName' | 'updatedAt' | 'rate';
type SortDirection = 'asc' | 'desc';

const GST_SLABS = [0, 5, 12, 18, 28];

export const dynamic = 'force-dynamic';

export default function ProductTable() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'updatedAt', direction: 'desc' });
  const [productNameSearch, setProductNameSearch] = useState('');
  const [partyNameFilter, setPartyNameFilter] = useState<string[]>([]);
  const [partyNameSearch, setPartyNameSearch] = useState('');
  const [partySortDir, setPartySortDir] = useState<SortDirection>('asc');
  const [gstFilter, setGstFilter] = useState<number[]>([]);
  const [unitFilter, setUnitFilter] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  const uniquePartyNames = useMemo(() => {
    const names = products
      .map(p => p.currentRate?.partyName)
      .filter((name): name is string => !!name);
    return [...new Set(names)];
  }, [products]);

  const uniqueUnits = useMemo(() => {
    const units = products.map(p => p.unit).filter((unit): unit is string => !!unit);
    return [...new Set(units)].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredPartyNamesForDropdown = useMemo(() => {
    // This list is just for the dropdown checkboxes, it doesn't filter the main table directly with search
    return uniquePartyNames
      .sort((a, b) => {
        if (partySortDir === 'asc') {
          return a.localeCompare(b);
        } else {
          return b.localeCompare(a);
        }
      });
  }, [uniquePartyNames, partySortDir]);


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

  const filteredAndSortedProducts = useMemo(() => {
    let sortableProducts = [...products];

    // Apply product name search
    if (productNameSearch) {
      sortableProducts = sortableProducts.filter(p =>
        p.productName.toLowerCase().includes(productNameSearch.toLowerCase())
      );
    }
    
    // Apply party name search from the dropdown's input
    if (partyNameSearch) {
        sortableProducts = sortableProducts.filter(p =>
            p.currentRate?.partyName?.toLowerCase().includes(partyNameSearch.toLowerCase())
        );
    }

    // Apply party name filter from checkboxes
    if (partyNameFilter.length > 0) {
      sortableProducts = sortableProducts.filter(p =>
        p.currentRate?.partyName && partyNameFilter.includes(p.currentRate.partyName)
      );
    }

    // Apply GST filter
    if (gstFilter.length > 0) {
      sortableProducts = sortableProducts.filter(p =>
        p.currentRate?.gst !== undefined && gstFilter.includes(p.currentRate.gst)
      );
    }
    
    // Apply Unit filter
    if (unitFilter.length > 0) {
      sortableProducts = sortableProducts.filter(p => 
        unitFilter.includes(p.unit)
      );
    }


    // Apply sorting
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        let aValue: string | number, bValue: string | number;

        if (sortConfig.key === 'productName') {
          aValue = a.productName.toLowerCase();
          bValue = b.productName.toLowerCase();
        } else if (sortConfig.key === 'rate') {
          aValue = a.currentRate?.rate || 0;
          bValue = b.currentRate?.rate || 0;
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
  }, [products, sortConfig, productNameSearch, partyNameSearch, partyNameFilter, gstFilter, unitFilter]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [productNameSearch, partyNameSearch, partyNameFilter, gstFilter, unitFilter]);


  const totalProducts = filteredAndSortedProducts.length;
  const isShowingAll = rowsPerPage === totalProducts;

  const paginatedProducts = useMemo(() => {
    if (isShowingAll) return filteredAndSortedProducts;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage, rowsPerPage, isShowingAll]);

  const totalPages = isShowingAll ? 1 : Math.ceil(totalProducts / rowsPerPage);


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

  const handlePartyNameFilterChange = (partyName: string) => {
    setPartyNameFilter(prev =>
      prev.includes(partyName)
        ? prev.filter(p => p !== partyName)
        : [...prev, partyName]
    );
  };
  
  const handleUnitFilterChange = (unit: string) => {
    setUnitFilter(prev =>
      prev.includes(unit)
        ? prev.filter(u => u !== unit)
        : [...prev, unit]
    );
  };

  const handleGstFilterChange = (gstSlab: number) => {
    setGstFilter(prev =>
      prev.includes(gstSlab)
        ? prev.filter(g => g !== gstSlab)
        : [...prev, gstSlab]
    );
  };
  
  const handleSelectAllParties = () => {
    const allVisiblePartyNames = filteredPartyNamesForDropdown.map(p => p);
    const allSelected = allVisiblePartyNames.every(name => partyNameFilter.includes(name));

    if (allSelected) {
      // Deselect all
      setPartyNameFilter([]);
    } else {
      // Select all visible
      setPartyNameFilter([...new Set([...partyNameFilter, ...allVisiblePartyNames])]);
    }
  };


  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm card">
      <CardHeader className="no-print">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="font-headline">Goods Rate Register</CardTitle>
          <div className="flex w-full sm:w-auto sm:justify-end gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={productNameSearch}
                onChange={(e) => setProductNameSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" onClick={() => window.print()} className="shrink-0">
                <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="shrink-0">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className="font-headline">Add New Product</DialogTitle>
                </DialogHeader>
                <AddProductForm 
                  onProductAdded={handleProductAdded}
                  uniqueUnits={uniqueUnits}
                  uniquePartyNames={uniquePartyNames}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className='card-content-print'>
        <div className="rounded-md border overflow-x-auto">
          <style jsx>{`
            @media print {
                .card-content-print {
                    padding: 0;
                }
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
                  <TableHead className="w-[80px] font-bold text-foreground">S.No</TableHead>
                  <TableHead className="font-bold text-foreground min-w-[200px]">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="-ml-4 h-8 no-print">
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => requestSort('updatedAt', 'desc')}>
                          Sort by Newest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => requestSort('updatedAt', 'asc')}>
                          Sort by Oldest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead className="text-right font-bold text-foreground min-w-[120px]">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 no-print">
                            Rate
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => requestSort('rate', 'asc')}>
                            Sort Low to High
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => requestSort('rate', 'desc')}>
                            Sort High to Low
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableHead>
                  <TableHead className="font-bold text-foreground min-w-[100px]">
                    <div className='flex items-center gap-1'>
                      Unit
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 no-print" disabled={uniqueUnits.length === 0}>
                              <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="start" 
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <DropdownMenuLabel>Filter by Unit</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                           {uniqueUnits.map(unit => (
                              <DropdownMenuCheckboxItem
                                key={unit}
                                checked={unitFilter.includes(unit)}
                                onSelect={(e) => e.preventDefault()}
                                onClick={() => handleUnitFilterChange(unit)}
                              >
                                {unit}
                              </DropdownMenuCheckboxItem>
                          ))}
                          {unitFilter.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => setUnitFilter([])}
                                className="text-destructive"
                              >
                                Clear unit filter
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-foreground min-w-[120px]">
                    <div className='flex items-center justify-end gap-1'>
                       GST %
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 no-print">
                              <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <DropdownMenuLabel>Filter by GST Slab</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                           {GST_SLABS.map(slab => (
                              <DropdownMenuCheckboxItem
                                key={slab}
                                checked={gstFilter.includes(slab)}
                                onSelect={(e) => e.preventDefault()}
                                onClick={() => handleGstFilterChange(slab)}
                              >
                                {slab}% {slab === 0 && '(Tax Free)'}
                              </DropdownMenuCheckboxItem>
                          ))}
                          {gstFilter.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => setGstFilter([])}
                                className="text-destructive"
                              >
                                Clear GST filter
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-foreground min-w-[140px]">Final Rate</TableHead>
                  <TableHead className="font-bold text-foreground min-w-[200px]">
                    <div className='flex items-center gap-1'>
                       Party Name
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 no-print" disabled={uniquePartyNames.length === 0}>
                              <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="start" 
                          className="w-[250px]"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <DropdownMenuLabel>Filter by Party</DropdownMenuLabel>
                           <div className="px-2 pt-2 pb-1 flex items-center gap-1">
                             <Input
                                placeholder="Search party..."
                                value={partyNameSearch}
                                onChange={(e) => setPartyNameSearch(e.target.value)}
                                className="h-8"
                              />
                              <Button variant="ghost" size="icon" className='h-8 w-8 shrink-0' onClick={() => setPartySortDir('asc')} disabled={partySortDir === 'asc'}>
                                <SortAsc className='h-4 w-4'/>
                              </Button>
                               <Button variant="ghost" size="icon" className='h-8 w-8 shrink-0' onClick={() => setPartySortDir('desc')} disabled={partySortDir === 'desc'}>
                                <SortDesc className='h-4 w-4'/>
                              </Button>
                          </div>
                          <DropdownMenuSeparator />
                          <ScrollArea className="h-[200px]">
                            {filteredPartyNamesForDropdown.length > 0 && (
                              <DropdownMenuCheckboxItem
                                onSelect={(e) => e.preventDefault()}
                                onClick={handleSelectAllParties}
                                checked={filteredPartyNamesForDropdown.every(name => partyNameFilter.includes(name))}
                              >
                                {filteredPartyNamesForDropdown.every(name => partyNameFilter.includes(name)) ? 'Deselect All' : 'Select All'}
                              </DropdownMenuCheckboxItem>
                            )}
                           {filteredPartyNamesForDropdown.map(partyName => (
                              <DropdownMenuCheckboxItem
                                key={partyName}
                                checked={partyNameFilter.includes(partyName)}
                                onSelect={(e) => e.preventDefault()} // prevent menu from closing
                                onClick={() => handlePartyNameFilterChange(partyName)}
                              >
                                {partyName}
                              </DropdownMenuCheckboxItem>
                          ))}
                          </ScrollArea>
                           {filteredPartyNamesForDropdown.length === 0 && (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No party found.
                            </div>
                          )}
                          {(partyNameFilter.length > 0 || partyNameSearch !== '') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => {
                                  setPartyNameFilter([]);
                                  setPartyNameSearch('');
                                }}
                                className="text-destructive"
                              >
                                Clear filters
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground min-w-[130px]">Bill Date</TableHead>
                  <TableHead className="font-bold text-foreground min-w-[120px]">Page No.</TableHead>
                  <TableHead className="font-bold text-foreground min-w-[150px]">Category</TableHead>
                  <TableHead className="text-center w-[100px] font-bold text-foreground no-print">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Loading ledger...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product, index) => (
                    <ProductTableRow
                      key={product._id}
                      product={product}
                      index={(currentPage - 1) * rowsPerPage + index}
                      onRateUpdated={handleRateUpdated}
                      onProductDeleted={handleProductDeleted}
                    />
                  ))
                )}
              </TableBody>
            </Table>
             {filteredAndSortedProducts.length === 0 && !loading && (
                <div className="text-center p-4 text-muted-foreground">
                    No products match the current filters.
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className='no-print flex items-center justify-between pt-6'>
         <div className="text-sm text-muted-foreground">
            {`Showing ${isShowingAll ? 'all' : Math.min((currentPage - 1) * rowsPerPage + 1, totalProducts)}
             to ${isShowingAll ? totalProducts : Math.min(currentPage * rowsPerPage, totalProducts)}
             of ${totalProducts} products`}
        </div>
        <div className='flex items-center space-x-6'>
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                    value={isShowingAll ? 'all' : `${rowsPerPage}`}
                    onValueChange={(value) => {
                        setRowsPerPage(value === 'all' ? totalProducts : Number(value))
                        setCurrentPage(1)
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={rowsPerPage} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                        </SelectItem>
                        ))}
                         <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {currentPage} of {totalPages}
            </div>
            <div className='flex items-center space-x-2'>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={isShowingAll || currentPage === 1}
                >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={isShowingAll || currentPage === totalPages}
                >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}

    