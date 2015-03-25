var express = require('express');
var router = express.Router();
var pass = require('../config/pass');
var passport = require('passport');
var db = require('../config/db');

function index(req, res){
	var username = req.user.username;
    var sidebar = {};
    sidebar.overview = 1;
	res.render('index', {title: 'MD', sidebar: sidebar, username: username});
}

function login(req, res, next){
	if(req.isAuthenticated()){
		res.redirect('/');
	}else if(req.method == "GET"){
		res.render('login', {title: 'MD', msg : req.flash('authInfo')});
	}else if(req.method == "POST"){
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
	}
}

function logout(req, res){
	req.logout();
	res.render('logout', {});
}

function profile(req, res){
	var username = req.user.username;
	if(req.params.username == username){
		res.render('user', {title: req.params.username, username: req.params.username});
	}else{
		res.send('It\'s not you.');
	}
}

function password(req, res){
	var username = req.user.username;
	if(req.method == "GET"){
		if(req.params.username == username){
			res.render('password', {title: "Change Password", username: req.params.username});
		}else{
			res.send('It\'s not you.');
		}
	}else if(req.method == "POST"){
		var passOld = req.body.passwordOld;
		var passNew = req.body.passwordNew;
		var passAgain = req.body.passwordAgain;
		
		db.User.findOne({username: username}, function(err, user){
			user.comparePassword(passOld, function(err, isMatch){
                if(err) return done(err);
                if(isMatch){
                	// update password
                    if(passNew == passAgain){
                    	user.password = passNew;
                    	user.save(function(err){
                    		if(err){
                    			console.log(err);
                    		}else{
                    			res.redirect('/users/' + username);
                    		}
                    	});
                    }else{
                    	// todo
                    	console.log('password type twice mismatch');
                    }
                }else{
                	// todo
                    console.log('mismatch');
                };
            });
			
		});
		
	}
}

router.get('/', pass.ensureAuthenticated, index);
router.get('/user/login', login);
router.post('/user/login', login);
router.get('/user/logout', logout);
router.get('/users/:username', pass.ensureAuthenticated, profile);
router.get('/users/password/:username', pass.ensureAuthenticated, password);
router.post('/users/password/:username', pass.ensureAuthenticated, password);

module.exports = router;