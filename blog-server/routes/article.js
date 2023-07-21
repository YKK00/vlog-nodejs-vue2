const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');
const Column = require('../models/Column'); // 引入 Column 模型
const assert = require('http-assert');

// POST route for creating a new article
router.post('/', async (req, res, next) => {
  try {
    const { title, cover, body, author, column } = req.body;

    assert(title, 400, '文章标题不能为空');
    assert(body, 400, '文章内容不能为空');
    assert(author, 400, '作者不能为空');

    const authorExists = await User.findById(author);
    assert(authorExists, 400, '作者不存在');

    let columnId;

    if (column) {
      // 检查传入的分类是否已存在
      const existingColumn = await Column.findOne({ name: column });
      
      if (existingColumn) {
        columnId = existingColumn._id; // 使用已存在的分类 ID
      } else {
        // 创建新的分类
        const newColumn = new Column({ name: column });
        await newColumn.save();
        columnId = newColumn._id;
      }
    }

    const article = new Article({
      title: title,
      cover: cover,
      body: body,
      author: author,
      column: columnId // 存储分类 ID
    });

    await article.save();

    res.send({
      message: '文章成功发布', // 发布成功的消息
      articleId: article._id
    });
  } catch (err) {
    next(err);
  }
});

// 获取随机文章路由
router.get('/random', async (req, res, next) => {
  try {
    const count = await Article.countDocuments();
    const random = Math.floor(Math.random() * count);
    const article = await Article.findOne().skip(random).populate('column').sort({date: -1}); // 加载 column 的详细信息并按创建时间逆序排列
    assert(article, 404, '文章未找到');
    res.send(article);
  } catch (err) {
    next(err);
  }
});

// 获取用户文章数和文章列表
router.get('/:id/articles', async function(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    
    const articles = await Article.find({ author: req.params.id }).populate('column').sort({date: -1}); // 在文章模型中查找指定用户的文章，加载column的详细信息并按创建时间逆序排列
    return res.send({ articlesCount: articles.length, articles: articles });
  } catch (err) {
    next(err);
  }
});

// 获取分页文章路由
router.get('/page', async (req, res, next) => {
  try {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = 2; // 每页返回的文章数量
    let skip = (page - 1) * limit;

    let articles = await Article.find().skip(skip).limit(limit).populate('comments').populate('column').sort({date: -1}); // 加载 column 的详细信息并按创建时间逆序排列
    assert(articles.length, 404, '文章未找到');

    res.send(articles);
  } catch (err) {
    next(err);
  }
});

//获取文章分类
router.get('/columns', async (req, res, next) => {
  try {
    const columns = await Column.find();
    res.send(columns);
  } catch (err) {
    next(err);
  }
});

router.get('/column/:columnName', async (req, res, next) => {
  try {
    const columnName = req.params.columnName;

    const column = await Column.findOne({ name: columnName });

    assert(column, 404, '分类不存在');

    const articles = await Article.find({ column: column._id }).sort({date: -1}); // 获取与分类相关联的文章，并按创建时间逆序排列

    res.send(articles);
  } catch (err) {
    next(err);
  }
});


// 获取指定文章路由
router.get('/:id', async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id).populate('comments').populate('column'); // 加载 column 的详细信息
    assert(article, 404, '文章未找到');
    res.send(article);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the article and get its column id
    const article = await Article.findById(id);
    assert(article, 404, '文章未找到');

    // Delete the article
    const deletedArticle = await Article.findByIdAndDelete(id);
    assert(deletedArticle, 404, '文章未找到');

    if (article.column) {
      const column = await Column.findById(article.column);
      if (column) {
        // 寻找具有相同标签分类的文章，如果没有则删除该标签
        const articlesInSameColumn = await Article.find({ column: column._id });
        if (articlesInSameColumn.length === 0) {
          await Column.findByIdAndDelete(column._id);
        }
      }
    }
    res.send({
      message: '文章已成功删除',
    });
  } catch (err) {
    next(err);
  }
});

// 搜索文章路由
router.get('/search/:keyword', async (req, res, next) => {
  try {
    const keyword = req.params.keyword;
    const query = new RegExp(keyword, 'i');

    const articles = await Article.find({
      $or: [
        { title: { $regex: query } },
        { body: { $regex: query } }
      ]
    }).populate('comments').populate('column').sort({date: -1}); // 加载 column 的详细信息并按创建时间逆序排列

    res.send(articles || []);
  } catch (err) {
    next(err);
  }
});



module.exports = router;
