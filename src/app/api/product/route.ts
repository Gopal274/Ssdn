
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { calculateFinalRate } from '@/lib/utils';

export async function POST(request: Request) {
  await dbConnect();
    try {
        const body = await request.json();
        const { productName, unit, rate, gst, partyName, extraDetails } = body;

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
                extraDetails: {
                  billDate: extraDetails?.billDate || undefined,
                  pageNo: extraDetails?.pageNo || undefined,
                  category: extraDetails?.category || undefined,
                },
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
