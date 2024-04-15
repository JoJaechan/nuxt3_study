const axios = require('axios');
const dotenv = require('dotenv');
const path = require("path");
dotenv.config({path: path.resolve('.env')});
const paypalService = require('@services/paypal');
const wooribankService = require('@services/wooribank');
const pdfService = require('@services/pdf');
const cipher = require('@utils/cipher');

module.exports.createPayouts = async function (req, res) {
    try {
        const payoutResponse = await paypalService.payouts(req);
        const batchId = payoutResponse.data.batch_header.payout_batch_id

        res.json({batchId});
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error PayPal payouts' + error.message);
        } else {
            console.error('Error PayPal payouts');
        }
        res.status(500).send('Error processing PayPal Payout : ' + error);
    }
}

module.exports.getBatchDetail = async function (req, res) {
    try {
        const {batchId} = req.params;

        if (!batchId) {
            res.status(500).send('Batch ID is required');
        }

        const result = await paypalService.batchDetail(req);

        res.json(result.data);
    } catch (error) {
        console.error('Error PayPal batchDetail');
        res.status(500).send('Error processing PayPal Payout' + error);
    }
}

module.exports.webhook = async function (req, res) {
    try {
        await paypalService.webhookProcess(req);
        res.send('Webhook received and verified');
    } catch (error) {
        console.error('Webhook handling error:', error);
    }
}

module.exports.ordersCapture = async function (req, res) {
    try {
        const orderResponse = await paypalService.captureOrder(req, res);

        res.json(orderResponse.data);
    } catch (error) {
        console.error('Error PayPal orders', error);
        res.status(500).send('Error processing PayPal Order' + error);
    }
}

module.exports.getOrdersDetail = async function (req, res) {
    try {
        const orderResponse = await paypalService.orderDetail(req);

        res.json(orderResponse.data);
    } catch (error) {
        console.error('Error PayPal orders', error);
        res.status(500).send('Error processing PayPal Order' + error);
    }
}

// Woori 계좌에서 Woori 계좌로의 조회 요청 처리
module.exports.getWooriAcctToWooriAcct = async function (req, res) {
    try {
        const response = await wooribankService.executeWooriBankTransaction(wooribankService.API_ENDPOINTS.W2W, req.body);
        res.send(response);
    } catch (error) {
        console.error('Error during Woori transfer:', error);
        res.status(500).send('Error processing Woori Transfer: ' + error.message);
    }
}

// Woori 계좌에서 Woori 계좌로의 송금 요청 처리
module.exports.executeWooriAcctToWooriAcct = async function (req, res) {
    try {
        const response = await wooribankService.executeWooriBankTransaction(wooribankService.API_ENDPOINTS.EXECUTE_W2W, req.body);
        res.json(response);
    } catch (error) {
        console.error('Error during Woori transfer:', error);
        res.status(500).send('Error processing Woori Transfer: ' + error.message);
    }
}

// Woori 계좌에서 타행 계좌로의 조회 요청 처리
module.exports.getWooriAcctToOtherAcct = async function (req, res) {
    try {
        const response = await wooribankService.executeWooriBankTransaction(wooribankService.API_ENDPOINTS.W2O, req.body);
        res.send(response);
    } catch (error) {
        console.error('Error during Woori transfer:', error);
        res.status(500).send('Error processing Woori Transfer: ' + error.message);
    }
}

// Woori 계좌에서 타행 계좌로의 송금 요청 처리
module.exports.executeWooriAcctToOtherAcct = async function (req, res) {
    try {
        const response = await wooribankService.executeWooriBankTransaction(wooribankService.API_ENDPOINTS.EXECUTE_W2O, req.body);
        res.json(response);
    } catch (error) {
        console.error('Error during Woori transfer:', error);
        res.status(500).send('Error processing Woori Transfer: ' + error.message);
    }
}

// PDF 생성
module.exports.getPDF = async function (req, res) {
    try {
        const pdf = await pdfService.generatePDF(req, res);

        res.contentType('application/pdf');
        res.send(pdf);
    } catch (error) {
        console.error('Error during PDF generation:', error);
        res.status(500).send('Error processing PDF generation: ' + error.message);
    }
}

// 로그인
module.exports.signIn = async function (req, res) {
    try {
        const tokenInfo = {
            id: 1000,
        };

        const jwt = cipher.JWTCreate(tokenInfo);

        res.cookie('ACCESS_TOKEN', jwt.accessToken, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: 'strict'
        });
        res.cookie('REFRESH_TOKEN', jwt.refreshToken, {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: 'strict'
        });

        res.json({message: 'Sign In Success'});
    } catch (error) {
        console.error('Error during Sign In:', error);
        res.status(500).send('Error processing Sign In: ' + error.message);
    }
}
