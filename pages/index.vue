<template>
  <main>
    <button @click="clickPayouts">Payouts</button>
    <button @click="clickBatchDetail">Batch Detail</button>
    batchId = {{ batchId }}

<!--        <div id="paypal-checkout" />-->

    <pay-pal-button />


  </main>
</template>

<script setup>
import { ref } from 'vue';
// import { usePaypalButton } from '../src/runtime/composables/usePaypal'
//
// usePaypalButton({
//
//   // element: '#paypal-checkout', => default
//   onApprove: async (data, actions) => {
//     try {
//       const details = await actions.order?.capture();
//       console.log('Payment completed successfully:', details);
//     } catch (error) {
//       console.error('Error capturing payment:', error);
//     }
//   },
// })

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
    const { data, pending } = await useFetch(`/api/common/paypal/payouts/batch/${batchId.value}`, {
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
