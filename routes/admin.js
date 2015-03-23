var express = require('express');
var router = express.Router();
var pass = require('../config/pass');
var passport = require('passport');
var db = require('../config/db');
var DEFAULT_PASSWORD = 'ctrip';


function removeUser(req, res){
    var username = req.params.username;
	db.User.findOneAndRemove({username: username}, function(err, user){
		if(err){
			console.log(err);
		}else{
			console.log('user ' + username + 'removed');
			res.redirect('/admin');
		}
	});
}

function addUser(req, res){
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
}

function manageUser(req, res){
    var username = req.user.username;
    
    db.User.find({}, function(err, docs){
        var sidebar = {};
        sidebar.users = 1;
        
		res.render('admin', {title: 'admin page', users: docs, sidebar: sidebar, username: username});
	});
}

router.get('/admin', pass.ensureAuthenticated, pass.ensureAdmin, manageUser);
router.get('/users', pass.ensureAuthenticated, pass.ensureAdmin, manageUser);
router.post('/admin/user/add', pass.ensureAuthenticated, pass.ensureAdmin, addUser);
router.get('/admin/user/remove/:username', pass.ensureAuthenticated, pass.ensureAdmin, removeUser);

module.exports = router;