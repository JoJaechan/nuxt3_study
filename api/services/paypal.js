const axios = require('axios');
const {PayPalClientID, PayPalSecret} = process.env;
const endPointOrders = 'https://api.sandbox.paypal.com/v2/checkout/orders';
const endPointPayouts = 'https://api.sandbox.paypal.com/v1/payments/payouts';

async function getPayPalAccessToken() {
    const authResponse = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', 'grant_type=client_credentials', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username: PayPalClientID,
            password: PayPalSecret,
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

async function payouts(req) {
    try {
        const accessToken = await getPayPalAccessToken();

        return await axios.post(endPointPayouts, req.body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (e) {
        console.error(e);
        throw new Error('payouts Error', e.message);
    }
}

async function batchDetail(req) {
    try {
        const {batchId} = req.params; // required
        const {page, page_size, total_required} = req.params; // optional

        const accessToken = await getPayPalAccessToken();

        const baseUrl = 'https://api-m.sandbox.paypal.com/v1/payments/payouts/' + batchId;
        let url = page && page_size ? `${baseUrl}?page=${page}&page_size=${page_size}` : baseUrl;
        url = total_required ? `${url}&total_required=true` : url;

        return await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (e) {
        console.error('Error fetching PayPal batch detail: ', e.message);
        throw new Error(`Error in batchDetail: ${e.message}`);
    }
}

async function webhookProcess(req) {
    try {
        const isValid = await verifyWebhookEvent(req);
        if (!isValid) {
            return null;
        }

        const eventType = req.body.event_type;
        switch (eventType) {
            case 'PAYMENT.PAYOUTS-ITEM.UNCLAIMED':
                break;
            case 'PAYMENT.PAYOUTSBATCH.PROCESSING':
                break;
            case 'PAYMENT.PAYOUTSBATCH.SUCCESS':
                break;
            case 'PAYMENT.CAPTURE.COMPLETED':
                break;
            default: {
                console.error('Received unhandled event type:', eventType);
                return null;
            }
        }

        return eventType;
    } catch (e) {
        console.error('Error processing webhook:', e.message);
        throw e;
    }
}

async function captureOrder(req) {
    try {
        const accessToken = await getPayPalAccessToken();

        const orderResponse = await axios.post(endPointOrders, JSON.stringify(req.body), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });


        if (!orderResponse) {
            res.status(500).send('Failed to process PayPal Order');
        }

        return orderResponse;
    } catch (e) {
        throw new Error('captureOrder Error' + e);
    }
}

module.exports = {
    payouts, //  (B2C -> 1:1)
    batchDetail, // payouts result detail
    webhookProcess, // webhook event processing
    captureOrder, // (BC2 -> 1:N)
};
