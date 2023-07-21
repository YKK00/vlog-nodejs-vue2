const express = require('express');
const { getPublicKey } = require('../core/rsaControl')
const router = express.Router();

/*GET getPubKey */
router.get('/', async function (req, res, next) {
  let pubKey = await getPublicKey()
  res.json(200, {
    statusCode: 200,
    errMsg: 'ok',
    data: {
      pubKey
    }
  })
});

module.exports = router;
