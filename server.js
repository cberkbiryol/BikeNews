// Routing and control
var express = require("express");

// Database
var mongoose = require("mongoose");

// Body Parser 
var bodyParser = require("body-parser");

var PORT = 3000;

// Initialize Express
var app = express();

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Use handlebars for rendering the webpage
var exphbs = require("express-handlebars");
var hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    dateFormat: require('handlebars-dateformat')
  },
  defaultLayout: "main"
});
app.engine('handlebars', hbs.engine);
app.set("view engine","handlebars");


// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/bikeNews";
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// mount the routes
var routes = require("./controllers/news_controller.js");
app.use(routes);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});