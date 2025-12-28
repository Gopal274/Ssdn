import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const body = await request.json();
    const { updatedAt } = body;

    if (!updatedAt) {
      return NextResponse.json({ success: false, message: 'Missing history entry identifier' }, { status: 400 });
    }
    
    await dbConnect();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const originalHistoryCount = product.rateHistory.length;
    
    // The updatedAt from JSON will be a string, so we need to compare timestamps
    const updatedAtTimestamp = new Date(updatedAt).getTime();

    product.rateHistory = product.rateHistory.filter(
      (entry) => new Date(entry.updatedAt).getTime() !== updatedAtTimestamp
    );

    if (product.rateHistory.length === originalHistoryCount) {
        return NextResponse.json({ success: false, message: 'History entry not found' }, { status: 404 });
    }

    await product.save();

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
