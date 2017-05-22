var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Timeline = require('../models/timeline');
var base64image = require('base64-image');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');


// GET home page.
router.get('/', function(req, res) {

    var posts = [];
    var str = "";
    str = req.query.idCarrier;
    var strId = str.split('_');
    //console.log(strId.length);
    var listObjId = [];
    for (var i = 0; i < strId.length - 1; i++) {
        listObjId.push(strId[i]);
        //  console.log(strId[i]);
    }

    if (strId.length == 0) {
        console.log('no check list');
        res.send('no check list');
    } else {
        console.log('Timeline query');
        console.log(req.session.user);
        Timeline.find({  $or: [{'love1': req.session.user}, {'love2': req.session.user}]}, function(err, timeline) {
            if (err) return res.status(500).send({error: 'database failure'});

            timeline.find(function(list) {
                for (var i = 0; i < list.post.length; i++) {
                    for (var j = 0; j < listObjId.length; j++) {
                        if (listObjId[j] == list.post[i]._id) {
                            posts.push(list.post[i]);
                        }
                    }
                }

                res.render('preview', {posts});
            });
        });
    }
});

router.post('/', function(req, res) {
    res.send('post response');
});



module.exports = router;
