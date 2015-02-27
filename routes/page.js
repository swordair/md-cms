var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/page/edit',ensureAuthenticated, function(req, res){
    
	res.render('page_edit', {title: 'MD'});
});

router.get('/page/add',ensureAuthenticated, function(req, res){
    
	res.render('page_add', {title: 'MD'});
});


module.exports = router;



function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/user/login');
}