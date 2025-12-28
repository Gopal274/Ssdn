
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await dbConnect();

  try {
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    if (!product.rateHistory || product.rateHistory.length === 0) {
      return NextResponse.json({ success: false, message: 'No history available to restore. Cannot delete the only rate.' }, { status: 400 });
    }

    // The new current rate will be the most recent entry in the history
    const newCurrentRate = product.rateHistory.shift(); // .shift() removes the first element and returns it
    
    if (!newCurrentRate) {
        // This should not happen if the length check passed, but as a safeguard
         return NextResponse.json({ success: false, message: 'History is empty.' }, { status: 400 });
    }

    product.currentRate = newCurrentRate;
    
    await product.save();

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
