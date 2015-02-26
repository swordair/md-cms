var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/',ensureAuthenticated, function(req, res){
    
	res.render('index', {title: 'MD'});
});

router.get('/user/login', function(req, res){
	res.render('login', {title: 'MD'});
});

router.post('/user/login', passport.authenticate('local', { 
    failureRedirect: '/user/login'
}), function(req, res){
    res.redirect('/');
});

router.get('/user/logout', function(req, res){
	req.logout();
	res.render('logout', {});
});

module.exports = router;



function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/user/login');
}