import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// This file handles GET, PUT, and DELETE for a single product by ID.
// The PUT for updating rate is in a separate file.

export async function GET(
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
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
    const { id } = params;
    await dbConnect();
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}
