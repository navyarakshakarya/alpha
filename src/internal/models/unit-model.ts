import { Schema } from "mongoose";
import { BaseDocument, createBaseModel } from "./base-model";

// Unit Model
export interface UnitDocument extends BaseDocument {
  abbreviation: string;
  name: string;
  description?: string;
  baseUnit?: {
    id: string;
    name: string;
  };
  conversionFactor: number;
}

const unitSchema = new Schema<UnitDocument>({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  description: { type: String },
  baseUnit: {
    id: { type: String },
    name: { type: String },
  },
  conversionFactor: { type: Number, required: true, default: 1 },
});

unitSchema.index({ clientId: 1, name: 1, deletedAt: 1 }, { unique: true });

export const Unit = createBaseModel<UnitDocument>("Unit", unitSchema, "units");
