var express = require('express');
var router = express.Router();
var passport = require('passport');
var db = require('../config/db.js');

String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};

router.get('/page',ensureAuthenticated, function(req, res){
    
	db.Page.aggregate([{$group : {_id : '$category', pages : {$push : "$$ROOT"}}}]).exec(function(err, docs){
		if(err) res.send(404);
		
		for(var i = 0; i < docs.length; i++){
			for(var j = 0; j < docs[i].pages.length; j++){
				docs[i].pages[j].langFlag = {};
				for(var k = 0; k < docs[i].pages[j].content.length; k++){
					docs[i].pages[j].langFlag[docs[i].pages[j].content[k].lang] = true;
				}
			}
		}
		console.log('-------------------------');
		console.log(docs[0].pages[0].langFlag);
		res.render('page_list', {title: 'MD', pageGroup : docs});
    });
});


function pageEdit(req, res){
	var pId = req.params.pId,
		lang = req.params.lang;
	var langFlag = {};
	if(pId){
		db.Page.findOne({_id : pId.toObjectId()}, function(err, doc){
			if(err) console.log(err);
			for(var i = 0; i < doc.content.length; i++){
				if(doc.content[i].lang == lang){
					langFlag[lang] = 1;
					break;
				}
			}
			console.log(langFlag);
			res.render('page_edit', {page : doc.content[i], langFlag: langFlag});
		});
	}
}


router.get('/page/edit/:pId/:lang/',ensureAuthenticated, pageEdit);
router.get('/page/edit/:pId',ensureAuthenticated, pageEdit);


router.post('/page/edit/:pId',ensureAuthenticated, function(req, res){
    var pId = req.params.pId;
    console.log(pId);
    
    if(pId){
    	res.send(' ' + pId);
    }else{
    	res.send(404);
    }
});


router.get('/page/add',ensureAuthenticated, function(req, res){
	res.render('page_add', {title: 'MD'});
});

router.post('/page/add',ensureAuthenticated, function(req, res){
    var title = req.body.title;
    var category = 'faq';
    var lang = req.body.lang;
    var url = req.body.url;
    var mdContent = req.body.mdContent;
    
    var newPage = new db.Page({
		pID : '1',
		title : title,
		category : category,
		content : [{
			lang : lang,
			title : title,
			url : url,
			mdContent : mdContent
		}],
    });
    newPage.save(function(err, doc){
    	if(err){
    		console.log(err);
    	}else{
    		console.log('new page created');
    		res.redirect('/page');
    	}
    });
    
	
});


module.exports = router;



function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/user/login');
}