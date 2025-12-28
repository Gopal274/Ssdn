import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product, { IProduct } from '@/models/Product';
import { calculateFinalRate } from '@/lib/utils';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { productName, unit, rate, gst, partyName } = body;

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
      },
      rateHistory: [],
    };

    const product = await Product.create(newProductData);
    
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    let message = 'An unknown error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
        if (error.message.includes('E11000')) {
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
