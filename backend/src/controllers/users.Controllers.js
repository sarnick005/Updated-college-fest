import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.Models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// GENERATE ACCESS AND REFRESH TOKEN

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, rollNumber, password, department, userType } =
    req.body;

  // if (
  //   [email, username, password, department, userType].some(
  //     (field) => typeof field !== "string" || field.trim() === ""
  //   ) ||
  //   typeof rollNumber !== "number" ||
  //   rollNumber.toString().trim() === ""
  // ) {
  //   throw new ApiError(400, "All fields are required");
  // }

  const existedUser = await User.findOne({
    $or: [{ rollNumber }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or roll number already exists");
  }

  const user = await User.create({
    email,
    password,
    username,
    rollNumber,
    department,
    userType,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log(`USER ${createdUser.username} REGISTERED`);

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: createdUser, accessToken, refreshToken },
        "User registered successfully"
      )
    );
});

// LOGIN USER

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  console.log("Login Details");
  console.log(req.body);

  if (!email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({ $or: [{ email }] });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log(`USER ${loggedInUser.username} LOGGED IN`);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged In Successfully"
      )
    );
});

// LOGOUT USER

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  console.log("USER LOGGED OUT");
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// REFRESH ACCESS TOKEN

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
    }
    const userId = req.user._id.toString();
    // console.log(userId);
    const user = await User.findOne({ _id: userId }).select(
      "-password -createdAt -updatedAt -__v"
    );
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "user not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, user, "user fetched successfully "));
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
};
