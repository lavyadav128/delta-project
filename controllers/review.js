const Listing=require("../models/listing");
const Review=require("../models/review");


module.exports.createreview=async(req,res)=>{      //Ensures the review data in req.body is valid before proceeding
    let listing=await Listing.findById(req.params.id);          // retrieves the listing by its ID from the URL parameters
    let newReview=new Review(req.body.review);                 // creates a new review instance with the data from req.body.review
    newReview.author=req.user._id;
    listing.reviews.push(newReview);                         //adds the new review to the reviews array of the listing
  
    await newReview.save();                             // saves the new review to the database
    await listing.save();                            //updates the listing with the new review
    req.flash("success","New review Created!");
    res.redirect(`/listings/${listing._id}`);
};


module.exports.destroyreview=async(req,res)=>{
    let{id,reviewId}=req.params;                       // extracts the listing ID and review ID from the URL parameters
  
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});  //removes the reviewId from the reviews array of the listing. The $pull operator ensures only the specified review is removed
    await Review.findByIdAndDelete(reviewId);                 // deletes the review document from the database
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};