var express = require('express');
var router = express.Router();
var passport = require('passport');
var db = require('../config/db.js');

String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};

function pageList(req, res){
	db.Page.aggregate([{$group : {_id : '$category', pages : {$push : "$$ROOT"}}}]).exec(function(err, docs){
		if(err) res.send(404);
		
		for(var i = 0; i < docs.length; i++){
			for(var j = 0; j < docs[i].pages.length; j++){
				docs[i].pages[j].langFlag = {};
				for(var k = 0; k < docs[i].pages[j].contents.length; k++){
					docs[i].pages[j].langFlag[docs[i].pages[j].contents[k].lang] = true;
				}
			}
		}
		console.log('-------------------------');

		res.render('page_list', {title: 'MD', pageGroup : docs});
    });
}


function pageEdit(req, res){
	var pId = req.params.pId;
	var lang = req.params.lang;
	
	var title = req.body.title;
    var category = 'faq';
    var language = req.body.lang;
    var url = req.body.url;
    var mdContent = req.body.mdContent;
	var content = {lang : language, title : title, url : url, mdContent : mdContent};
	
	var langFlag = {};
	langFlag[lang] = 1;
	
	if(pId && lang){
		db.Page.findOne({_id : pId.toObjectId()}, function(err, doc){
			if(err) console.log(err);
			var len = doc.contents.length;
			for(var i = 0; i < len; i++){
				if(doc.contents[i].lang == lang){
					break;
				}
			}
			if(req.method == 'GET'){
				res.render('page_edit', {page : doc.contents[i], langFlag: langFlag});
			}
			if(req.method == 'POST'){
				
				if(i == len){
					db.Page.findOneAndUpdate({_id : pId.toObjectId()}, {$push: {contents: content}}, {safe: true, upsert: true}, function(err, doc){
						if(err){console.log(err);}
						res.redirect('/page');
					});
				}else{
					db.Page.findOneAndUpdate({_id : pId.toObjectId(), "contents.lang" : lang}, {$set: {
							"contents.$.title" : content.title, 
							"contents.$.url" : content.url,
							"contents.$.mdContent" : content.mdContent
					}}, function(err, doc){
						if(err){console.log(err);}
						
						res.redirect('/page');
					});
				}
			}
		});
	}
}


function pageAdd(req, res){
	var pId = req.params.pId;
	var lang = req.params.lang;
	
	if(req.method == "GET"){
		res.render('page_add', {title: 'MD'});
	}else if(req.method == "POST"){
		
		var title = req.body.title;
	    var category = 'faq';
	    var lang = req.body.lang;
	    var url = req.body.url;
	    var mdContent = req.body.mdContent;
		var content = {lang : lang, title : title, url : url, mdContent : mdContent};
		
		var newPage = new db.Page({
			title : title,
			category : category,
			contents : [content],
	    });
	    newPage.save(function(err, doc){
	    	if(err){
	    		console.log(err);
	    	}else{
	    		console.log('new page created');
	    		res.redirect('/page');
	    	}
	    });

	}
}


function pageRemove(req, res){
	var pId = req.params.pId;
	
	db.Page.remove({_id : pId.toObjectId()}, function(err, docs){
		if(err) console.log(err);
		res.redirect('/page');
	});
}


router.get('/page',ensureAuthenticated, pageList);
router.get('/page/add',ensureAuthenticated, pageAdd);
router.post('/page/add',ensureAuthenticated, pageAdd);
router.get('/page/edit/:pId/:lang', ensureAuthenticated, pageEdit);
router.post('/page/edit/:pId/:lang', ensureAuthenticated, pageEdit);
router.get('/page/edit/:pId', ensureAuthenticated, pageEdit);
router.get('/page/remove/:pId', ensureAuthenticated, pageRemove);

module.exports = router;


function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/user/login');
}