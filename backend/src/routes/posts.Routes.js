import { Router } from "express";
import {
  getAllPosts,
  publishAPost,
  deletePost,
} from "../controllers/posts.Controllers.js";
import { verifyJWT } from "../middlewares/auth.Middleware.js";
import { upload } from "../middlewares/multer.Middleware.js";

const router = Router();
router
  .route("/")
  .get(getAllPosts)
  .post(
    verifyJWT,
    upload.fields([
      {
        name: "postedContent",
        maxCount: 1,
      },
    ]),
    publishAPost
  );

router.delete("/delete/:postId", verifyJWT, deletePost);

export default router;
