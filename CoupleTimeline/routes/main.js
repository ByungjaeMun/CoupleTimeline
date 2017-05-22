module.exports = function(io){

  var express = require('express');
  var bodyParser = require('body-parser');
  var router = express.Router();
  var Timeline = require('../models/timeline');
  var base64image = require('base64-image');
  var fileUpload = require('express-fileupload');
  var mongoose = require('mongoose');
  mongoose.Promise = require('bluebird');

  var session ="";
  var flag = true;


  io.on('connection', function (socket) {
    console.log('a user connected');

  socket.on('newContentToServer',function(data){
    console.log(data.content);
      io.emit('newContentToClient',{newContent : data.content, id: data.id});
  });

  socket.on('sendReq',function(data){
    io.emit('resSend',{});
  });

/*
  socket.on('reqRefresh',function(data){
    renderPosts(0,socket.request,socket.response);
  });
*/
    socket.on('disconnect', () => {
    console.log('user disconnected');
    });
  });


  var auth = function(req, res, next) {
    console.log('auth');
    if (req.session.admin)
      return next();
    else
      return res.sendStatus(401);
  };

  function sortByAttribute(array, ...attrs) {
    // generate an array of predicate-objects contains
    // property getter, and descending indicator
    let predicates = attrs.map(pred => {
      let descending = pred.charAt(0) === '-' ? -1 : 1;
      pred = pred.replace(/^-/, '');
      return {
        getter: o => o[pred],
        descend: descending
      };
    });
    // schwartzian transform idiom implementation. aka: "decorate-sort-undecorate"
    return array.map(item => {
      return {
        src: item,
        compareValues: predicates.map(predicate => predicate.getter(item))
      };
    })
    .sort((o1, o2) => {
      let i = -1, result = 0;
      while (++i < predicates.length) {
        if (o1.compareValues[i] < o2.compareValues[i]) result = -1;
        if (o1.compareValues[i] > o2.compareValues[i]) result = 1;
        if (result *= predicates[i].descend) break;
      }
      return result;
    })
    .map(item => item.src);
  }

  function renderPosts(idx, req, res, excep) {
    var posts = [];
    var tmp =[];
    var tmp2 = [];
    console.log('renderPosts');
    var pagesize = 5;
    idx *= 1;

    Timeline.find({$or:[{'love1':session},{'love2':session}]},function(err,timeline){
      if(err) return res.status(500).send({error: 'database failure'});
      timeline.find(function(result){

        tmp = sortByAttribute(result.post,'-postDate');
        for(var i=idx*pagesize; (i<(idx*pagesize)+pagesize)&&(i< tmp.length) ; i++){
          posts.push(tmp[i]);
        }
        res.render('main', {posts , count : result.post.length, flag : excep});
      });
    });
  }

  function getImgDBPath(imgName) {
      return '/img/' + imgName;
  }

  function isEmpty(obj) {
     for (var x in obj) { return false; }
     return true;
  }
  /* GET main page. */
  router.get('/:option', function(req, res) {

      console.log('get option');
      if(req.params.option == "logout"){
        console.log('로그아웃');
        delete req.session.user;
        res.redirect('/');
      }
      else{
          // on 상태의 session으로부터 id , pw 받아서 content 뿌려준다.
          renderPosts(req.params.option, req, res, flag);
      }
  });


  /* GET main page. */
  router.get('/',auth, function(req, res) {

      //savedRes = res;
      session = req.session.user;
      console.log("get");
      console.log(session);
      // on 상태의 session으로부터 id , pw 받아서 content 뿌려준다.
      renderPosts(0, req, res, flag);
  });

  router.post('/:mode/:id',function(req, res) {
    console.log("post with option");
      // on 상태의 session으로부터 id , pw 받아서 content 뿌려준다.
      var id = req.params.id;
      var mode = req.params.mode;
      var fileToUpload, imgSavePath, imgDBPath;

      console.log('post option');
      console.log('session :' + session);

      if (mode == "remove") {
        console.log('remove');
        Timeline.findOne({$or:[{'love1':req.session.user},{'love2':req.session.user}]},function(err,timeline){
          if(timeline){
            Timeline.update({},{$pull:{"post":{"_id": id}}},{multi : true},function(err,data){
              console.log(err, data);
              renderPosts(0, req, res, flag);
            });
          }
        });
      }
      else if (mode == "edit") {
        Timeline.findOne({$or:[{'love1':req.session.user},{'love2':req.session.user}]},function(err,timeline){
          var tl_id = timeline._id;
          if(timeline){
            // file was uploaded
            if (!isEmpty(req.files)){
              imgSavePath = './public/img/' + req.files.postedImage.name;
              // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
              fileToUpload = req.files.postedImage;
              imgDBPath = getImgDBPath(req.files.postedImage.name);
              Timeline.update({_id: tl_id, 'post._id' : id},
              {$set:{'post.$.postImagePath' : imgDBPath }},
              function(err,result){
              });
              fileToUpload.mv(imgSavePath, function(err) {
                  if (err) {res.status(500).send(err);}
                    });
            }
              Timeline.update({_id: tl_id, 'post._id' : id},
              {$set:{'post.$.postContent' : req.body.postContent,
              'post.$.postDate' : req.body.postDate ,
              'post.$.postLocation' : req.body.postLocation}},function(err,result){
                renderPosts(0,req,res, flag);
              });
          }
        });
      }
      else {
        console.log('Wrong input');
      }

  });

  router.post('/',function(req, res) {

  console.log("post ");
  console.log('session :' + session);
      var fileToUpload, imgSavePath, imgDBPath;

      if (isEmpty(req.files)) {
          console.log('No file');
          renderPosts(0,req,res,false);
          return;
      }
      imgSavePath = './public/img/' + req.files.postImage.name;
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      fileToUpload = req.files.postImage;
      imgDBPath = getImgDBPath(req.files.postImage.name);

      // Use the mv() method to place the file somewhere on your server
      fileToUpload.mv(imgSavePath, function(err) {
          if (err) {
              res.status(500).send(err);
          }
          else
          {
            console.log('session : ' + session);
            Timeline.findOne({$or:[{'love1':req.session.user},{'love2':req.session.user}]},function(err,timeline){
              if(err) return res.status(500).send({error: 'database failure'});

              if(timeline)
              {
                timeline.post.push({postImagePath : imgDBPath ,postDate : req.body.postDate, postLocation :req.body.postLocation ,postContent : req.body.postContent});
                Timeline.update({$or:[{'love1':req.session.user},{'love2':req.session.user}]},timeline,function(err,status) {
                    if (err) {console.log(err);return res.status(500).json({error: 'database failure'});
                    }
                    //res.end();
                    renderPosts(0, req, res,flag);
                });
              }
              else
              {
                res.send('main page post error');
              }
            });
          }
      });

  });

  return router;
}
