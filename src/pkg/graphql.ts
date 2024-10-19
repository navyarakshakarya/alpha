import { GraphQLDateTime } from "graphql-scalars";
import { CategoryResolver, ProductResolver, UnitResolver } from "../internal/resolvers";

export const resolvers = {
  Date: GraphQLDateTime,
  Query: {
    ...ProductResolver.Query,
    ...CategoryResolver.Query,
    ...UnitResolver.Query,
  },
  Mutation: {
    ...ProductResolver.Mutation,
    ...CategoryResolver.Mutation,
    ...UnitResolver.Mutation,
  },
  Subscription: {
    _: () => {},
  }
};