const axios = require('axios');
const dotenv = require('dotenv');
const path = require("path");
dotenv.config({ path: path.resolve('.env') });

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
        const { batchId } = req.params;

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
        const { currency_code, value, email_address } = req.body;

        const orderData =  JSON.stringify({
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
    const secret =  process.env.PayPalSecret // PayPal Secret

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
