<template>
  <div>
  <button @click="clickPdfDownload">PDF Download</button>
  <button @click="clickExcelDownload">EXCEL Download</button>
  </div>

  <div>
  <button @click="clickuserLogin">LOGIN</button>
  <button @click="clickgetUserInfo">GET USER INFO</button>
  </div>

  <ProgressSpinner v-if="loading" mode="indeterminate" style="background-color: gray; color: #007ad9;" />
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
import 'primevue/resources/themes/saga-blue/theme.css'; // 테마에 따라 변경 가능

const loading = ref(false);

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

const clickPdfDownload = async () => {
  try {
    loading.value = true;

    const result = await $fetch('/api/common/pdf', {
      method: 'GET',
      // 원하는 url을 parameter로 전달, path전달시에는 백엔드 서버에 저장됨
      params: {
        url: 'https://dsec.mvpick.net/',
        //path: 'test.pdf'
      },
    });

    const url = window.URL.createObjectURL(base64ToBlob(result));
    const link = document.createElement('a');
    link.href = url;
    // link.setAttribute('download', 'downloaded_file.pdf'); // 다운로드할 파일명 지정
    link.target = '_blank';  // 새 창 또는 탭에서 링크를 열기 위해 target='_blank'를 설정
    document.body.appendChild(link);
    link.click();

    // 다운로드 후 링크 제거
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url); // 생성된 URL을 메모리에서 제거

    console.log('PDF 다운로드가 완료되었습니다.');
  } catch (e) {
    console.error('Error during generatePdf:', e);
  } finally {
    loading.value = false;
  }
}

const clickExcelDownload = async () => {
  try {
    loading.value = true;

    const result = await $fetch('/api/common/excel', {
      method: 'GET',
      params: {
        url: 'http://localhost:3000/test',
      },
    });

    const url = window.URL.createObjectURL(base64ToBlob(result, 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    const link = document.createElement('a');
    link.href = url;
    // link.setAttribute('download', 'downloaded_file.pdf'); // 다운로드할 파일명 지정
    link.target = '_blank';  // 새 창 또는 탭에서 링크를 열기 위해 target='_blank'를 설정
    document.body.appendChild(link);
    link.click();

    // 다운로드 후 링크 제거
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url); // 생성된 URL을 메모리에서 제거
  } catch (e) {
    console.error('Error during generatePdf:', e);
  } finally {
    loading.value = false;
  }
}

const base64ToBlob = (base64, fileType = 'pdf') => {
  const data = atob(base64);
  // Blob 객체 생성
  const byteNumbers = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    byteNumbers[i] = data.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: `application/${fileType}` });
}

const clickuserLogin = async () => {
  try {
    const res = await $fetch('/api/common/sign/in', {
      method: 'POST',
      data: {
          loginId: 'test',
          password: 'test'
      }
    });

    console.log('Login result:', res);
  } catch (e) {
    console.error('Error during login:', e);
  }
}

const clickgetUserInfo = async () => {
  try {
    const res = await $fetch('/api/user/info', {
      method: 'GET'
    });

    console.log('User Info:', res);
  } catch (e) {
    console.error('Error during getUserInfo:', e);
  }
}
</script>
