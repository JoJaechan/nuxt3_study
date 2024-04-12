const express = require('express');
const router = express.Router();

const controllers = require('@controllers/common');

router.post('/paypal/payouts', controllers.createPayouts);
router.get('/paypal/payouts/batch/:batchId', controllers.getBatchDetail);
router.post('/paypal/webhook', controllers.webhook);
router.post('/orders/capture', controllers.ordersCapture);
router.get('/orders/:id', controllers.getOrdersDetail);

router.get('/woori/transfer', controllers.getWooriAcctToWooriAcct); // 당행간 이체조회
router.post('/woori/transfer', controllers.executeWooriAcctToWooriAcct); // 당행간 이제실행
router.get('/woori/transfer/other', controllers.getWooriAcctToOtherAcct); // 타행간 이체조회
router.post('/woori/transfer/other', controllers.executeWooriAcctToOtherAcct); // 타행간 이제실행

router.get('/pdf', controllers.getPDF); // PDF 생성

module.exports = router;
