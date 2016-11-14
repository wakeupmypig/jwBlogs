var express = require('express');
var util = require('../util');
var middleware = require('../middleware');
var router = express.Router();

router.get('/reg',middleware.checkNotLogin, function(req, res, next) {
  res.render('user/reg');
});
//注册表单
router.post('/reg',middleware.checkNotLogin, function(req, res, next) {
  var user = req.body;
  if(user.password!=user.repassword){
    req.flash('error','密码和重复密码不一致')
    return res.redirect('back');
  }
  user.password = util.md5(user.password);
  user.avatar = "https://secure.gravatar.com/avatar/"
      +util.md5(user.email)+"?s=24";
  
  Model('User').create(user).then(function (data) {
    req.session.user = data;
    req.flash('success','注册成功');
    res.redirect('/');
  }).catch(function (err) {
    req.flash('error','服务器错误');
    res.status(500).send('服务器错误');
  });
});

router.get('/login',middleware.checkNotLogin, function(req, res, next) {
  res.render('user/login');
});
router.post('/login',middleware.checkNotLogin, function(req, res, next) {
  var user = req.body;
  user.password = util.md5(user.password);
  Model('User').findOne(user).then(function (user) {
    if(user){
      req.session.user = user;
      req.flash('success','登录成功');
      res.redirect('/');
    }else{
      req.flash('error','用户或密码错误');
      res.redirect('back')
    }
  }).catch(function (err) {
    req.flash('error','服务器错误');
    res.status(500).send('服务器错误');
  });
});
router.get('/logout',middleware.checkLogin, function(req, res, next) {
  req.session.user = null;
  res.redirect('/user/login')
});
module.exports = router;
