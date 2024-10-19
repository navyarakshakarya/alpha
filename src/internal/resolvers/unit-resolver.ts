import { GraphQLError } from "graphql";
import { UnitService } from "../services";

const unitService = new UnitService();

export const UnitResolver = {
  Query: {
    getUnits: async (
      _: any,
      {
        filters,
      }: {
        filters: {
          name: string;
          abbreviation?: string;
          baseUnitId?: string;
        };
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const units = await unitService.getUnits(context.clientId, filters);
        return units;
      } catch (error: any) {
        throw new GraphQLError(error.message);
      }
    },
    getUnit: async (
      _: any,
      {
        id,
      }: {
        id: string;
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const unit = await unitService.getUnit(context.clientId, id);
        return unit;
      } catch (error: any) {
        throw new GraphQLError(error.message);
      }
    },
  },
  Mutation: {
    createUnit: async (
      _: any,
      {
        data,
      }: {
        data: {
          name: string;
          abbreviation: string;
          baseUnitId?: string;
          conversionFactor?: number;
        };
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const unit = await unitService.createUnit(context.clientId, context.userId, data);
        return unit;
      } catch (error: any) {
        throw new GraphQLError(error.message);
      }
    },
    updateUnit: async (
      _: any,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          abbreviation?: string;
          baseUnitId?: string;
          conversionFactor?: number;
        };
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const unit = await unitService.updateUnit(context.clientId, context.userId, id, input);
        return unit;
      } catch (error: any) {
        throw new GraphQLError(error.message);
      }
    },
    deleteUnit: async (
      _: any,
      {
        id,
      }: {
        id: string;
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const unit = await unitService.updateUnit(context.clientId, context.userId, id, {
          deletedAt: new Date(),
        });
        return unit;
      } catch (error: any) {
        throw new GraphQLError(error.message);
      }
    },
  },
};
