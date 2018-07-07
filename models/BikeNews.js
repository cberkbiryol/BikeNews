var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BikeSchema = new Schema({
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  link: {
    type: String,
    required: true
  },
  saved: {
    type: Boolean,
    default: false
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comments"
  }]
});

// Create the model
var BikeNews = mongoose.model("BikeNews", BikeSchema);

// Export the BikeNews model
module.exports = BikeNews;
