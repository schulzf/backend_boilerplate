import { prop, getModelForClass } from '@typegoose/typegoose';
import { Field, Float, ObjectType } from 'type-graphql';

@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true, unique: true })
  username: string;

  @prop({ required: true })
  password: string;

  @Field(() => Float)
  @prop({ default: Date.now() })
  createdAt: number;
}

export const UserModel = getModelForClass(User);
