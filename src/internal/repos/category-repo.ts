import mongoose from "mongoose";
import { Category, CategoryDocument } from "../models";
import { ProductRepo } from "./product-repo";

export class CategoryRepo {
  constructor() {}

  async createCategory(
    clientId: string,
    userId: string,
    data: {
      name: string;
      categoryCode: string;
      description?: string;
      parentCategory?: string;
    }
  ): Promise<CategoryDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const category = new Category(data);
      category.clientId = clientId;
      category.createdBy = userId;
      category.updatedBy = userId;
      await category.save({ session });
      await session.commitTransaction();
      return category;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findCategories(
    clientId: string,
    filters: {
      name?: string;
      categoryCode?: string;
      parentCategory?: string;
    } = {}
  ): Promise<CategoryDocument[]> {
    const query: any = { clientId };
    if (filters.name) query.name = { $regex: filters.name, $options: "i" };
    if (filters.categoryCode) query.categoryCode = filters.categoryCode;
    if (filters.parentCategory) query.parentCategory = filters.parentCategory;
    return Category.find(query).sort({ name: 1 });
  }

  async findCategoryById(
    clientId: string,
    categoryId: string
  ): Promise<CategoryDocument | null> {
    return Category.findOne({ clientId, _id: categoryId });
  }

  async updateCategory(
    clientId: string,
    userId: string,
    categoryId: string,
    data: Partial<CategoryDocument>,
    session: mongoose.ClientSession
  ): Promise<CategoryDocument | null> {
    try {
      const { categoryCode, description, parentCategory } = data;
      // Prevent updating the categoryCode after creation
      if (categoryCode) {
        throw new Error("Cannot update category code after creation");
      }

      // Fetch the category to ensure it exists
      const category = await this.findCategoryById(clientId, categoryId);
      if (!category) throw new Error("Category not found");

      // Initialize an empty object for updates
      const updateData: any = {};

      // Update products category name if the name is provided
      // if (name) {
      //   updateData.name = name;
      //   await this.productRepo.updateProductsCategoryName(
      //     clientId,
      //     categoryId,
      //     category.name,
      //     session
      //   );
      // }

      // Add fields to updateData only if they are provided
      if (description) updateData.description = description;
      if (parentCategory) updateData.parentCategory = parentCategory;

      // If no fields are provided for update, throw an error
      if (Object.keys(updateData).length === 0) {
        throw new Error("No data provided to update");
      }
      updateData.updatedBy = userId;
      // Perform the update
      const updatedCategory = await Category.findOneAndUpdate(
        { clientId, _id: categoryId },
        updateData,
        { new: true, session, runValidators: true }
      );

      await session.commitTransaction();
      return updatedCategory;
    } catch (error) {
      throw error;
    }
  }
}
