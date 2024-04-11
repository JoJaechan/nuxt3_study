const axios = require('axios');
const crypto = require('crypto');
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
        const postData = req.body;

        const accessToken = await getPayPalAccessToken();

        const payoutResponse = await axios.post(endPointPayouts, payoutData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!payoutResponse) {
            throw new BadRequestError('Failed to process PayPal Payout');
        }

        return payoutResponse;
    } catch (e) {
        throw new BadRequestError('SMS_SEND_FAIL');
    }
}

async function batchDetail(req) {
    try {
        const {batchId} = req.params; // required
        const {page, page_size, total_required} = req.params; // optional
        if (!batchId) {
            throw new BadRequestError('Batch ID is required');
        }

        const accessToken = await getPayPalAccessToken();

        const result = await axios.get('https://api-m.sandbox.paypal.com/v1/payments/payouts/' + batchId, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!result || !result.data) {
            throw new BadRequestError('Failed to process PayPal Payout');
        }

        return result;
    } catch (e) {
        throw new BadRequestError('batchDetail');
    }
}

async function webhook(req) {
    try {
        const isValid = await verifyWebhookEvent(req);
        if (!isValid) {
            throw new BadRequestError('Webhook verification failed');
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
                throw new BadRequestError('Received unhandled event type');
            }
        }

        return;
    } catch (e) {
        throw new BadRequestError('webhook');
    }
}

class PurchaseUnit {
    constructor(items, amount, payee) {
        if (!amount || !amount.currency_code || !amount.value) {
            throw new Error("Amount with currency_code and value is required");
        }
        this.items = items;
        this.amount = new Amount(amount.currency_code, amount.value, amount.breakdown);
        this.payee = new Payee(payee.email_address);
    }
}

class Item {
    constructor(name, description, quantity, unitAmount) {
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.unitAmount = unitAmount;
    }
}

class Amount {
    constructor(currencyCode, value, breakdown) {
        this.currency_code = currencyCode;
        this.value = value;
        this.breakdown = breakdown;
    }
}

class Payee {
    constructor(emailAddress) {
        this.email_address = emailAddress;
    }
}

class OrderData {
    constructor(intent, purchaseUnits, experienceContext) {
        if (!intent || !purchaseUnits) {
            throw new Error("Intent and at least one PurchaseUnit are required");
        }
        this.intent = intent;
        this.purchase_units = purchaseUnits.map(pu => new PurchaseUnit(
            pu.items.map(item => new Item(item.name, item.description, item.quantity, item.unitAmount)),
            pu.amount,
            pu.payee
        ));
        // Incorporate the experience context directly into the PayPal payment source
        this.payment_source = {
            paypal: {
                experience_context: experienceContext
            }
        };
    }
}

async function orders(req) {
    try {
        const { items, currency_code, email_address, experienceContext } = req.body;

        const purchaseUnits = items.map(item => ({
            amount: {
                currency_code: currency_code,
                value: item.unit_price * item.quantity,
                breakdown: {
                    item_total: {
                        currency_code: currency_code,
                        value: item.unit_price * item.quantity
                    }
                }
            },
            items: [item],
            payee: {
                email_address: email_address
            }
        }));

        const orderData = new OrderData("CAPTURE", purchaseUnits, experienceContext);

        const orderResponse = await axios.post(endPointOrders, orderData, {
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
        throw new BadRequestError('batchDetail');
    }
}

module.exports = {
    payouts, //  (B2C -> 1:1)
    batchDetail, // payouts result detail
    webhook, // webhook event processing
    orders, // (BC2 -> 1:N)
};
