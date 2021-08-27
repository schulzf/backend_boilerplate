import { UserResolver } from './user';
import { PostResolver } from './post';
import { NonEmptyArray } from 'type-graphql';

export const resolvers = [
  PostResolver,
  UserResolver,
] as NonEmptyArray<Function>;
