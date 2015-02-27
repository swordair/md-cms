var express = require('express');
var router = express.Router();
var pass = require('../config/pass');
var passport = require('passport');
var db = require('../config/db');
var DEFAULT_PASSWORD = 'ctrip';

router.get('/admin', pass.ensureAuthenticated, pass.ensureAdmin, function(req, res){
	db.User.find({}, function(err, docs){
		res.render('admin', {title: 'admin page', users: docs});
	});
});

router.post('/admin/user/add', pass.ensureAuthenticated, pass.ensureAdmin, function(req, res){
	var username = req.body.username;
	var newUser = new db.User({
		username: username,
		password: DEFAULT_PASSWORD
	});
	newUser.save(function(err){
		if(err){
			console.log(err);
		}else{
			console.log('user ' + username + 'saved');
			res.redirect('/admin');
			
		}
	});
});

router.get('/admin/user/remove/:username', pass.ensureAuthenticated, pass.ensureAdmin, function(req, res){
	var username = req.params.username;
	db.User.findOneAndRemove({username: username}, function(err, user){
		if(err){
			console.log(err);
		}else{
			console.log('user ' + username + 'removed');
			res.redirect('/admin');
		}
	});
});

module.exports = router;