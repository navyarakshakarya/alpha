import { GraphQLError } from "graphql";
import { CategoryService } from "../services";

const categoryService = new CategoryService();

export const CategoryResolver = {
  Query: {
    getCategories: async (
      _: any,
      {
        filters,
      }: {
        filters: {
          name?: string;
          parentCategory?: string;
          categoryCode?: string;
        };
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const categories = await categoryService.getCategories(
          context.clientId,
          filters
        );
        return categories;
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    getCategory: async (
      _: any,
      {
        id,
      }: {
        id: string;
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const category = await categoryService.getCategoryById(
          context.clientId,
          id
        );
        return category;
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
  Mutation: {
    createCategory: async (
      _: any,
      {
        data,
      }: {
        data: { name: string; parentCategory?: string; categoryCode: string };
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const category = await categoryService.createCategory(
          context.clientId,
          context.userId,
          data
        );
        return category;
      } catch (error: any) {
        console.log(error);
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    updateCategory: async (
      _: any,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          parentCategory?: string;
          categoryCode?: string;
        };
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const category = await categoryService.updateCategory(
          context.clientId,
          context.userId,
          id,
          input
        );
        return category;
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    deleteCategory: async (
      _: any,
      {
        id,
      }: {
        id: string;
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        const category = await categoryService.updateCategory(
          context.clientId,
          context.userId,
          id,
          { deletedAt: new Date() }
        );
        return category;
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
