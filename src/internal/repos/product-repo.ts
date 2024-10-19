import mongoose from "mongoose";
import { CategoryDocument, Product, ProductDocument, Unit, UnitDocument } from "../models";

export class ProductRepo {
  constructor() {}

  async createProduct(
    clientId: string,
    userId: string,
    category: CategoryDocument,
    unit: UnitDocument,
    data: {
      name: string;
      price: number;
      description: string;
      categoryId: string;
      brands?: string[];
      variants?: string[];
    }
  ): Promise<ProductDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { name, price, description, brands, variants } = data;
      const product = new Product({
        clientId,
        name,
        price,
        description,
        category: {
          id: category._id,
          name: category.name,
        },
        unit: {
          id: unit._id,
          name: unit.name,
        },
        brands,
        variants,
        createdBy: userId,
        updatedBy: userId,
      });
      const productsCount = await this.countProductByCategory(clientId, category._id as string);
      const paddedProductCount = (productsCount + 1).toString().padStart(4, '0');
      const productCode = category.categoryCode + "#" + paddedProductCount;
      product.productCode = productCode;
      await product.save({ session });
      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findProducts(
    clientId: string,
    filters: {
      name?: string;
      categoryId?: string;
      brand?: string;
    } = {}
  ): Promise<ProductDocument[]> {
    const query: any = { clientId };
    if (filters.name) query.name = { $regex: filters.name, $options: "i" };
    if (filters.categoryId) query["category.id"] = filters.categoryId;
    if (filters.brand) query.brands = { $in: [filters.brand] };
    return Product.find(query);
  }

  async findProductById(
    clientId: string,
    productId: string
  ): Promise<ProductDocument | null> {
    return Product.findOne({ clientId, _id: productId });
  }

  async updateProduct(
    clientId: string,
    userId: string,
    productId: string,
    data: Partial<ProductDocument>
  ): Promise<ProductDocument | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const product = await this.findProductById(clientId, productId);
      if (!product) {
        throw new Error("Product not found");
      }

      const updateData: any = {};

      // Add the fields to updateData only if they are provided in the `data` object
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.brands !== undefined) updateData.brands = data.brands;
      if (data.variants !== undefined) updateData.variants = data.variants;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.discount !== undefined) updateData.discount = data.discount;
      if (data.taxRate !== undefined) updateData.tax = data.taxRate;

      // If no fields to update are provided, throw an error
      if (Object.keys(updateData).length === 0) {
        throw new Error("No data provided to update");
      }

      updateData.updatedBy = userId;

      const updatedProduct = await Product.findOneAndUpdate(
        { clientId, _id: productId },
        updateData,
        { new: true, session, runValidators: true }
      );

      await session.commitTransaction();
      return updatedProduct;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateProductsCategoryName(
    clientId: string,
    userId: string,
    categoryId: string,
    name: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      await Product.updateMany(
        { clientId, "category.id": categoryId },
        { "category.name": name, updatedBy: userId },
        { session, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async updateProductsUnitName(
    clientId: string,
    userId: string,
    unitId: string,
    name: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      await Product.updateMany(
        { clientId, "unit.id": unitId },
        { "unit.name": name, updatedBy: userId },
        { session, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async countProductByCategory(
    clientId: string,
    categoryId: string,
  ): Promise<number> {
    try {
      const count = await Product.countDocuments({
        clientId,
        "category.id": categoryId,
      });
      return count ? count : 0;
    } catch (error) {
      throw error;
    }
  }
}
