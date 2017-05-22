var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var User = require('../models/user');
var session = require('express-session')

/* GET main page. */
router.get('/',function(req,res){
  // Join form 출력
  res.render('join',{flag :true});
});

router.post('/',function(req,res){
  // DB data와 중복 체크 (id, phonenum, email)

  User.findOne({userId:req.body.userId},function(err,user){
    if(err) return res.status(500).send({error: 'database failure'});
    if(!user){
      //  DB에 저장
      var user = new User();
      user.userName = req.body.userName;
      user.userId = req.body.userId;
      user.userPw = req.body.userPw;
      user.userPhone = req.body.userPhone;
      user.userEmail = req.body.userEmail;
      user.isMatched = false;

      user.save(function(err){
        if(err){
    			console.log(err);
    			return res.status(500).json({ error: 'database failure'});;
    		}

        req.session.user = req.body.id;
        req.session.admin = true;
        // session on 하고 main페이지
        console.log('회원가입 완료');
        res.redirect('/');
      });
    }
    else{
      res.render('join',{flag:false});
    }
  });
});

module.exports = router;
