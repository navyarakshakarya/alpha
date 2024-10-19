import mongoose from "mongoose";
import { UnitDocument } from "../models";
import { ProductRepo, UnitRepo } from "../repos";

export class UnitService {
  private unitRepo: UnitRepo;
  private productRepo: ProductRepo;

  constructor() {
    this.unitRepo = new UnitRepo();
    this.productRepo = new ProductRepo();
  }

  async getUnits(
    clientId: string,
    filters: {
      name?: string;
      abbreviation?: string;
      baseUnitId?: string;
    }
  ): Promise<UnitDocument[]> {
    return this.unitRepo.findUnits(clientId, filters);
  }

  async getUnit(
    clientId: string,
    unitId: string
  ): Promise<UnitDocument | null> {
    return this.unitRepo.findUnitById(clientId, unitId);
  }

  async createUnit(
    clientId: string,
    userId: string,
    data: {
      abbreviation: string;
      name: string;
      baseUnitId?: string;
      conversionFactor?: number;
    }
  ): Promise<UnitDocument> {
    return this.unitRepo.createUnit(clientId, userId, data);
  }

  async updateUnit(
    clientId: string,
    userId: string,
    unitId: string,
    data: Partial<UnitDocument>
  ): Promise<UnitDocument | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (data.name) {
        await this.productRepo.updateProductsUnitName(
          clientId,
          userId,
          unitId,
          data.name,
          session
        );
      }
      return this.unitRepo.updateUnit(clientId, userId, unitId, data, session);
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
