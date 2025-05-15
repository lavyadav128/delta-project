const mongoose = require("mongoose");              //mongoose: ODM (Object Document Mapper) for MongoDB.
const Schema = mongoose.Schema;                    //Schema: Used to define the structure of a MongoDB document.
const Review=require("./review.js")                //Review: Model for user reviews (used later for relationship and cleanup).


const listingSchema = new Schema({                   //This defines the structure for each Listing document stored in MongoDB.
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {                                          //Stores the Cloudinary or file storage info for the image.
    url:String,                                     //url: direct image link.
    filename:String,                                //filename: used for deletion or versioning.
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review",
    }
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },
});

listingSchema.post("findOneAndUpdate",async(listing)=>{              //This is a Mongoose post hook that runs after a findOneAndUpdate() operation (e.g., findByIdAndUpdate()):
  if(listing){                                                       //If a listing is found and updated,
    await Review.deleteMany({_id:{$in:listing.reviews}});            //Then all associated reviews are deleted from the database.
  }
});



const Listing = mongoose.model("Listing", listingSchema);            //Registers the schema as a Mongoose model named "Listing".
module.exports = Listing;                                           //This model is now usable in other parts of the app to create, query, update, and delete listings.
