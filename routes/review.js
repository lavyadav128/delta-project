const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");   //A utility to wrap asynchronous functions to catch errors.
const ExpressError = require("../utils/ExpressError.js");    //A custom error class.
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");

const reviewController=require("../controllers/review.js");

  //This route handles POST requests to create a new review for a listing. It includes the validateReview middleware to ensure the review data is valid.
  router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createreview));
  


  //This route handles DELETE requests to remove a review from a listing and delete the review document itself.
  router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyreview));
  module.exports=router;