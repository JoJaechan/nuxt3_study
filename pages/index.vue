<template>
  <main>

  </main>
</template>

<script setup lang="ts">

const payoutData = {
  sender_batch_header: {
    email_subject: "You have a payment",
    sender_batch_id: "batch-" + Date.now() // 고유한 배치 ID 생성
  },
  items: [
    {
      recipient_type: "EMAIL", // 수령인 타입: PHONE, EMAIL, PAYPAL_ID
      amount: {
        value: "1.00", // 송금 금액
        currency: "USD" // 통화
      },
      receiver: "example@example.com", // 수령인 식별 정보 (전화번호, 이메일 주소, PayPal ID)
      note: "Payouts sample transaction", // 메모
      sender_item_id: "item-1-" + Date.now() // 고유한 아이템 ID 생성
    }
    // 추가 아이템을 여기에 넣을 수 있습니다.
  ]
};

const ang = async () => {
  try {
    const response = await $fetch('/api/common/paypal/payouts', {
      method: 'POST', // HTTP 메소드를 POST로 설정
      headers: {
        'Content-Type': 'application/json' // 콘텐츠 타입을 JSON으로 설정
      },
      body: payoutData // JavaScript 객체를 JSON 문자열로 변환하지 않아도 됩니다. $fetch가 알아서 처리합니다.
    });

    return response; // 응답 데이터를 콘솔에 출력
  } catch (error) {
    console.error(error); // 에러 처리
  }
};

const result = await ang();

if (result) {
  console.log('result', result);

  if (result.batchId) {
    const batchId = result.batchId
    console.log('Batch ID: ', batchId);

    const response = await $fetch('/api/common/paypal/payouts/batch', {
      method: 'POST', // HTTP 메소드를 POST로 설정
      headers: {
        'Content-Type': 'application/json' // 콘텐츠 타입을 JSON으로 설정
      },
      body: { batchId }
    });

    console.log('response', response)
  }
}

</script>
