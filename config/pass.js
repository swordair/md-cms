var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('./db');

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
        db.User.findOne({username: username}, function(err, user){
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

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/user/login');
}


exports.ensureAuthenticated = ensureAuthenticated;