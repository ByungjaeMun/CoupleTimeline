  var express = require('express');
  var router = express.Router();
  var bodyParser = require('body-parser');
  var User = require('../models/user');
  var session = require('express-session');

  // GET home page.
  router.get('/', function(req, res) {
      res.render('index',{flag : true});
  });



  router.post('/', function(req, res,next){
        // Login validationCheck
        User.findOne({userId:req.body.id , userPw: req.body.password},function(err,user){
          if(err) return res.status(500).send({error: 'database failure'});
          if(!user){
            res.render('index',{flag : false});
          }
          else{
            req.session.user = req.body.id;
            req.session.admin = true;
            if(user.isMatched){
              res.redirect('main');
            }
            else{
              res.redirect('setting');
            }
          }
        })

  });


module.exports = router;
