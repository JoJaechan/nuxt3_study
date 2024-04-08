<template>
  <div>
    <div id="paypal-button-container"></div>
    ㅁㄴㅇㄹ
    <p id="result-message"></p>
  </div>
</template>

<script setup>
import {onMounted} from 'vue'
import {useHead} from '#app'

useHead({
  script: [
    {src: 'https://www.paypal.com/sdk/js?client-id=test&currency=USD', async: true},
  ],
})

onMounted(() => {
  if (window.paypal) {
    console.log("PayPal SDK already loaded")
    // Initialize PayPal Buttons here

    window.paypal
        .Buttons({
          async createOrder() {
            // try {
            //   const response = await fetch("/api/orders", {
            //     method: "POST",
            //     headers: {
            //       "Content-Type": "application/json",
            //     },
            //     // use the "body" param to optionally pass additional order information
            //     // like product ids and quantities
            //     body: JSON.stringify({
            //       cart: [
            //         {
            //           id: "YOUR_PRODUCT_ID",
            //           quantity: "YOUR_PRODUCT_QUANTITY",
            //         },
            //       ],
            //     }),
            //   });
            //
            //   const orderData = await response.json();
            //
            //   if (orderData.id) {
            //     return orderData.id;
            //   } else {
            //     const errorDetail = orderData?.details?.[0];
            //     const errorMessage = errorDetail
            //         ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
            //         : JSON.stringify(orderData);
            //
            //     throw new Error(errorMessage);
            //   }
            // } catch (error) {
            //   console.error(error);
            //   resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
            // }
          },
          async onApprove(data, actions) {

          },
        })
        .render("#paypal-button-container");

// Example function to show a result to the user. Your site's UI library can be used instead.
    // ToDO: Warning
    function resultMessage(message) {
      const container = document.querySelector("#result-message");
      container.innerHTML = message;
    }


  } else {
    const script = document.createElement('script')
    script.src = 'https://www.paypal.com/sdk/js?client-id=test&currency=USD'
    script.onload = () => {
      // Initialize PayPal Buttons here
    }
    document.head.appendChild(script)
  }
})
</script>
