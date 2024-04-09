const axios = require('axios');
const dotenv = require('dotenv');
const path = require("path");
dotenv.config({path: path.resolve('.env')});

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
        const payoutData = req.body;

        const accessToken = await getPayPalAccessToken();

        const payoutResponse = await axios.post('https://api.sandbox.paypal.com/v1/payments/payouts', payoutData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!payoutResponse) {
            res.status(500).send('Failed to process PayPal Payout');
        }

        const batchId = payoutResponse.data.batch_header.payout_batch_id

        res.json({batchId});
    } catch (error) {
        // AxiosError면 message를 콘솔에러로 찍음
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

        const accessToken = await getPayPalAccessToken();
        // optional : ?page=1&page_size=5&total_required=true
        const result = await axios.get('https://api-m.sandbox.paypal.com/v1/payments/payouts/' + batchId, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!result || !result.data) {
            res.status(500).send('Failed to process PayPal Payout');
        }

        res.json(result.data);
    } catch (error) {
        console.error('Error PayPal batchDetail');
        res.status(500).send('Error processing PayPal Payout' + error);
    }
}

// webhook
module.exports.webhook = async function (req, res) {
    try {
        const isValid = await verifyWebhookEvent(req);
        if (!isValid) {
            return res.status(401).send('Webhook verification failed');
        }

        const eventType = req.body.event_type;
        switch (eventType) {
            case 'PAYMENT.PAYOUTS-ITEM.UNCLAIMED':
                // Handle unclaimed payout item
                console.log('Handling unclaimed payout item:', req.body);
                break;
            case 'PAYMENT.PAYOUTSBATCH.PROCESSING':
                // Handle payouts batch processing
                console.log('Handling payouts batch processing:', req.body);
                break;
            case 'PAYMENT.PAYOUTSBATCH.SUCCESS':
                // Handle successful payouts batch
                console.log('Handling successful payouts batch:', req.body);
                break;
            case 'PAYMENT.CAPTURE.COMPLETED':
                // Handle completed payment capture
                console.log('Handling completed payment capture:', req.body);
                break;
            default:
                console.log('Received unhandled event type:', eventType);
        }

        res.send('Webhook received and verified');
    } catch (error) {
        console.error('Webhook handling error:', error);
        res.status(500).send('Internal Server Error');
    }
}

// order
module.exports.orders = async function (req, res) {
    try {
        const {currency_code, value, email_address} = req.body;

        const orderData = JSON.stringify({
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "items": [
                        {
                            "name": "T-Shirt",
                            "description": "Green XL",
                            "quantity": "1",
                            "unit_amount": {
                                "currency_code": "USD",
                                "value": value
                            }
                        }
                    ],
                    "amount": {
                        "currency_code": currency_code,
                        "value": value,
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency_code,
                                "value": value
                            }
                        }
                    },
                    "payee": {
                        "email_address": email_address
                    }
                }
            ],
            "application_context": {
                "return_url": "https://example.com/return",
                "cancel_url": "https://example.com/cancel"
            }
        });

        const accessToken = await getPayPalAccessToken();

        const orderResponse = await axios.post('https://api.sandbox.paypal.com/v2/checkout/orders', orderData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!orderResponse) {
            res.status(500).send('Failed to process PayPal Order');
        }

        res.json(orderResponse.data);
    } catch (error) {
        console.error('Error PayPal orders');
        res.status(500).send('Error processing PayPal Order' + error);
    }
}

async function getPayPalAccessToken() {
    const clientId = process.env.PayPalClientID; // PayPal Client ID
    const secret = process.env.PayPalSecret // PayPal Secret

    const authResponse = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', 'grant_type=client_credentials', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username: clientId,
            password: secret,
        },
    });
    return authResponse.data.access_token;
}

async function verifyWebhookEvent(req) {
    const accessToken = await getPayPalAccessToken();

    const verificationData = {
        webhook_id: process.env.WEBHOOK_ID,
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_time: req.headers['paypal-transmission-time'],
        cert_url: req.headers['paypal-cert-url'],
        auth_algo: req.headers['paypal-auth-algo'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        webhook_event: req.body
    };

    const verificationResponse = await axios.post('https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature', verificationData, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    return verificationResponse.data.verification_status === 'SUCCESS';
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
