import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { calculateFinalRate } from '@/lib/utils';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await dbConnect();

  try {
    const body = await request.json();
    const { rate, gst, partyName } = body;

    if (rate === undefined || gst === undefined || !partyName) {
        return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Push current rate to history
    product.rateHistory.unshift(product.currentRate);

    // Update current rate
    const finalRate = calculateFinalRate(rate, gst);
    product.currentRate = {
      rate,
      gst,
      finalRate,
      partyName,
      updatedAt: new Date(),
    };

    await product.save();

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
