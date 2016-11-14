var mongoose = require('mongoose');
mongoose.connect('mongodb://106.14.31.43:27017/jwblog');
mongoose.Promise = Promise;

var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    avatar:String,
    email:String
});
mongoose.model('User',UserSchema);
global.Model = function (modName) {
    return mongoose.model(modName);
};