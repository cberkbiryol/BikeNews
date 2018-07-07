var express = require("express");

// Require all models
var db = require("../models");

// Scrapes the website
var cheerio = require("cheerio");

// Makes HTTP request for HTML page
var request = require("request");

// Require Mongoose
var mongoose = require("mongoose");

var router = express.Router();

// v--v--v--v--v-- ROUTES BELOW --v--v--v--v--v //
// Route for scraping
router.get("/fetch", function(req, res) {
    // get the body the page using request
    request.get("https://www.bicycling.com/",function(error, response,html) {
      // load it into cherio
      var $ = cheerio.load(html);
      var promises=[];
      //  and start searching for each news item 
      $("div.simple-item.grid-simple-item").each(function(i, element) {
        // use an empty result object to store news item in
        var result = {};
        // Add the news image metadata and title to database
        result.subject = $(this)
          .children("div.simple-item-metadata")
          .children("a.item-parent-link")
          .text();
        result.date = $(this)
          .children("div.simple-item-metadata")
          .children("div.publish-date")
          .attr("data-publish-date");
        result.title = $(this)
          .children("a.simple-item-title")          
          .text();
        result.image=$(this)
          .find("img")
          .data("src");
        result.link="https://www.bicycling.com"+ $(this)
          .children("a.simple-item-title")          
          .attr("href");
        var promise = db.BikeNews.findOneAndUpdate({title:result.title},
          result,
          {
            upsert: true, 
            new: true, 
            setDefaultsOnInsert: true
          },
          function(err,NewsItem) {
            if (err) {
              console.log(err);
            } else {
              // View the added item in the console
            console.log(NewsItem.title);
            }
          }).sort({date:-1}) 
          promises.push(promise)         
      });
      Promise.all(promises)
      .then(function(){
        // If all sucessfully stored in database send `job complete` message
        console.log("Scrape Complete")
        res.redirect("/");
      }).catch(function(err) {
        return res.json(err)
      });      
    });
  });

// Route for getting all the news from the db
router.get("/", function(req, res) {
  db.BikeNews.find({},function(err,result){
    if (err) {
      console.log(err)
    } else {
        BNobj= {
            bikeNews: result
        }
      res.render("index",BNobj)
    }
  })
});

// Route for getting all the commented news from the db
router.get("/commented", function(req, res) {
  db.BikeNews.find({saved:true},function(err,result){
    if (err) {
      console.log(err)
    } else {
        BNobj= {
            bikeNews: result
        }
      res.render("index",BNobj)
    }
  })
});

// Route for clearing all the news from the db
router.get("/clear", function(req, res) {
  db.BikeNews.remove({}, function(err){
    db.Comments.remove({},function(){
      res.redirect("/");
    })
  });
});

// Route for obtaining the specific news to be commented on
router.get("/news/:id", function(req, res) {
  db.BikeNews.findOne({_id:mongoose.Types.ObjectId(req.params.id)})
  .populate({path:'comments',options:{ sort:{date : -1}}})
  .then(function(result){
    BNobj= {
      comments: result.comments,
      layout:false
    };   
    res.render("modal",BNobj)   
  }).catch(function(err) {
    // If this gives an error send back the error
    res.json(err);
  });
});

// Route for deleting a specific comment
router.delete("/clear/:nid/:cid", function(req, res) {
  db.Comments.findOneAndRemove({_id:mongoose.Types.ObjectId(req.params.cid)})
  .then(function(result){
    db.BikeNews.update({_id:mongoose.Types.ObjectId(req.params.nid)},
    {
      $pull:{comments:req.params.cid}
    },
      function(err,res2){
        if (err) throw err;
        res.json(res2);       
    })
  })
})


// Route for saving/updating an news associated comment
//upsert assures if the title does not already exist the news is added
// and if it exists it is not added to avoid duplicates after multiple scrapes
router.post("/news/:id", function(req, res) {
  db.Comments.create(req.body)
  .then(function(result){ 
    db.BikeNews.findOneAndUpdate(
      {_id:mongoose.Types.ObjectId(req.params.id)},
      {
      $push:{
        comments:result._id      
      },
      $set:{
        saved: true
      }
    },{new:true})
    .then(function(res2){
      res.json(res2)
    }).catch(function(err){
      console.log(err)
    })
  })
  });

  module.exports = router;