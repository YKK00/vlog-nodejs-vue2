const mongoose = require('mongoose');
const { Schema } = mongoose;

const likeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  articleId: {
    type: Schema.Types.ObjectId,
    ref: "Article",
    required: true,
  },
});

module.exports = mongoose.model('Like', likeSchema);
