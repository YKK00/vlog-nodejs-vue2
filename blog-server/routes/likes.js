// routes/like.js

const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Article = require('../models/Article');

router.post('/', async (req, res) => {
  const userId = req.body.uid;
  const articleId = req.body.aid;

  const like = await Like.findOne({ userId, articleId });

  if (like) {
    await like.remove();
    await Article.updateOne({ _id: articleId }, { $inc: { like_num: -1 } });
    res.json({ message: '已取消点赞' });
  } else {
    await Like.create({ userId, articleId });
    await Article.updateOne({ _id: articleId }, { $inc: { like_num: 1 } });
    res.json({ message: '点赞成功' });
  }
});

module.exports = router;
