import mongoose from "mongoose";
import { Unit, UnitDocument } from "../models";
import { ProductRepo } from "./product-repo";

export class UnitRepo {
  constructor() {
  }

  async createUnit(clientId: string, userId: string, data: {
    abbreviation: string;
    name: string;
    baseUnitId?: string;
    conversionFactor?: number;
  }): Promise<UnitDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { abbreviation, name, baseUnitId, conversionFactor } =
        data;
      const unit = new Unit({
        clientId,
        abbreviation,
        name,
        conversionFactor,
        createdBy: userId,
        updatedBy: userId,
      });
      if(!baseUnitId && conversionFactor !== undefined) {
        const baseUnit = await Unit.findOne({ _id: baseUnitId, clientId });
        if (!baseUnit) {
          throw new Error("Base unit does not exist");
        }
        unit.baseUnit = {
          id: baseUnit._id as string,
          name: baseUnit.name,
        }
      }
      await unit.save({ session });
      await session.commitTransaction();
      return unit;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findUnits(
    clientId: string,
    filters: {
      name?: string;
      abbreviation?: string;
      baseUnitId?: string;
    }
  ): Promise<UnitDocument[]> {
    const query: any = { clientId };
    if (filters.name) query.name = { $regex: filters.name, $options: "i" };
    if (filters.abbreviation)
      query.abbreviation = { $regex: filters.abbreviation, $options: "i" };
    if (filters.baseUnitId) query["baseUnit.id"] = filters.baseUnitId;
    return Unit.aggregate([
      { $match: query },
      {
        $sort: { conversionFactor: 1 },
      },
      {
        $group: {
          _id: "$baseUnit.id",
          units: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
  }

  async findUnitById(
    clientId: string,
    unitId: string
  ): Promise<UnitDocument | null> {
    return Unit.findOne({ _id: unitId, clientId });
  }
  
  async updateUnit(
    clientId: string,
    userId: string,
    unitId: string,
    data: {
      abbreviation?: string;
      name?: string;
      baseUnitId?: string;
      conversionFactor?: number;
    },
    session: mongoose.ClientSession,
  ): Promise<UnitDocument | null> {
    try {
      const { abbreviation, name, baseUnitId, conversionFactor } = data;
  
      // Initialize an empty update object
      const updateData: any = {};
  
      // Check if baseUnitId is provided and fetch the base unit
      if (baseUnitId) {
        const baseUnitExist = await Unit.findOne({ _id: baseUnitId, clientId });
        if (!baseUnitExist) {
          throw new Error("Base unit does not exist");
        }
        updateData.baseUnit = {
          id: baseUnitExist._id as string,
          name: baseUnitExist.name,
        };
      }
  
      // Add to updateData only if fields are provided
      if (abbreviation) updateData.abbreviation = abbreviation;
      // if (name) {
      //   updateData.name = name;
      //   // Update related products if name is changed
      //   await this.productRepo.updateProductsUnitName(clientId, unitId, name, session);
      // }
      if (conversionFactor !== undefined) updateData.conversionFactor = conversionFactor;
  
      // Only run update if there are fields to update
      if (Object.keys(updateData).length === 0) {
        throw new Error("No data provided to update");
      }
      updateData.updatedBy = userId;
  
      const unit = await Unit.findOneAndUpdate(
        { _id: unitId, clientId },
        updateData,
        { new: true, session, runValidators: true }
      );
  
      await session.commitTransaction();
      return unit;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
}
