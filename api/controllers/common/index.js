const axios = require('axios');
const dotenv = require('dotenv');
const path = require("path");
dotenv.config({path: path.resolve('.env')});
const paypal = require('@services/paypal');

class DataHeader {
    constructor(UTZPE_CNCT_IPAD, UTZPE_CNCT_MCHR_UNQ_ID, UTZPE_CNCT_TEL_NO_TXT, UTZPE_CNCT_MCHR_IDF_SRNO, UTZ_MCHR_OS_DSCD, UTZ_MCHR_OS_VER_NM, UTZ_MCHR_MDL_NM, UTZ_MCHR_APP_VER_NM) {
        this.UTZPE_CNCT_IPAD = UTZPE_CNCT_IPAD;
        this.UTZPE_CNCT_MCHR_UNQ_ID = UTZPE_CNCT_MCHR_UNQ_ID;
        this.UTZPE_CNCT_TEL_NO_TXT = UTZPE_CNCT_TEL_NO_TXT;
        this.UTZPE_CNCT_MCHR_IDF_SRNO = UTZPE_CNCT_MCHR_IDF_SRNO;
        this.UTZ_MCHR_OS_DSCD = UTZ_MCHR_OS_DSCD;
        this.UTZ_MCHR_OS_VER_NM = UTZ_MCHR_OS_VER_NM;
        this.UTZ_MCHR_MDL_NM = UTZ_MCHR_MDL_NM;
        this.UTZ_MCHR_APP_VER_NM = UTZ_MCHR_APP_VER_NM;
    }
}

class DataBody {
    constructor(WDR_ACNO, TRN_AM, RCV_BKCD, RCV_ACNO, PTN_PBOK_PRNG_TXT) {
        this.WDR_ACNO = WDR_ACNO;
        this.TRN_AM = TRN_AM;
        this.RCV_BKCD = RCV_BKCD;
        this.RCV_ACNO = RCV_ACNO;
        this.PTN_PBOK_PRNG_TXT = PTN_PBOK_PRNG_TXT;
    }
}

class RequestBody {
    constructor(dataHeader, dataBody) {
        this.dataHeader = dataHeader;
        this.dataBody = dataBody;
    }
}

