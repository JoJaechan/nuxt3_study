const express = require('express');
const router = express.Router();

const controllers = require('@controllers/common');

router.post('/paypal/payouts', controllers.payouts);
router.get('/paypal/payouts/batch/:batchId', controllers.batchDetail);
router.post('/paypal/webhook', controllers.webhook);
router.post('/orders', controllers.orders);

module.exports = router;
