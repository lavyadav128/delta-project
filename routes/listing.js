const express = require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controllers/listing.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

//This defines a GET route on the root path (/) of the router.
//When a GET request is made to this path, the callback function is executed
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createlisting));

  
  //New Route
router.get("/new",isLoggedIn,listingController.rendernewform);
  


router.route("/:id")
.get(wrapAsync(listingController.showlisting))
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updatelisting))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroylisting));  


  //Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.rendereditform));
    
module.exports=router;