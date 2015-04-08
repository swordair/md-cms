var express = require('express');
var router = express.Router();
var passport = require('passport');
var db = require('../config/db.js');
var moment = require('moment');

function historyList(req, res){
	
	
	db.History.find({}).sort({'date':-1}).exec(function(err, docs){
        var sidebar = {};
		sidebar.history = 1;
       	
       	docs.forEach(function(item){
       		console.log(moment(item.date).fromNow())
       		item.dateFromNow = moment(item.date).fromNow();
       	});
       	
		res.render('history-list', {title: 'History', histories: docs, sidebar: sidebar});
	});
	
	
	
}

router.get('/history', historyList);

module.exports = router;