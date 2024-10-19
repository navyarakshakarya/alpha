import { ProductDocument } from "../models";
import { CategoryRepo, ProductRepo, UnitRepo } from "../repos";

export class ProductService {
  private productRepo: ProductRepo;
  private categoryRepo: CategoryRepo;
  private unitRepo: UnitRepo;

  constructor() {
    this.productRepo = new ProductRepo();
    this.categoryRepo = new CategoryRepo();
    this.unitRepo = new UnitRepo();
  }

  async getProducts(
    clientId: string,
    filters?: {
      name?: string;
      categoryId?: string;
      brand?: string;
    }
  ): Promise<ProductDocument[]> {
    return await this.productRepo.findProducts(clientId, filters);
  }

  async getProductById(
    clientId: string,
    productId: string
  ): Promise<ProductDocument | null> {
    return await this.productRepo.findProductById(clientId, productId);
  }

  async createProduct(
    clientId: string,
    userId: string,
    data: {
      name: string;
      description: string;
      price: number;
      categoryId: string;
      unitId: string;
      brand: string;
      variants?: string[];
      images?: string[];
    }
  ): Promise<ProductDocument> {
    try {
      const categoryExist = await this.categoryRepo.findCategoryById(
        clientId,
        data.categoryId
      );
      if (!categoryExist) throw new Error("Category not found");
      const unitExist = await this.unitRepo.findUnitById(
        clientId,
        data.unitId
      );
      if (!unitExist) throw new Error("Unit not found");
      return await this.productRepo.createProduct(
        clientId,
        userId,
        categoryExist,
        unitExist,
        data
      );
    } catch (error) {
      console.log(error)
      throw new Error("Error creating product");
    }
  }

  async updateProduct(
    clientId: string,
    userId: string,
    productId: string,
    data: Partial<ProductDocument>
  ): Promise<ProductDocument | null> {
    try {
      if (data.category?.id) {
        const categoryExist = await this.categoryRepo.findCategoryById(
          clientId,
          data.category.id
        );
        if (!categoryExist) throw new Error("Category not found");
        data.category = {
          id: categoryExist._id as string,
          name: categoryExist.name,
        }
      }
      if (data.unit?.id) {
        const unitExist = await this.unitRepo.findUnitById(
          clientId,
          data.unit.id
        );
        if (!unitExist) throw new Error("Unit not found");
        data.unit = {
          id: unitExist._id as string,
          name: unitExist.name,
        }
      }
      return await this.productRepo.updateProduct(clientId, userId, productId, data);
    } catch (error) {
      throw new Error("Error updating product");
    }
  }
}
