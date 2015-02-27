var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/',ensureAuthenticated, function(req, res){
    
	res.render('index', {title: 'MD'});
});

router.get('/user/login', function(req, res){
	res.render('login', {title: 'MD', msg : req.flash('authInfo')});
});

router.post('/user/login', function(req, res, next){
	passport.authenticate('local', function(err, user, info){
		if(err) return next(err);
		if(!user){
			req.flash('authInfo', info.message);
			
			return res.redirect('/user/login');
		}
		
		req.logIn(user, function(err) {
			if (err) return next(err);
			return res.redirect('/users/' + user.username);
		});
	})(req, res, next);
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