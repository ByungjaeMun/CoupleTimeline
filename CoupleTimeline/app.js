var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fileUpload = require('express-fileupload');
var session = require('express-session');
var cookieParser = require('cookie-parser');

// public 폴더로부터 정적인 리소스 로드 가능(html 또는 이미지)
app.use(cookieParser('2C44-4D44-WppQ38S'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
}));
//app.use(express.logger('dev'));


var port = process.env.PORT || 9090;

const server = app.listen(9090,function(){
  console.log('Connected 9090 port!');
});

const io = require('socket.io')(server);

/*
app.get('/count',function(req,res){
  req.session.count = 1;
  if(req.signedCookies.count){
    var count = parseInt(req.signedCookies.count);
  }
  else {
    var count = 0;
  }
  count= count+1;
  res.cookie('count',count, {signed:true});
  res.send('count : ' +count );

});
*/

// view engine setup
app.set('view engine','ejs');
app.set('views','./views');
//app.use(express.logger('dev'))

// Load defined routers
var index = require('./routes/index');
var main = require('./routes/main')(io);
var setting = require('./routes/setting');
var join = require('./routes/join');
var thumbnail = require('./routes/thumbnail');
var preview = require('./routes/preview');

// register routers in express
app.use('/',index);
app.use('/main',main);
app.use('/setting',setting);
app.use('/join',join);
app.use('/thumbnail',thumbnail);
app.use('/preview',preview);


mongoose.connect('mongodb://localhost/myDB');


// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;




/*
app.get('/form',function(req,res){
  res.render('form');
});

app.post('/form_receiver',function(req,res){

  var title = req.body.title;
  var description = req.body.description;
  res.send(title + ',' + description);
});

app.get('/form_receiver',function(req,res){
  var title = req.query.title;
  var description = req.query.description;
  res.send(title + ',' + description);
});

app.get('/topic/:id',function(req,res){
  var topics = [
    'Javascript',
    'Node.js',
    'Express'
  ];
  var output = `
  <a href ="/topic/0">Javascript</a><br>
  <a href ="/topic/1">Node</a><br>
  <a href ="/topic/2">Express</a><br><br>
  ${topics[req.params.id]}
  `
  //${topics[req.query.id]}
  res.send(output);
});


// semantic url
app.get('/topic/:id/:mode',function(req,res){
  res.send(req.params.id+','+req.params.mode);
});

app.get('/template',function(req,res){
  res.render('temp',{time:Date(), _title:'Jade'});

});

// 첫번째 매개변수는 req
// 두번째 매개변수는 res로 약속되어있음.
// 각각 요청, 응답에 대한 객체
app.get('/',function(req,res){
  res.send('Hello home page');
});

app.get('/dynamic',function(req,res){
  var lis = '';
  for(var i=0; i<5; i++){
    lis = lis + '<li>coding</li>';
  }
  var time = Date();
  var output = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title></title>
    </head>
    <body>
      Hello, Dynamic!
      <ul>
      ${lis}
      </ul>
      ${time}
    </body>
  </html>
  `
  res.send(output);
});

app.get('/route',function(req,res){
  res.send('Hello Router,<img src="/pumpkin.jpg">');

});

app.get('/login',function(req,res){
  res.send('Login please');
});

app.listen(3000,function(){
  console.log('Connected 3000 port!');
});

*/
