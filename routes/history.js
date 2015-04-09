var express = require('express');
var router = express.Router();
var passport = require('passport');
var db = require('../config/db.js');
var moment = require('moment');
var jsdiff = require('diff');
var htmlspecialchars = require('htmlspecialchars');

String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};

var sidebar = {};
sidebar.history = 1;

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

function pageHistory(req, res){
    var pId = req.params.pId;
    
    db.History.find({pageID : pId.toObjectId()}).sort({'date':-1}).exec(function(err, docs){
        var sidebar = {};
		sidebar.history = 1;
        
        docs.forEach(function(item){
       		console.log(moment(item.date).fromNow())
       		item.dateFromNow = moment(item.date).fromNow();
       	});
        
        res.render('history-page', {title: 'page History', histories: docs, sidebar: sidebar});
    });
}

function compareHistory(req, res){
    var preVerID = req.body.preVer;
    var curVerID = req.body.curVer;
    
    db.History.find({_id : curVerID.toObjectId()}).exec(function(err, curVer){
        console.log(curVer)
        db.History.find({_id : preVerID.toObjectId()}).exec(function(err, preVer){
            console.log(preVer)
            
            var html = ''
            
            var diff = jsdiff.diffLines(preVer[0].content, curVer[0].content);
            
            console.log(diff)
            
            for(i = 0; i < diff.length; i++){
                if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
                    var swap = diff[i];
                    diff[i] = diff[i + 1];
                    diff[i + 1] = swap;
                }
                
                if (diff[i].removed) {
                    html += '<del>' + htmlspecialchars(diff[i].value) + '</del>';
                } else if (diff[i].added) {
                    html += '<ins>' + htmlspecialchars(diff[i].value) + '</ins>';
                } else {
                    html += htmlspecialchars(diff[i].value);
                }
            }
            
            res.render('history-compare', {title: 'History compare', diffContent: html, sidebar: sidebar});
            
        });
    });
}

router.get('/history', historyList);
router.get('/history/:pId/:lang', pageHistory);
router.post('/history/compare', compareHistory);

module.exports = router;