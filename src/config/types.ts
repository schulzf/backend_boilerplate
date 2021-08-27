import { Request, Response } from 'express';

export type ApolloContext = {
  req: Request & { session: any };
  res: Response;
};
