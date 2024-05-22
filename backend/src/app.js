import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());

import userRouter from "./routes/users.Routes.js";
import postRouter from "./routes/posts.Routes.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

export { app };
