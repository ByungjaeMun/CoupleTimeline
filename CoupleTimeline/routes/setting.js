var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var User = require('../models/user');
var Timeline = require('../models/timeline');
var session = require('express-session')

var session = "";
var flag = 0;

function isEmpty(obj) {
   for (var x in obj) { return false; }
   return true;
}

function renderSettingPage(req,res, excep, matched){

  console.log('session : ' + session);
  // 받은 요청 DB에서 읽어들여 출력
  User.findOne({userId : req.session.user},function(err,user){
    if(err) return res.status(500).send({error: 'database failure'});

    //console.log(user.receivedReq);
    if(isEmpty(user.receivedReq)){
      res.render('setting',{flag : excep, isCouple : user.isMatched});
    }
    else{
      res.render('setting' ,{reqUsers : user.receivedReq, flag : excep, isCouple : user.isMatched});
    }

  });
}

function coupled(id, isCouple){
  User.findOne({userId : id},function(err,user){
      if(err) return res.status(500).json({ error: 'database failure' });
      if(!user){
        return res.status(404).json({ error: 'user not found' });
      }
      else{
        user.isMatched = isCouple;
        user.save(function(err){
          if(err) res.status(500).json({error: 'failed to update'});
        });
      }
  });
}

/* GET main page. */
router.get('/',function(req,res){
// coupled(3,false); coupled(4,false);

  session = req.session.user;
  renderSettingPage(req,res, flag);
});

router.post('/',function(req,res){
  var id = req.body.requestUser;
  var requserid = req.body.requestUserId;

  if(req.body.accept == "acceptRequest"){

    User.findOne({userId : req.session.user},function(err,check){
      if(check.isMatched){
        renderSettingPage(req,res, 4);
      }
      else{
        User.update({},{$pull: {"receivedReq" : {"_id" : id }}},{multi : true},function(err,data){
          console.log(err, data);
          renderSettingPage(req,res, flag);
        });

        coupled(session,true);
        coupled(requserid,true);

        var timeline = new Timeline();
        timeline.love1 = session ;
        timeline.love2 = requserid;

        timeline.save(function(err){
          if (err) {
              console.log(err);
              return res.status(500).json({
                  error: 'database failure'
              });
          }
          res.redirect('main');
        });
      }
    });
  }
  else if(req.body.refuse == "refuseRequest")
    {
      User.update({},{$pull: {"receivedReq" : {"_id" : id }}},{multi : true},function(err,data){
        console.log(err, data);
        renderSettingPage(req,res, flag);
      });
    }
    else if(req.body.send == "sendRequest")
    {
      User.findOne({userId : req.session.user},function(err,check){
        if(check.isMatched){
          renderSettingPage(req,res, 4);
        }
        else{
          User.findOne({userId:req.body.idToRequest},function(err,user){
            if(err) return res.status(500).send({error: 'database failure'});

            if(user)
            {
              user.receivedReq.push({reqUserId: req.session.user});
              User.update({userId : req.body.idToRequest},user,function(err,status){
                if(err) return res.status(500).send({error: 'database failure'});

                console.log('success');
                renderSettingPage(req,res, flag);
              });
            }
            else{
              renderSettingPage(req,res, 1);
            }
          })
        }
      });

    }
    else if(req.body.remove == "removeTimeline"){
      User.findOne({userId:req.session.user , userPw: req.body.password},function(err,user){
        if(err) return res.status(500).send({error: 'database failure'});
        if(!user){
          console.log('mismatch of password');
          renderSettingPage(req,res,2);
        }
        else{
          Timeline.findOne({$or:[{'love1':session},{'love2':session}]},function(err,timeline){
            console.log(timeline);
            console.log(timeline.love1);
            console.log(timeline.love2);

            coupled(timeline.love1,false);
            coupled(timeline.love2,false);

            Timeline.remove({$or:[{'love1':session},{'love2':session}]},function(err,result){
              if(err) return res.status(500).send({error: 'database failure'});
              renderSettingPage(req,res,flag);
            });
          });
        }
      });
    }
});

module.exports = router;
