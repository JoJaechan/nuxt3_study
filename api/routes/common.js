const express = require('express');
const router = express.Router();

const controllers = require('@controllers/common');

router.post('/paypal/payouts', controllers.payouts);
router.post('/paypal/payouts/batch', controllers.batchDetail);

module.exports = router;
