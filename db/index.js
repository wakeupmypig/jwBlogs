var mongoose = require('mongoose');
mongoose.connect('mongodb://106.14.31.43:27017/jwblog');
var ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = Promise;

var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    avatar:String,
    email:String
});
mongoose.model('User',UserSchema);
var ArticleSchema = new mongoose.Schema({
    title:String,
    content:String,
    createAt:{type:Date,default:Date.now()},
    user:{type:ObjectId,ref:'User'},
    comments:[{user:{type:ObjectId,ref:'User'},content:String,
    createAt:{type:Date,default:Date.now()}}],
    pv:{type:Number,default:0}
});
mongoose.model('Article',ArticleSchema);
global.Model = function (modName) {
    return mongoose.model(modName);
};