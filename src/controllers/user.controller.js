import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js" 
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser=asyncHandler(async (req,res) =>{
    const {fullname,email,username,password}=req.body;
    console.log(email);
    if(fullname===""){
        throw new ApiError(300,"full name required");
    }else if(email===""){
        throw new ApiError(300,"email required");
    }else if(username===""){
        throw new ApiError(300,"username required");
    }else if(password===""){
        throw new ApiError(300,"password required");
    }

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    const avatarlocalpath = req.files?.avatar?.[0]?.path || null;
    const coverImageLocalPath = req.files?.CoverImage?.[0]?.path || null;

    console.log("Avatar File Path:", avatarlocalpath);
    console.log("Cover Image Path:", coverImageLocalPath);

    if(!avatarlocalpath){
        throw new ApiError(400,"Avatar path required");
    }

    const avatar=await uploadOnCloudinary(avatarlocalpath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }

    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    });

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered succesfully")
    )
})

export {registerUser}