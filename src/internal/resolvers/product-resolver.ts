import { GraphQLError } from "graphql";
import { ProductService } from "../services/product-service";

const productService = new ProductService();

export const ProductResolver = {
  Query: {
    getProducts: async (
      _: any,
      {
        // input fields
        filters,
      }: {
        filters: { name?: string; categoryId?: string; brand?: string };
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        return await productService.getProducts(context.clientId, filters);
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    getProductById: async (
      _: any,
      {
        // input fields
        id,
      }: {
        id: string;
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        return await productService.getProductById(context.clientId, id);
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
  Mutation: {
    createProduct: async (
      _: any,
      {
        // input fields
        input,
      }: {
        input: {
          name: string;
          description: string;
          price: number;
          brand: string;
          categoryId: string;
          unitId: string;
          variants?: string[]
          images?: string[];
        };
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        return await productService.createProduct(context.clientId, context.userId, input);
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    updateProduct: async (
      _: any,
      {
        // input fields
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          description?: string;
          price?: number;
          brand?: string;
          categoryId?: string;
          images?: string[];
        };
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        return await productService.updateProduct(context.clientId, context.userId, id, input);
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    deleteProduct: async (
      _: any,
      {
        // input fields
        id,
      }: {
        id: string;
      },
      context: { clientId: string; userId: string }
    ) => {
      try {
        return await productService.updateProduct(context.clientId, context.userId, id, { deletedAt: new Date() });
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
  Subsciption: {
    _: {
      subscribe: async (
        _: any,
        __: any,
        context: { clientId: string; userId: string }
      ) => {
        try {
          return "HELLO";
        } catch (error: any) {
          throw new GraphQLError(error.message, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      },
    },
  },
};

// productCreated: {
//   subscribe: async (
//     _: any,
//     __: any,
//     context: { clientId: string; userId: string }
//   ) => {
//     try {
//       return await productService.subscribeToProductCreated(context.clientId);
//     } catch (error: any) {
//       throw new GraphQLError(error.message, {
//         extensions: { code: "INTERNAL_SERVER_ERROR" },
//       });
//     }
//   },
// },
// productUpdated: {
//   subscribe: async (
//     _: any,
//     __: any,
//     context: { clientId: string; userId: string }
//   ) => {
//     try {
//       return await productService.subscribeToProductUpdated(context.clientId);
//     } catch (error: any) {
//       throw new GraphQLError(error.message, {
//         extensions: { code: "INTERNAL_SERVER_ERROR" },
//       });
//     }
//   },
// },
// productDeleted: {
//   subscribe: async (
//     _: any,
//     __: any,
//     context: { clientId: string; userId: string }
//   ) => {
//     try {
//       return await productService.subscribeToProductDeleted(context.clientId);
//     } catch (error: any) {
//       throw new GraphQLError(error.message, {
//         extensions: { code: "INTERNAL_SERVER_ERROR" },
//       });
//     }
//   },