const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const expressValidator = require('express-validator');
//Express Validator
const { check, validationResult } = require('express-validator/check');

// Init App
const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// Mongoose connect mongodb
mongoose.connect('mongodb://localhost/nodejs');
let db = mongoose.connection;

// Check db connection
db.once('open', function () {
    console.log('Connected to mongodb');
})

// Check for DB errors
db.on('error', function (err) {
    console.log(err);
});

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Load static view in Public
app.use(express.static(path.join(__dirname, 'public')));

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    res.locals.errors = null;
    next();
});

//Express Validator
app.use(expressValidator());

//Bring in model:
let Article = require('./models/article');

app.get('/', function (req, res) {
    Article.find({}, function (err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.render('articles', {
                title: 'Article',
                articles: articles
            });
        }
    })
})

app.get('/articles/add', function (req, res) {
    res.render('add_article', {
        title: 'Add Article'
    })
});

app.post('/articles/add', [
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

app.get('/articles/:id', function (req, res) {
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

app.post('/articles/edit/:id', function (req, res) {
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

app.delete('/articles/:id', function (req, res) {
    let query = {_id: req.params.id};

    Article.remove(query, function (err) {
        if (err) {
            console.log(err);
        } res.send('success');
    });
    console.log('deleting id: ' + req.params.id);
});

app.listen(3000, function () {
    console.log('Server start on port 3000...');
});