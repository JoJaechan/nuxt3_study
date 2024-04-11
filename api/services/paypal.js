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

        const payoutResponse = await axios.post(endPointPayouts, req.body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!payoutResponse) {
            throw new Error('Failed to process PayPal Payout');
        }

        return payoutResponse;
    } catch (e) {
        throw new Error('SMS_SEND_FAIL');
    }
}

async function batchDetail(req) {
    try {
        const {batchId} = req.params; // required
        const {page, page_size, total_required} = req.params; // optional
        if (!batchId) {
            throw new Error('Batch ID is required');
        }

        const accessToken = await getPayPalAccessToken();

        const result = await axios.get('https://api-m.sandbox.paypal.com/v1/payments/payouts/' + batchId, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!result || !result.data) {
            throw new Error('Failed to process PayPal Payout');
        }

        return result;
    } catch (e) {
        throw new Error('batchDetail');
    }
}

async function webhook(req) {
    try {
        const isValid = await verifyWebhookEvent(req);
        if (!isValid) {
            throw new Error('Webhook verification failed');
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
                throw new Error('Received unhandled event type');
            }
        }

        return;
    } catch (e) {
        throw new Error(e);
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
        throw new Error('captureOrder' + e);
    }
}

module.exports = {
    payouts, //  (B2C -> 1:1)
    batchDetail, // payouts result detail
    webhook, // webhook event processing
    captureOrder, // (BC2 -> 1:N)
};
