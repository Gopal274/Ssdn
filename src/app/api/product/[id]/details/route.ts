
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product, { type ICurrentRateUpdate } from '@/models/Product';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    await dbConnect();
    const body: ICurrentRateUpdate = await request.json();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    
    if (!product.currentRate) {
        return NextResponse.json({ success: false, message: 'Product has no current rate to update.' }, { status: 400 });
    }

    // Update only the provided fields in the currentRate
    let changed = false;
    if (body.billDate !== undefined) {
        product.currentRate.billDate = body.billDate || undefined;
        changed = true;
    }
    if (body.pageNo !== undefined) {
        product.currentRate.pageNo = body.pageNo || undefined;
        changed = true;
    }
    if (body.category !== undefined) {
        product.currentRate.category = body.category || undefined;
        changed = true;
    }

    if (changed) {
      await product.save();
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
