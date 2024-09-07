const Listing=require("../models/listing");

module.exports.index=async (req, res) => {          //It takes an async function (async (req, res) => { ... }) and ensures that any errors thrown within the function are passed to the next middleware (error handling middleware)
    const allListings = await Listing.find({});          //This is an asynchronous function, allowing the use of await inside it to handle asynchronous operations (like database queries) more cleanly than using promises
    res.render("listings/index.ejs", { allListings });   //The second argument is an object containing data to be passed to the template. In this case, allListings is the array of listing documents retrieved from the database
};


module.exports.rendernewform= (req, res) => {         //Shows a form to create a new listing
    res.render("listings/new.ejs");
};



module.exports.showlisting=async (req, res) => {      //Displays details of a specific listing
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
      path:"reviews",
      populate:{
        path:"author",
      },
    })
    .populate("owner");  // is used to fetch a single document from a MongoDB collection (using Mongoose) and populate a referenced field with documents from another collection.
    if(!listing){
      req.flash("error","Listing you requested for does not exist!")
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};



module.exports.createlisting=async (req, res,next) => {     //Creates a new listing and saves it to the database
    let url=req.file.path;
    let filename=req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New listing Created!");
    res.redirect("/listings");
  
};



module.exports.rendereditform=async (req, res) => {     //Shows a form to edit an existing listing
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing you requested for does not exist!")
      res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing ,originalImageUrl});
};



module.exports.updatelisting=async (req, res) => {     //Updates a specific listing.
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });     // is expected to be an object containing the fields and values to be updated.  creates a new object with the properties and values from req.body.listing. This ensures that the update operation receives a clean object without any additional properties that might be present in req.body
    if(typeof req.file!=="undefined"){
      let url=req.file.path;
      let filename=req.file.filename;
      listing.image={url,filename};
      await listing.save();
    }
    res.redirect(`/listings/${id}`);
};




module.exports.destroylisting=async (req, res) => {     //Deletes a specific listing.
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");

    res.redirect("/listings");
};