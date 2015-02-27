var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var SALT_WORK_FACTOR = 10;

exports.mongoose = mongoose;

mongoose.connect('localhost', 'md-cms');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('Connected to DB md-cms');
});

var pageSchema = mongoose.Schema({
	pID : {type : String, required : true},
	mdContent : {type : String, required : true},
	url : {type : String},
	title : {type : String, required : true},
	lang : {type : String, reqiured : true}
});

var userSchema = mongoose.Schema({
    username : {type : String, index: true, required : true, unique : true},
    email : {type : String, 'default' : ''},
    password : {type: String},
    admin : {type: Boolean, 'default' : false}
});


userSchema.methods.comparePassword = function(cPassword, cb){
    bcrypt.compare(cPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    });
};


// Bcrypt middleware
userSchema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

var User = mongoose.model('User', userSchema);
var Page = mongoose.model('Page', pageSchema);

exports.User = User;
exports.Page = Page;
