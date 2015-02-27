var express = require('express');
var router = express.Router();
var pass = require('../config/pass');
var passport = require('passport');
var db = require('../config/db');

router.get('/admin', pass.ensureAuthenticated, pass.ensureAdmin, function(req, res){
	db.User.find({}, function(err, docs){
		res.render('admin', {title: 'admin page', users: docs});
	});
});

router.post('/admin/user/add', function(req, res){
	var newUser = new db.User({
		
		
	});
});

module.exports = router;