// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: {
        enabled: true
    },
    modules: [
        'nuxt-paypal',
    ],
    paypal: {
        clientId: 'AeUyK1zdnJgubHnMQKu5I9Zdk0Qz6rSvPX61C_oF6Tu0Vw0_jxUZcDom4imLMkVJMPhqHwPqdo19cPKv',
    },
    nitro: {
        devProxy: {
            "/api/": {
                target: "http://127.0.0.1:3001",
                changeOrigin: true,
            }
        }
    }
})
