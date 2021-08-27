import { ApolloContext } from './../config/types';
import { UserModel } from './../models/User';
import { User } from './../models/User';

import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  ObjectType,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: ApolloContext
  ): Promise<UserResponse> {
    let errors = [];
    const { username, password } = options;

    const checkUsername = await UserModel.findOne({ username });

    if (checkUsername)
      errors.push({
        field: 'Username',
        message: 'Username already taken',
      });

    if (username.length < 2)
      errors.push({
        field: 'Username',
        message: 'Username length should be greater than 2',
      });

    if (password.length <= 8)
      errors.push({
        field: 'Password',
        message: 'Password length should be greater or equal to 8',
      });

    if (errors.length > 0) return { errors };

    const hashedPw = await argon2.hash(password);
    const user = await UserModel.create({
      username,
      password: hashedPw,
    });

    req.session.userId = user._id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: ApolloContext
  ): Promise<UserResponse> {
    const user = await UserModel.findOne({ username: options.username });

    if (!user)
      return {
        errors: [
          {
            field: 'username',
            message: 'Username not found',
          },
        ],
      };

    const validPassword = await argon2.verify(
      user.password,
      options.password
    );

    if (!validPassword)
      return {
        errors: [
          {
            field: 'Password',
            message: 'Password is invalid',
          },
        ],
      };

    req.session.userId = user._id;
    return { user };
  }

  @Query(() => UserResponse, { nullable: true })
  async me(@Ctx() { req }: ApolloContext): Promise<UserResponse> {
    if (!req.session.userId)
      return {
        errors: [
          {
            field: 'None',
            message: "You're not logged-in",
          },
        ],
      };

    const user = await UserModel.findOne({ _id: req.session.userId });
    if (!user)
      return {
        errors: [
          {
            field: 'None',
            message: 'User not found, contact support',
          },
        ],
      };

    return { user };
  }
}
