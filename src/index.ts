import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { __prod__ } from './config/constants';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import { buildSchema } from 'type-graphql';
import { resolvers } from './resolvers';
import { ApolloContext } from './config/types';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

dotenv.config();

const main = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  const app = express();
  const PORT = process.env.PORT || 5005;

  // Redis
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // only in https
      },
      saveUninitialized: false,
      secret: process.env.REDIS_SECRET as string,
      resave: false,
    })
  );

  // Apollo GraphQL
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: resolvers, // import resolvers into src/resolvers/index
      validate: false,
    }),
    plugins: [
      __prod__
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context: ({ req, res }): ApolloContext => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
};

main();
