var mongoose = require('mongoose');

var requestedUserSchema = new mongoose.Schema({
  reqUserId : 'String'
});

var userSchema = new mongoose.Schema({
  userName:'String',
  userId: 'String',
  userPw: 'String',
  userPhone: 'String',
  userEmail: 'String',
  isMatched: 'Boolean',
  receivedReq: [requestedUserSchema]
});

module.exports = mongoose.model('User', userSchema);
