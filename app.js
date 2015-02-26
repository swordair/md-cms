/* dependencies */
var express = require('express');
var hbs = require('express-hbs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var userRouter = require('./routes/user');

var users = [
    { id: 1, username: 'a', password: 'aa', email: 'bob@example.com' },
    { id: 2, username: 'b', password: 'bb', email: 'joe@example.com' }
];

function findById(id, fn) {
    var idx = id - 1;
    if(users[idx]) {
        fn(null, users[idx]);
    }else{
        fn(new Error('User ' + id + ' does not exist'));
    }
}

function findByUsername(username, fn){
    for(var i = 0, len = users.length; i < len; i++){
        var user = users[i];
        if(user.username === username){
            return fn(null, user);
        }
    }
    return fn(null, null);
}

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    findById(id, function (err, user) {
        done(err, user);
    });
});


passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

/* init */
var app = express();










/* view engine setup */
app.engine('hbs', hbs.express3({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.set('env', 'development');
app.disable('view cache');

var config = {
    session_secret : 'Hello, world!',
    db : 'session_store'
}





/* middleware */
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
    secret: config.session_secret,
    store: new MongoStore({
        db : config.db
    }),
    resave: true,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));



/* routes */
app.use('/', userRouter);



/* catch 404 and forward to error handler */
app.use(function(req, res, next){
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


/* ------------------------------------------- */
/* error handlers */

/* development error handler */
if (app.get('env') === 'development'){
    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

/* production error handler */
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


/* ------------------------------------------- */
/* module.exports */
module.exports = app;