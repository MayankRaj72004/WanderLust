const express = require("express");
const router = express.Router();
const Listing = require("../models/listing")
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js")
const {listingSchema,reviewSchema} = require("../schema.js");





const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }else{
        next();
    }
}

//Index Route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// New Route
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//Show Route
router.get("/:id",wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

// const normalizeImageField = (listingData) => {
//     if (!listingData) return listingData;
//     if (listingData.image) {
//         listingData.image = { url: listingData.image };
//     } else {
//         delete listingData.image;
//     }
//     return listingData;
// };

//Create Route
router.post("/",validateListing,
    wrapAsync(async(req,res,next)=>{
        // normalizeImageField(req.body.listing);
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
    })
);


//Edit Route
router.get("/:id/edit",wrapAsync(async (req,res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
router.put("/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    // normalizeImageField(req.body.listing);
    const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated!");
    res.redirect("/listings");
}));

// DELETE Route
router.delete("/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));


module.exports = router;