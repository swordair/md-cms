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

var db = require('./config/db');
var LocalStrategy = require('passport-local').Strategy;


// router obj
var userRouter = require('./routes/user');
var editorRouter = require('./routes/editor');

// Seed a user

var user = new db.User({username: 'admin', email: 'admin@example.com', password: 'admin'});
user.save(function(err){
    if(err){
        console.log(err);
    }else{
        console.log('user: ' + user.username + " saved.");
    }
});

// passport serialize & deserialize
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    db.User.findById(id, function(err, user) {
        done(err, user);
    });
});

// use the LocalStrategy within Passport
passport.use(new LocalStrategy(function(username, password, done){
    process.nextTick(function () {
        User.findOne({username: username}, function(err, user){
            if(err) return done(err);
            if(!user) return done(null, false, {message: 'Unknown user ' + username});
            user.comparePassword(password, function(err, isMatch){
                if(err) return done(err);
                if(isMatch){
                    return done(null, user);
                }else{
                    return done(null, false, {message: 'Invalid password'});
                };
            });
        });
    });
}));



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
};





/* middleware */
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
app.use('/', editorRouter);


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