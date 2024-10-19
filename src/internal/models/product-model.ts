import { Schema } from "mongoose";
import { BaseDocument, createBaseModel } from "./base-model";

export interface ProductDocument extends BaseDocument {
  name: string;
  productCode: string;
  description?: string;
  category: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
  };
  brands?: string[];
  variants?: string[];
  barcode?: string;
  price?: number;
  discount?: number;
  taxRate?: number;
}

const productSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  productCode: { type: String, required: true },
  description: { type: String },
  category: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  unit: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  brands: { type: [String], default: [] },
  variants: { type: [String], default: [] },
  barcode: { type: String },
  price: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
});

productSchema.index({ clientId: 1, name: 1, deletedAt: 1 }, { unique: true });

export const Product = createBaseModel<ProductDocument>(
  "Product",
  productSchema,
  "products"
);
