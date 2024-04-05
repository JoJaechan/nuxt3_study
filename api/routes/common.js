const express = require('express');
const router = express.Router();

const controllers = require('@controllers/common');

router.get('/paypal/payouts', controllers.payouts);

module.exports = router;
