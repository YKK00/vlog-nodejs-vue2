const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('./plugins/db');
const assert = require('http-assert');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'public/uploads') });

const app = express();

app.use(cors({
  "origin": true, 
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "allowedHeaders": "x-requested-with,Authorization,token, content-type",
  "preflightContinue": false,
  "maxAge": 1728000,
  "credentials": true,
  "optionsSuccessStatus": 200
}));

app.post('/api/upload', upload.single('file'), (req, res, next) => {
  try {
    res.status(200).send({ file: '/uploads/' + req.file.filename });
  } catch (err) {
    next(err);
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); 
app.use('/public/images', express.static(path.join(__dirname, 'public/images')));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const resourceMiddleware = require('./middleware/resource')

const busRoute = require('./routes/bus');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const articleRouter = require('./routes/article');
const likeRouter = require('./routes/likes');
const commentRouter = require('./routes/comments');
const fileRoute = require('./routes/file');
const userRouter = require('./routes/users');

app.use('/api/rest/:resource', resourceMiddleware(), busRoute)

app.use('/admin/login', loginRoute)
app.use('/admin/register', registerRoute)

app.use('/api/article', articleRouter);

app.use('/api/like', likeRouter);
app.use('/api/comment', commentRouter);

app.use('/api/user', userRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).send({
    code: err.status,
    message: err.message
  });
});

module.exports = app;