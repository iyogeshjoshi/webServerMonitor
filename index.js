/**
 * A web-based command line to administer the server using node.js
 * @author Yogesh Joshi <iyogeshjoshi@gmail.com>
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var exec = require('child_process').exec;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Models = require('./models');
var User = Models.User;

// configurations
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser());
app.use(expressSession({
  secret: 'web server monitor',
  saveUninitialized: true,
  resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

// authentication config
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({
      username: username
    }, function(err, user){
      if(err) return done(err);
      if(!user) return done(null, false, {message: 'Incorrect username.'});
      if(!user.validPassword(password)) return done(null, false, {message: 'Incorrect password.'});

      return done(null, user);
    });
  }
));

// whitelisted command
var whitelist = require('./cmd-whitelist');
console.log(whitelist);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/templates/home.html');
});

app.get('/login')

var count = 0;

io.on('connection', function(socket){
  socket.name = 'client-'+count;
  count++;
  console.log(socket.id+' connected!');
  var user = null;
  // create new user
  User.create({username: socket.id}, function(err, _user){
    if(err) console.error(err);
    user = _user;
  });

  socket.on('command', function(cmd){
    if(whitelist.indexOf(cmd) != -1){
      exec(cmd, function(err, out){
        if(err){
          user.commands.push({command: cmd, output: err});
          user.save();
          console.error(err);
          socket.emit('channel', err);
          socket.broadcast.emit('channel', socket.name + ': \n\''+ cmd + '\' : ' + err);
        }
        user.commands.push({command: cmd, output: out});
        user.save();
        socket.emit('channel', out);
        socket.broadcast.emit('channel', socket.name + ': \n\''+ cmd +'\' : ' + out);
      });
    }else{
      socket.emit('channel', socket.name + ': \''+ cmd + '\' command not allowed!!');
    }
  });

  socket.on('disconnect', function(){
    console.log(socket.id+' - left!');
  })
});

http.listen(7777, function(){
  console.log('Server listening on *:7777');
});
