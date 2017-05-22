var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Timeline = require('../models/timeline');
var base64image = require('base64-image');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// GET home page.
router.get('/', function(req, res,next) {
  console.log('thumbnail');
  console.log('session :' + req.session.user);

  Timeline.find({$or:[{'love1':req.session.user},{'love2':req.session.user}]},function(err,timeline){
    if(err) return res.status(500).send({error: 'database failure'});
    timeline.find(function(result){
      res.render('thumbnail', {posts:result.post});
    });
  });
});

router.post('/', function(req, res,next) {

});



module.exports = router;
