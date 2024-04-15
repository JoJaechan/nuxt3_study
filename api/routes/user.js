const express = require('express');
const router = express.Router();

const controllers = require('@controllers/user');

router.get('/info', controllers.getUser); // 유저정보

module.exports = router;
