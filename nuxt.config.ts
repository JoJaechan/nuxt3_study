// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: {
        enabled: true
    },
    modules: [
        'nuxt-paypal',
        'nuxt-primevue'
    ],
    paypal: {
        clientId: process.env.PayPalClientID
    },
    nitro: {
        devProxy: {
            "/api/": {
                target: "http://127.0.0.1:3001",
                changeOrigin: true,
            }
        }
    },
    primevue: {
    }
})
