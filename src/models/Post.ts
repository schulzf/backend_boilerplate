import { getModelForClass, prop } from '@typegoose/typegoose';
import { Field, Float, ObjectType } from 'type-graphql';

@ObjectType()
export class Post {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop()
  title: string;

  @Field(() => Float)
  @prop({ default: Date.now() })
  createdAt: number;
}

export const PostModel = getModelForClass(Post);