module.exports.payouts = async function (req, res) {
    try {
        const payoutResponse = await paypal.payouts(req);
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

module.exports.batchDetail = async function (req, res) {
    try {
        const {batchId} = req.params;

        if (!batchId) {
            res.status(500).send('Batch ID is required');
        }

        const result = await paypal.batchDetail(req);

        res.json(result.data);
    } catch (error) {
        console.error('Error PayPal batchDetail');
        res.status(500).send('Error processing PayPal Payout' + error);
    }
}

module.exports.webhook = async function (req, res) {
    try {
        await paypal.webhook(req);
        res.send('Webhook received and verified');
    } catch (error) {
        console.error('Webhook handling error:', error);
    }
}

module.exports.orders = async function (req, res) {
    try {
        const orderResponse = await paypal.captureOrder(req);

        res.json(orderResponse.data);
    } catch (error) {
        console.error('Error PayPal orders', error);
        res.status(500).send('Error processing PayPal Order' + error);
    }
}

// transfer
async function getWooriAccessToken() {
    // 액세스 토큰 획득 로직 구현
    return 'your_access_token'; // 예시 값
}

module.exports.getWooriAcctToWooriAcct = async function (req, res) {
    try {
        const accessToken = await getWooriAccessToken();

        const headers = {
            'Content-Type': 'application/json',
            'appkey': process.env.WOORI_API_KEY,
            'token': accessToken
        };

        const data = new RequestBody(
            new DataHeader(
                dataHeader.UTZPE_CNCT_IPAD,
                dataHeader.UTZPE_CNCT_MCHR_UNQ_ID,
                dataHeader.UTZPE_CNCT_TEL_NO_TXT,
                dataHeader.UTZPE_CNCT_MCHR_IDF_SRNO,
                dataHeader.UTZ_MCHR_OS_DSCD,
                dataHeader.UTZ_MCHR_OS_VER_NM,
                dataHeader.UTZ_MCHR_MDL_NM,
                dataHeader.UTZ_MCHR_APP_VER_NM
            ),
            new DataBody(
                dataBody.WDR_ACNO,
                dataBody.TRN_AM,
                dataBody.RCV_BKCD,
                dataBody.RCV_ACNO,
                dataBody.PTN_PBOK_PRNG_TXT
            )
        );

        const response = await axios.post('/oai/wb/v1/trans/getWooriAcctToWooriAcct', data, { headers });

        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Body:', response.data);

        // Sending the response back
        res.send(response.data);
    } catch (error) {
        console.error('Error during Woori transfer:', error);
        res.status(500).send('Error processing Woori Transfer: ' + error.message);
    }
}

module.exports.executeWooriAcctToWooriAcct = async function (req, res) {
    try {
        const {dataHeader, dataBody} = req.body;
        const transferData = new RequestBody(
            new DataHeader(
                dataHeader.UTZPE_CNCT_IPAD,
                dataHeader.UTZPE_CNCT_MCHR_UNQ_ID,
                dataHeader.UTZPE_CNCT_TEL_NO_TXT,
                dataHeader.UTZPE_CNCT_MCHR_IDF_SRNO,
                dataHeader.UTZ_MCHR_OS_DSCD,
                dataHeader.UTZ_MCHR_OS_VER_NM,
                dataHeader.UTZ_MCHR_MDL_NM,
                dataHeader.UTZ_MCHR_APP_VER_NM
            ),
            new DataBody(
                dataBody.WDR_ACNO,
                dataBody.TRN_AM,
                dataBody.RCV_BKCD,
                dataBody.RCV_ACNO,
                dataBody.PTN_PBOK_PRNG_TXT
            )
        );

        const accessToken = await getWooriAccessToken();

        const headers = {
            'Content-Type': 'application/json',
            'appkey': process.env.WOORI_API_KEY,
            'token': accessToken
        };

        const transferResponse = await axios.post('https://localhost:8080/oai/wb/v1/trans/executeWooriAcctToWooriAcct', transferData, {headers});

        res.json(transferResponse.data);
    } catch (error) {
        console.error('Error during Woori transfer:', error);
        res.status(500).send('Error processing Woori Transfer: ' + error.message);
    }
}

module.exports.getWooriAcctToOtherAcct = async function (req, res) {
    try {
        const accessToken = await getWooriAccessToken();

        const headers = {
            'Content-Type': 'application/json',
            'appkey': process.env.WOORI_API_KEY,
            'token': accessToken
        };

        const data = new RequestBody(
            new DataHeader(
                dataHeader.UTZPE_CNCT_IPAD,
                dataHeader.UTZPE_CNCT_MCHR_UNQ_ID,
                dataHeader.UTZPE_CNCT_TEL_NO_TXT,
                dataHeader.UTZPE_CNCT_MCHR_IDF_SRNO,
                dataHeader.UTZ_MCHR_OS_DSCD,
                dataHeader.UTZ_MCHR_OS_VER_NM,
                dataHeader.UTZ_MCHR_MDL_NM,
                dataHeader.UTZ_MCHR_APP_VER_NM
            ),
            new DataBody(
                dataBody.WDR_ACNO,
                dataBody.TRN_AM,
                dataBody.RCV_BKCD,
                dataBody.RCV_ACNO,
                dataBody.PTN_PBOK_PRNG_TXT
            )
        );

        const response = await axios.post('/oai/wb/v1/trans/getWooriAcctToOtherAcct', data, { headers });

        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Body:', response.data);

        // Sending the response back
        res.send(response.data);
    } catch (error) {
        console.error('Error during Woori transfer:', error);
        res.status(500).send('Error processing Woori Transfer: ' + error.message);
    }
}

module.exports.executeWooriAcctToOtherAcct = async function (req, res) {
    try {
        const {dataHeader, dataBody} = req.body;
        const transferData = new RequestBody(
            new DataHeader(
                dataHeader.UTZPE_CNCT_IPAD,
                dataHeader.UTZPE_CNCT_MCHR_UNQ_ID,
                dataHeader.UTZPE_CNCT_TEL_NO_TXT,
                dataHeader.UTZPE_CNCT_MCHR_IDF_SRNO,
                dataHeader.UTZ_MCHR_OS_DSCD,
                dataHeader.UTZ_MCHR_OS_VER_NM,
                dataHeader.UTZ_MCHR_MDL_NM,
                dataHeader.UTZ_MCHR_APP_VER_NM
            ),
            new DataBody(
                dataBody.WDR_ACNO,
                dataBody.TRN_AM,
                dataBody.RCV_BKCD,
                dataBody.RCV_ACNO,
                dataBody.PTN_PBOK_PRNG_TXT
            )
        );

        const accessToken = await getWooriAccessToken();

        const headers = {
            'Content-Type': 'application/json',
            'appkey': process.env.WOORI_API_KEY,
            'token': accessToken
        };

        const transferResponse = await axios.post('https://localhost:8080/oai/wb/v1/trans/executeWooriAcctToWooriAcct', transferData, {headers});

        res.json(transferResponse.data);
    } catch (error) {
        console.error('Error during Woori transfer:', error);
        res.status(500).send('Error processing Woori Transfer: ' + error.message);
    }
}
