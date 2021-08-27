import { PostModel } from './../models/Post';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../models/Post';

@Resolver()
export class PostResolver {
  @Query(() => [Post], { nullable: true })
  async posts(): Promise<Post[] | null> {
    const posts = await PostModel.find().exec();
    if (!posts) return null;
    return posts;
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('_id', () => String) _id: string): Promise<Post | null> {
    const post = await PostModel.findById(_id);
    if (!post) return null;
    return post;
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title', () => String) title: string
  ): Promise<Post> {
    const post = await PostModel.create({ title });
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('_id', () => String) _id: string,
    @Arg('title', () => String) title: string
  ): Promise<Post | null> {
    const post = await PostModel.findById(_id);
    if (!post || typeof title === 'undefined') {
      return null;
    }

    post.title = title;
    await PostModel.findByIdAndUpdate(_id, post);
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('_id', () => String) _id: string
  ): Promise<boolean> {
    try {
      await PostModel.findByIdAndDelete(_id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
