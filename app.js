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
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var LocalStrategy = require('passport-local').Strategy;

var userRouter = require('./routes/user');
var SALT_WORK_FACTOR = 10;


mongoose.connect('localhost', 'md-cms');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('Connected to DB md-cms');
});

var userSchema = mongoose.Schema({
    username : {type : String, required : true, unique : true},
    email : {type : String, required : true, unique : true},
    password : {type: String, required: true}
});


userSchema.methods.comparePassword = function(cPassword, cb){
    bcrypt.compare(cPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    });
};


// Bcrypt middleware
userSchema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});


// Seed a user
var User = mongoose.model('User', userSchema);
var user = new User({username: 'admin', email: 'admin@example.com', password: 'admin'});
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
    User.findById(id, function(err, user) {
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