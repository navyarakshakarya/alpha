import mongoose from "mongoose";
import { CategoryDocument } from "../models";
import { CategoryRepo, ProductRepo } from "../repos";

export class CategoryService {
  private categoryRepo: CategoryRepo;
  private productRepo: ProductRepo;

  constructor() {
    this.categoryRepo = new CategoryRepo();
    this.productRepo = new ProductRepo();
  }

  async getCategories(
    clientId: string,
    filters?: {
      name?: string;
      parentCategory?: string;
      categoryCode?: string;
    }
  ): Promise<CategoryDocument[]> {
    return this.categoryRepo.findCategories(clientId, filters);
  }

  async getCategoryById(
    clientId: string,
    categoryId: string
  ): Promise<CategoryDocument | null> {
    return this.categoryRepo.findCategoryById(clientId, categoryId);
  }

  async createCategory(
    clientId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      parentCategory?: string;
      categoryCode: string;
    }
  ): Promise<CategoryDocument> {
    return this.categoryRepo.createCategory(clientId, userId, data);
  }

  async updateCategory(
    clientId: string,
    userId: string = "system",
    categoryId: string,
    data: Partial<CategoryDocument>
  ): Promise<CategoryDocument | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const updatedCategory = { ...data, clientId };
      if (updatedCategory.name) {
        // Update the name of all products belonging to this category
        await this.productRepo.updateProductsCategoryName(
          clientId,
          userId,
          categoryId,
          updatedCategory.name,
          session
        );
      }
      return this.categoryRepo.updateCategory(
        clientId,
        userId,
        categoryId,
        updatedCategory,
        session
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
