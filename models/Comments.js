var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  date: {
    type: Date,    
    default: Date.now
  },
  comment: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  }
});

// Create the model
var Comments = mongoose.model("Comments", CommentSchema);

// Export the Comments model
module.exports = Comments;