const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Article = require('../models/Article')
const createError = require('http-errors')
const assert = require('http-assert')
const app = require('../app')


// /api/rest/:resource?query 
// /api/rest/users?query  users => User
// /api/rest/articles?query  articles => Article

//创建资源
router.post('/', async (req, res) => {
  try {
    const model = await req.Model.create(req.body)
    res.send(model)
  } catch (err) {
    next(createError(400))
  }
})

//更新资源
// /api/rest/articles/83827123/query?..
router.put('/:id', async (req, res) => {
  const model = await req.Model.findByIdAndUpdate(req.params.id, req.body)
  res.send(model)
})

//删除资源
router.delete('/:id', async (req, res) => {
  await req.Model.findByIdAndDelete(req.params.id)
  res.send({
    errMsg: 'ok'
  })
})

//查询资源列表
router.get('/', async (req, res) => {
  const queryOPtions = req.body
  console.log(queryOPtions)


  const items = await req.Model.find().setOptions(queryOPtions)

  // res.send(200, { message: 'ok', data: { count: items.length, list: items } })
})

//查询资源详情
router.get('/:id', async (req, res) => {
  const item = await req.Model.findById(req.params.id)

  res.send(item)
})


module.exports = router


/*
  响应

  response

  成功:
     GET: 200 OK
     POST: 201 Created
     PUT: 200 OK
     PATCH: 200 OK
     DELETE: 204 No Content

    获取多条
    {
      message: 'ok',
      data:{
        count: 返回条目数量
        list:[ //请求列表
          {},{},{}
        ]
      }
    }
    单条数据
    {
      message: 'ok',
      data: {数据内容}
    }
    操作反馈 更新 添加
    {
       message: '用户注册成功|数据更新成功|文章提交成功',
    }

  错误
    statusCode
    400: 请求参数错误 请求路径错误
    401: jwt验证未通过 账号面错误
    403: 无权访问 权限不够
    404: 访问资源不存在 resource img file
    422: 用户不存在 密码错误 token过期

    {
      message:"响应错误文本"
    }
*/


  /*
    setOptions
      new：bool-如果返回修改后的文档而不是原始文档，则为true。默认为false
      upsert：bool-创建对象（如果不存在）。默认为false。
      runValidators：如果为true，则对此命令运行更新验证程序。更新验证器根据模型的架构验证更新操作。
      setDefaultsOnInsert：如果upsert为true，则在创建新文档时，猫鼬将应用模型模式中指定的默认值。此选项仅在MongoDB> = 2.4上有效，因为它依赖于MongoDB的$setOnInsertoperator。
      sort：如果条件找到多个文档，请设置排序顺序以选择要更新的文档
      select：设置要返回的文档字段
      rawResult：如果为true，则返回MongoDB驱动程序的原始结果
      strict：覆盖此更新的架构的严格模式选项
  
  */
