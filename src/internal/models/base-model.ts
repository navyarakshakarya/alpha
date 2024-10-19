import mongoose, { Schema, Document } from "mongoose";

// Base Document Interface
interface BaseDocument extends Document {
  clientId: string;
  isActive: boolean;
  deletedAt?: Date;
  createdBy: string;
  updatedBy: string;
}

// Base Schema
const baseSchema = new Schema<BaseDocument>(
  {
    clientId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Create Base Model Function
const createBaseModel = <T extends BaseDocument>(
  modelName: string,
  schema: Schema<T>,
  collectionName: string
) => {
  return mongoose.model<T>(
    modelName,
    new Schema<T>(
      {
        ...baseSchema.obj,
        ...schema.obj,
      },
      { timestamps: true, collection: collectionName }
    )
  );
};

export { BaseDocument, createBaseModel };
