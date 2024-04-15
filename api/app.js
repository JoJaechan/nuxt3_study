const express = require('express')

const app = express()
const port = 3001;
// JSON 본문 파싱을 위한 미들웨어 추가
app.use(express.json());

require('module-alias/register');
const commonRouter = require('@routes/common');
const userRouter = require('@routes/user');
const userHandler = require('@middlewares/userHandler');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use('/common', commonRouter);
app.use('/user', userHandler, userRouter);

app.get('/', (req, res) => {
    console.log('test')
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
