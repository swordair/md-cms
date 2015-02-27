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
var flash = require('connect-flash');
var pass = require('./config/pass');
var db = require('./config/db');

var passport = require('passport');

// Seed a user
var user = new db.User({username: 'admin', email: 'admin@example.com', password: 'admin', admin: true});
var user2 = new db.User({username: 'a', email: 'a@a.com', password:'a'});
user.save(function(err){
    if(err){
        console.log(err);
    }else{
        console.log('user: ' + user.username + " saved.");
    }
});
user2.save();


// router obj
var userRouter = require('./routes/user');
var editorRouter = require('./routes/editor');


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
app.use(flash());

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