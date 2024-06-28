const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400,errMsg);
    } else{
      next();
    }
  };

    //Reviews
  //Post Route
  router.post("/:id/reviews", validateReview, wrapAsync(async (req,res)=>{
    let listing =await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("New Review Saved");
    // res.send("New Review Saved");
    res.redirect(`/listings/${listing._id}`);
  }))
  
    //Show route
    router.get("/:id",wrapAsync(async (req,res)=>{
        let {id} = req.params;
        const listing = await Listing.findById(id).populate("reviews"); 
        res.render("show.ejs",{listing});
      }));
      
      //Delete Review Route
      router.delete("/:id/reviews/:reviewId", wrapAsync(async (req,res)=>{
        let {id,reviewId} = req.params;
        await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
      }));

      module.exports = router;