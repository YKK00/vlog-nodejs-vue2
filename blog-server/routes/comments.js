const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Article = require('../models/Article');

// 创建评论
// 创建评论
router.post('/', async (req, res) => {
  const { uid: userId, aid: articleId, content } = req.body;
  const comment = new Comment({ uid: userId, aid: articleId, content });
  try {
    await comment.save();
    // 更新 Article，将新的 Comment 的 _id 添加到 comments 数组
    await Article.updateOne({ _id: articleId }, { $push: { comments: comment._id }, $inc: { comment_num: 1 } });
    return res.status(200).json({ message: '评论添加成功' });
  } catch (error) {
    return res.status(500).json({ message: '评论添加失败' });
  }
});

// 删除评论
router.delete('/:id', async (req, res) => {
  const commentId = req.params.id;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }
    const articleId = comment.aid;
    await comment.remove();
    // 减少文章中的评论条数
    await Article.updateOne({ _id: articleId }, { $inc: { comment_num: -1 } });
    return res.status(200).json({ message: '评论删除成功' });
  } catch (error) {
    return res.status(500).json({ message: '删除评论时出现错误' });
  }
});

// 获取指定文章的所有评论
router.get('/article/:id', async (req, res) => {
  const articleId = req.params.id;
  try {
    const comments = await Comment.find({ aid: articleId }).populate('uid', 'username');
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: '获取评论时出现错误' });
  }
});


module.exports = router;
