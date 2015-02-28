var express = require('express');
var router = express.Router();
var passport = require('passport');
var db = require('../config/db.js');

String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};

router.get('/page',ensureAuthenticated, function(req, res){
    
    db.Page.find({}, function(err, docs){
    	if(err) res.send(404);
    	
    	console.log(docs);
    	
    	
    	res.render('page_list', {title: 'MD', pages : docs});
    });
    
	
});

router.get('/page/edit/:pId',ensureAuthenticated, function(req, res){
    var pId = req.params.pId;
    console.log(pId);
    if(pId){
    	db.Page.findOne({content : { $elemMatch : {'_id' : pId.toObjectId()}}}, function(err, doc){
    		if(err){ 
    			console.log(err);
    		}
    		for(var i = 0; i < doc.content.length; i++){
    			if(doc.content[i]._id = pId){
    				break;
    			}
    		}
    		res.render('page_edit', {page : doc.content[i], pId : pId});
    	});
    }else{
    	res.redirect('/page/add');
    }
});


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
    		console.log(doc.content[0]._id);
    		console.log('new page created');
    		res.redirect('/page/edit/' + doc.content[0]._id);
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