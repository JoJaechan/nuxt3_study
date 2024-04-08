<template>
  <main>
    <button @click="clickPayouts">Payouts</button>
    <button @click="clickBatchDetail">Batch Detail</button>
    batchId = {{ batchId }}
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface PayoutBatchResponse {
  payout_batch_id: string;
  batch_status: "SUCCESS" | "PENDING" | "DENIED" | "PROCESSING" | "FAILED";
  time_created: string;
  time_completed: string;
  sender_batch_header: {
    sender_batch_id: string;
    email_subject: string;
  };
  funding_source: "BALANCE" | "BANK" | "CREDIT_CARD" | "DEBIT_CARD";
  amount: {
    currency: string;
    value: string;
  };
  fees: {
    currency: string;
    value: string;
  };
}

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
      receiver: "example@example.com",
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
      timeout: 5000
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
    const { data, pending } = await useFetch<PayoutBatchResponse>(`/api/common/paypal/payouts/batch/${batchId.value}`, {
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
