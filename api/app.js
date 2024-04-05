const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express()
const port = 3001;

app.use('/api', createProxyMiddleware({
    target: 'http://127.0.0.1:3001', // 백엔드 서버 주소
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // /api로 시작하는 경로를 제거
    },
}));


require('module-alias/register');
const commonRouter = require('@routes/common');
app.use('/common', commonRouter);

app.get('/', (req, res) => {
    console.log('test')
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
