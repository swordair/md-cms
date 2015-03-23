var express = require('express');
var router = express.Router();
var pass = require('../config/pass');
var passport = require('passport');

router.get('/', pass.ensureAuthenticated, function(req, res){
    var username = req.user.username;
    var sidebar = {};
    sidebar.overview = 1;
	res.render('index', {title: 'MD', sidebar: sidebar, username: username});
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


router.get('/users/:username', pass.ensureAuthenticated, function(req, res){
	var username = req.user.username;
	if(req.params.username == username || req.user.admin){
		res.render('user', {title: req.params.username, username: req.params.username});
	}else{
		res.send('It\'s not you.');
	}
});

module.exports = router;