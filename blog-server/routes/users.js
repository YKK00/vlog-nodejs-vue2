const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 通过id查找用户
router.get('/:id', async function(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    return res.send({ data: user });
  } catch (err) {
    next(err);
  }
});

// 设置 multer 的存储引擎
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads')); // 指定上传的目录
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname)); // 指定文件名
  }
});

const upload = multer({ storage: storage });

function handleError(err, res) {
  console.error(err);
  res.status(500).send({ message: 'Internal Server Error', error: err.message });
}

// 头像上传
router.post('/:id/avatar', upload.single('avatar'), async function(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // 验证文件是否已经上传
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    user.avatar = `${protocol}://${host}/uploads/` + req.file.filename;
    try {
      await user.save();
    } catch (err) {
      // 如果保存失败，删除已经上传的文件
      fs.unlink(path.join(__dirname, '../public/uploads', req.file.filename), (err) => {
        if (err) {
          console.error('Error deleting file: ', err);
        }
      });
      return handleError(err, res);
    }
    res.send({ data: { ...user._doc, avatar: user.avatar }, message: 'Avatar updated' });
  } catch (err) {
    return handleError(err, res);
  }
});


// 用户信息更新
router.patch('/:id/profile', async function(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    // 可能需要验证数据有效性
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.nickname = req.body.nickname || user.nickname;
    await user.save();
    res.send({ data: user, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
});

module.exports = router