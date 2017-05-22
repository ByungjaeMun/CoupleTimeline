var mongoose = require('mongoose');


var postSchema = new mongoose.Schema({
  postImagePath: 'String',
  postDate: 'String',
  postLocation: 'String',
  postContent: 'String'
});

var timelineSchema = new mongoose.Schema({
  love1 : 'String',
  love2 : 'String',
  post : [postSchema]
});

module.exports = mongoose.model('Timeline', timelineSchema);
