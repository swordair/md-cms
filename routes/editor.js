var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/editor',ensureAuthenticated, function(req, res){
    
	res.render('editor', {title: 'MD'});
});

module.exports = router;



function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/user/login');
}