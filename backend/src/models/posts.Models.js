import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    postedContent: {
      type: String,
      required: true, // cloudinary url
    },
    description: {
      type: String,
    },
    caption: {
      type: String,
    },
  },
  { timestamps: true }
);
export const Post = mongoose.model("Post", postSchema);
