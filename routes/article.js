var express = require('express');
var middleware = require('../middleware');
var markdown = require('markdown').markdown

var router = express.Router();
router.get('/post',middleware.checkLogin, function (req,res) {
    res.render('article/post',{article:[]})
});
router.post('/post', function (req,res) {
    var article = req.body;
    var _id = article._id;
    console.log(12,_id);
    if(_id){ //修改
        Model('Article').update({_id},{
            title:article.title,
            content:article.content
        }).then(function (doc) {
            req.flash('success','文章更新成功');
            res.redirect('/');
        }).catch(function (err) {
            req.flash('error','文章更新失败');
            res.redirect('/article/detail/'+_id);
        })
    }else{
        article.user = req.session.user._id;
        //防止空id
        delete article._id;
        Model('Article').create(article).then(function (doc) {
            req.flash('success','文章发表成功');
            res.redirect('/');
        }).catch(function (err) {
            req.flash('error','文章发表失败');
            res.redirect('back');

        })
    }
});
router.get('/list', function (req,res) {
    var keyword = req.query.keywords;
    var pageNum = req.query.pageNum?parseInt(req.query.pageNum):1;
    var pageSize = req.query.pageSize?parseInt(req.query.pageSize):5;
    var queryObj = {};
    if(keyword){
        var regexp = new RegExp(keyword);
        queryObj['$or'] = [{title:regexp},{content:regexp}];

    }
    Promise.all([Model('Article').count(),Model('Article').find(queryObj).sort({createAt:-1}).skip((pageNum-1)*pageSize).limit(pageSize).populate('user')]).then(function (result) {
        var count = result[0];
        var articles = result[1];
        articles.forEach(function (article) {
            article.content = markdown.toHTML(article.content);
        });
        res.render('article/list',{articles,keyword,pageNum,pageSize,totalPages:Math.ceil(count/pageSize)})
    }).catch(function (err) {
        req.flash('error','文章查询失败');
        res.redirect('back');

    });


});
router.get('/detail/:_id', function (req,res,next) {
    var _id = req.params._id;
    Promise.all([Model('Article').update({_id},{$inc:{pv:1}}),Model('Article').findById({_id}).populate('comments.user')])
    .then(function (article) {
        article = article[1]
        article.content = markdown.toHTML(article.content);
        res.render('article/detail',{article});
    }).catch(function (err) {
        req.flash('error','文章查询失败');
        res.redirect('back');

    })
});
router.get('/delete/:id', function (req,res) {
    var _id = req.params.id
    Model('Article').remove({_id}).then(function (data) {
        req.flash('success','删除成功');
        res.redirect('/');
    }).catch(function (err) {
        req.flash('error','文章删除失败');
        res.redirect('back');

    })
});
router.get('/update/:id', function (req,res,next) {
    var _id = req.params.id;
    console.log(_id);
    Model('Article').findById({_id}).then(function (article) {
        console.log(article);
        res.render('article/post',{article});
    }).catch(function (err) {
        req.flash('error','文章修改失败');
        res.redirect('back');
    })
});

router.post('/comment', function (req,res) {
   var comment = req.body;
    Model('Article').update({_id:comment.articleId},{
        $push:{comments:{user:req.session.user._id,content:comment.content}}
    }).then(function (article) {
        res.redirect('/article/detail/'+comment.articleId);
    }).catch(function (err) {
        req.flash('error','文章评论失败');
        res.redirect('back');
    })
});


module.exports = router;