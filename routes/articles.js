const express = require('express');
const router =  express.Router();

// Bring in Article Model
let Article = require('../models/article')

//Express Validator
const { check, validationResult } = require('express-validator/check');

router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('add_article', {
        title: 'Add Article'
    })
});

router.post('/add', ensureAuthenticated, [
        check('title').isLength({min:2}).withMessage('title must be greater than 2 chars'),
        check('author').isLength({min:2}).withMessage('author be greater than 2 chars'),
        check('body').isLength({min:2}).withMessage('body be greater than 2 chars')
    ], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //const err = errors.mapped();
            // for(var key in err){
            //     req.flash('error', err[key].msg);
            //     console.log('ERR:' + err[key].msg)
            // }
            res.render('add_article', {
                title: 'Add Article',
                errors: errors
            });
        } else {
            let article = new Article();
            article.title = req.body.title;
            article.author = req.body.author;
            article.body = req.body.body;
            article.save(function (err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    req.flash('success', 'Article Added');
                    console.log('message: ' + 'Added successful');
                    res.redirect('/');
                }
            });
        }
    }

);

router.get('/:id',ensureAuthenticated, function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        if (err) {
            console.log(err);
        } else {
            res.render('edit_article', {
                title: 'Edit Article',
                article: article
            });
        }
    })
});

router.post('/edit/:id', ensureAuthenticated, function (req, res) {
    console.log('Edit id: ' + req.params.id);
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id: req.params.id};
    Article.update(query, article, function (err) {
        if (err) console.log(err);
        else {
            console.log('update success');
            res.redirect('/');
        }
    })
});

router.delete('/:id',ensureAuthenticated, function (req, res) {
    let query = {_id: req.params.id};

    Article.remove(query, function (err) {
        if (err) {
            console.log(err);
        } res.send('success');
    });
    console.log('deleting id: ' + req.params.id);
});

// Access control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login')
    }
}

module.exports = router;