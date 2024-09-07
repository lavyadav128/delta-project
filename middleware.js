const Listing=require("./models/listing");
const Review=require("./models/review");
const {listingSchema,reviewSchema}=require("./schema.js");
const ExpressError = require("./utils/ExpressError.js"); 



module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listings!");
        return res.redirect("/login");
    }
    next();
};


module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner=async(req,res,next)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports.validateListing=(req,res,next)=>{    
    let {error}=listingSchema.validate(req.body);
    if(error){
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(404,error);
    }else{
      next();
    }
  };
  

module.exports.validateReview=(req,res,next)=>{   
    let {error}=reviewSchema.validate(req.body);    //This method validates the review data against the schema defined in reviewSchema. If validation fails, it returns an error object.
    if(error){                                     //If there is an error, the middleware extracts and concatenates error messages into a single string (errMsg), and then throws an ExpressError with a status code of 404 and the concatenated error message.
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(404,errMsg);
    }else{
      next();                            // If no validation errors are found, the next() function is called to proceed to the next middleware or route handler
    }
  };



  
module.exports.isReviewAuthor=async(req,res,next)=>{
  let{id,reviewId}=req.params;
  let review=await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error","You are not the author of this review");
      return res.redirect(`/listings/${id}`);
  }
  next();
};