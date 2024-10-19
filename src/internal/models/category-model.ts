import { Schema } from "mongoose";
import { BaseDocument, createBaseModel } from "./base-model";

export interface CategoryDocument extends BaseDocument {
  name: string;
  categoryCode: string;
  description?: string;
  parentCategory?: string;
}

const categorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true },
  categoryCode: { type: String, required: true },
  description: { type: String },
  parentCategory: { type: String },
});

categorySchema.index({ clientId: 1, name: 1, deletedAt: 1 }, { unique: true });

export const Category = createBaseModel<CategoryDocument>(
  "Category",
  categorySchema,
  "categories"
);
