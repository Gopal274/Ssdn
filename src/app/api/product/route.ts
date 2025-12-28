import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product, { IProduct } from '@/models/Product';
import { calculateFinalRate } from '@/lib/utils';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { productName, unit, rate, gst, partyName, billDate, pageNo } = body;

    if (!productName || !unit || rate === undefined || gst === undefined || !partyName) {
        return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const finalRate = calculateFinalRate(rate, gst);

    const newProductData = {
      productName,
      unit,
      currentRate: {
        rate,
        gst,
        finalRate,
        partyName,
        updatedAt: new Date(),
        billDate: billDate ? new Date(billDate) : undefined,
        pageNo,
      },
      rateHistory: [],
    };

    const product = await Product.create(newProductData);
    
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    let message = 'An unknown error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
        // Mongoose duplicate key error
        if ((error as any).code === 11000) {
            message = 'A product with this name already exists.';
            statusCode = 409; // Conflict
        } else {
            message = error.message;
            statusCode = 400; // Bad Request
        }
    }
    
    return NextResponse.json({ success: false, message }, { status: statusCode });
  }
}
