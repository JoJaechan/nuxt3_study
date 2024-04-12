<template>
  <main>
    <button @click="clickPayouts">Payouts</button>
    <button @click="clickBatchDetail">Batch Detail</button>
    batchId = {{ batchId }}
    <div id="paypal-checkout"/>
  </main>
</template>

<script setup>
import {ref} from 'vue';
import {usePaypalButton} from '../src/runtime/composables/usePaypal'

const originalItems = ref([
  {
    name: 'payment',
    description: 'payment desc',
    quantity: 1,
    unit_price: '1.00'
  }
]);

const items = ref(originalItems.value.map(item => ({
  name: item.name,
  description: item.description,
  quantity: item.quantity.toString(), // quantity를 문자열로 변환
  unit_amount: { // unit_price 대신 unit_amount 사용
    currency_code: "USD",
    value: item.unit_price
  }
})));

usePaypalButton({
  createOrder() {
    return fetch("/api/common/orders/capture", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          items: items.value,
          amount: {
            currency_code: "USD",
            value: "1.00", // 총 금액을 직접 지정
            breakdown: {
              item_total: { // 각 항목의 총합을 나타내는 breakdown 추가
                currency_code: "USD",
                value: "1.00"
              }
            }
          },
          payee: {
            email_address: "sb-aauzz23973603@personal.example.com"
          }
        }],
      })
    })
        .then((response) => response.json())
        .then((order) => order.id);
  },

  onApprove(data) {
    console.log('onApprove', data);
  }


})

const batchId = ref('');

const payoutData = ref({
  sender_batch_header: {
    email_subject: "You have a payment",
    sender_batch_id: `batch-${Date.now()}`
  },
  items: [
    {
      recipient_type: "EMAIL",
      amount: {
        value: "1.00",
        currency: "USD"
      },
      receiver: "mvpick.chan@gmail.com",
      note: "Payouts sample transaction",
      sender_item_id: `item-1-${Date.now()}`
    }
  ]
});

const clickPayouts = async () => {
  try {
    const result = await $fetch('/api/common/paypal/payouts', {
      method: 'POST',
      body: payoutData.value,
      timeout: 10000
    });

    if (result && result.batchId) {
      batchId.value = result.batchId;
      console.log('Batch ID:', batchId.value);
    }
  } catch (error) {
    console.error('Error during payouts:', error);
  }
};

const clickBatchDetail = async () => {
  if (!batchId.value) {
    console.log('Batch ID is null or empty');
    return;
  }

  try {
    const {data, pending} = await useFetch(`/api/common/paypal/payouts/batch/${batchId.value}`, {
      method: 'GET'
    });

    if (pending.value) {
      console.log('Request is still pending...');
    } else if (data.value) {
      console.log('Response:', JSON.stringify(data.value, null, 2));
    }
  } catch (error) {
    console.error('Error fetching payout details:', error);
  }
};
</script>
