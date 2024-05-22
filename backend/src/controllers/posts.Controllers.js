import mongoose, { isValidObjectId } from "mongoose";
import { Post } from "../models/posts.Models.js";
import { User } from "../models/users.Models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteImageFromCloudinary } from "../utils/deleteImageFromCloudinary.js";

// GET ALL POSTS

const getAllPosts = asyncHandler(async (req, res) => {
  try {
  
    const allPosts = await Post.find({});
    if (!allPosts.length) {
      return res.status(404).json(new ApiResponse(404, null, "No posts found"));
    }

 
    const uniqueUserIds = new Set(allPosts.map((post) => post.userId));

  
    const users = await User.find({ _id: { $in: [...uniqueUserIds] } }); 

    const userIdMap = users.reduce((acc, user) => {
      acc[user._id] = user.username;
      return acc;
    }, {});

    const postsWithUsername = allPosts.map((post) => ({
      _id: post._id,
      userId: post.userId, 
      postedContent: post.postedContent,
      description: post.description,
      caption: post.caption,
      username: userIdMap[post.userId],
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { allPosts: postsWithUsername },
          "Posts retrieved successfully"
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});


// PUBLISH  A POST

const publishAPost = asyncHandler(async (req, res) => {
  const { description, caption } = req.body;
  console.log(caption, description);
  const contentFilePath = req.files?.postedContent[0]?.path;
  console.log(contentFilePath);
  if (!contentFilePath) {
    throw new ApiError(400, "Content file is required");
  }

  const contentURL = await uploadOnCloudinary(contentFilePath);
  console.log(contentURL);
  try {
    const post = await Post.create({
      userId: req.user._id,
      postedContent: contentURL.url,
      caption,
      description,
    });

    const createdPost = await Post.findById(post._id).select("-__v");
    if (!createdPost) {
      throw new ApiError(500, "Something went wrong while creating the post");
    }

    console.log(`POST CREATED`);

    return res
      .status(201)
      .json(new ApiResponse(200, createdPost, "Post created successfully"));
  } catch (error) {
    console.error("Error creating post:", error);
    throw new ApiError(500, "Something went wrong while creating the post");
  }
});

// DELETE A POST
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const post = await Post.findById(postId);

  if (!post) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No post found with this ID"));
  }
  const isAdmin = req.user.userType === "ADMIN";
  const isPostCreator = post.userId.toString() === userId.toString();

  if (!isAdmin && !isPostCreator) {
    return res
      .status(403)
      .json(
        new ApiResponse(403, null, "You are not authorized to delete this post")
      );
  }

  deleteImageFromCloudinary(post.postedContent);

  const deletedPost = await Post.findByIdAndDelete(postId);

  console.log("Details of a deleted post");
  console.log(deletedPost);

  if (!deletedPost) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No post found with this ID"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedPost, "Post deleted successfully"));
});

export { getAllPosts, publishAPost, deletePost };
