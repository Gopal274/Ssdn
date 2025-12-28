
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IRate {
  rate: number;
  gst: number;
  finalRate: number;
  partyName: string;
  billDate?: Date;
  pageNo?: string;
  category?: string;
  updatedAt: Date;
}

export interface IProduct extends Document {
  productName: string;
  unit: string;
  currentRate: IRate;
  rateHistory: IRate[];
}

const RateSchema: Schema<IRate> = new Schema({
  rate: { type: Number, required: true },
  gst: { type: Number, required: true },
  finalRate: { type: Number, required: true },
  partyName: { type: String, required: true, trim: true },
  billDate: { type: Date },
  pageNo: { type: String, trim: true },
  category: { type: String, trim: true },
  updatedAt: { type: Date, required: true },
}, { _id: false });

const ProductSchema: Schema<IProduct> = new Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  currentRate: {
    type: RateSchema,
    required: true,
  },
  rateHistory: {
    type: [RateSchema],
    default: [],
  },
}, {
  timestamps: true,
});

const Product: Model<IProduct> = models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
