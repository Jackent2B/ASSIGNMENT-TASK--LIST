const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');


require('dotenv').config();
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// APP CONFIG
//mongoose.connect("mongodb://localhost/blogapp",{ useNewUrlParser: true });
const url = 'mongodb://localhost/restful_blog_app'||`mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@task-list-vy0gg.mongodb.net/test?retryWrites=true&w=majority`;
mongoose.connect(url, {useMongoClient: true});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSanitizer());
app.use(methodOverride('_method'));

// MONGOOSE/MODEL CONFIG
const blogSchema = new mongoose.Schema({
  title: String,
  body: String,
  created: {type: Date, default: Date.now()}
});
const Blog = mongoose.model('Blog', blogSchema);

// RESTFUL ROUTES
app.get('/', (req, res) => {
  res.send("Hello");
});

  // INDEX ROUTE
app.get('/blogs', (req, res) => {
  Blog.find({}, (err, blogs) => {
      if (err) {
        console.log('ERROR!');
      } else {
        res.render('blogs', {blogs: blogs});
      }
  });

});

  // NEW ROUTE
app.get('/blogs/new', (req, res) => {
  res.render('new');
});
  // CREATE ROUTE
  app.post('/blogs', (req, res) => {
    // sanitize the text input, prevents from people inject bad code!
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog) => {
      if (err) {
        res.render('new');
      } else {
        res.redirect('/blogs');
      }
    });
  });

  // SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('show', {blog: foundBlog});
    }
  });
});

  // EDIT ROUTE
app.get('/blogs/:id/edit', (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('edit', {blog: foundBlog});
    }
  });
});

  // UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
  // sanitize the text input, prevents from people inject bad code!
  req.body.blog.body = req.sanitize(req.body.blog.body); 
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect(`/blogs/${req.params.id}`);
    }
  });
});

  // DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
  Blog.findByIdAndRemove(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs');
    }
  });
});





















// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
