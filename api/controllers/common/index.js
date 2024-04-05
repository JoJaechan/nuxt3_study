const axios = require('axios');
const dotenv = require('dotenv');
const path = require("path");
dotenv.config({ path: path.resolve('.env') });

async function fetchData(url) {
    const { default: fetch } = await import('node-fetch');
    // Use fetch as normal
    const response = await fetch(url);

    // console.log("response", response)
    const data = await response.json();
    return data;
}

module.exports.payouts = async function (req, res) {
    try {
        const payoutData = req.body;

        const clientId = process.env.PayPalClientID; // PayPal Client ID
        const secret =  process.env.PayPalSecret // PayPal Secret

        // PayPal OAuth 토큰을 가져옵니다.
        const authResponse = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', 'grant_type=client_credentials', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
                username: clientId,
                password: secret,
            },
        });

        const accessToken = authResponse.data.access_token;

        const payoutResponse = await axios.post('https://api.sandbox.paypal.com/v1/payments/payouts', payoutData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        // console.log('payoutResponse', payoutResponse.data);

        if (!payoutResponse) {
            throw new Error('Failed to process PayPal Payout');
        }

        const batchId = payoutResponse.data.batch_header.payout_batch_id

        res.json({batchId});
    } catch (error) {
        // console.error('Error processing PayPal Payout:', error);
        res.status(500).send('Error processing PayPal Payout');
    }
}

module.exports.batchDetail = async function (req, res) {
    try {
        const { batchId } = req.body;
        console.log('[batchDetail] batchId : ', batchId)

        const clientId = process.env.PayPalClientID; // PayPal Client ID
        const secret =  process.env.PayPalSecret // PayPal Secret

        // PayPal OAuth 토큰을 가져옵니다.
        const authResponse = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', 'grant_type=client_credentials', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
                username: clientId,
                password: secret,
            },
        });

        const accessToken = authResponse.data.access_token;

        // optional : ?page=1&page_size=5&total_required=true
        const result = await fetch('https://api-m.sandbox.paypal.com/v1/payments/payouts/' + batchId, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        res.json(result);
    } catch (error) {
        // console.error('Error processing PayPal Payout:', error);
        res.status(500).send('Error processing PayPal Payout');
    }
}
