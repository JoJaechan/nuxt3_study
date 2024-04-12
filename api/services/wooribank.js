const axios = require('axios');
const { WooriClientID, WooriSecret, WooriAPIKey } = process.env;

const API_ENDPOINTS = {
    W2W: '/oai/wb/v1/trans/getWooriAcctToWooriAcct',
    EXECUTE_W2W: '/oai/wb/v1/trans/executeWooriAcctToWooriAcct',
    W2O: '/oai/wb/v1/trans/getWooriAcctToOtherAcct',
    EXECUTE_W2O: '/oai/wb/v1/trans/executeWooriAcctToOtherAcct'
};

const HOST = 'https://localhost:8080';

// 모든 헤더, 바디의 type은 string
class DataHeader {
    constructor(UTZPE_CNCT_IPAD, UTZPE_CNCT_MCHR_UNQ_ID, UTZPE_CNCT_TEL_NO_TXT, UTZPE_CNCT_MCHR_IDF_SRNO, UTZ_MCHR_OS_DSCD, UTZ_MCHR_OS_VER_NM, UTZ_MCHR_MDL_NM, UTZ_MCHR_APP_VER_NM) {
        this.UTZPE_CNCT_IPAD = UTZPE_CNCT_IPAD; // 이용자접속IP주소
        this.UTZPE_CNCT_MCHR_UNQ_ID = UTZPE_CNCT_MCHR_UNQ_ID; // 이용자접속기기고유ID
        this.UTZPE_CNCT_TEL_NO_TXT = UTZPE_CNCT_TEL_NO_TXT; // 이용자접속전화번호
        this.UTZPE_CNCT_MCHR_IDF_SRNO = UTZPE_CNCT_MCHR_IDF_SRNO; // 이용자접속기기식별일련번호
        this.UTZ_MCHR_OS_DSCD = UTZ_MCHR_OS_DSCD; // 이용자기기OS구분코드
        this.UTZ_MCHR_OS_VER_NM = UTZ_MCHR_OS_VER_NM; // 이용자기기OS버전명
        this.UTZ_MCHR_MDL_NM = UTZ_MCHR_MDL_NM; // 이용자기기모델명
        this.UTZ_MCHR_APP_VER_NM = UTZ_MCHR_APP_VER_NM; // 이용자기기앱버전명
    }
}

class DataBody {
    constructor(WDR_ACNO, TRN_AM, RCV_BKCD, RCV_ACNO, PTN_PBOK_PRNG_TXT) {
        this.WDR_ACNO = WDR_ACNO; // 출금계좌번호
        this.TRN_AM = TRN_AM; // 거래금액
        this.RCV_BKCD = RCV_BKCD; // 입금은행코드
        this.RCV_ACNO = RCV_ACNO; // 입금계좌번호
        this.PTN_PBOK_PRNG_TXT = PTN_PBOK_PRNG_TXT; // 상대통장인자내용
    }
}

class RequestBody {
    constructor(dataHeader, dataBody) {
        this.dataHeader = dataHeader;
        this.dataBody = dataBody;
    }
}

async function getWooriAccessToken() {
    // Todo. 액세스 토큰 획득 로직...
}

async function executeWooriBankTransaction(endpointKey, reqBody) {
    const endpoint = API_ENDPOINTS[endpointKey];
    if (!endpoint) throw new Error('Invalid endpoint key provided');

    try {
        const accessToken = await getWooriAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            'appkey': WooriAPIKey,
            'token': accessToken
        };

        // 데이터 헤더와 바디를 직접 구성
        const requestBody = new RequestBody(
            new DataHeader(
                reqBody.dataHeader.UTZPE_CNCT_IPAD,
                reqBody.dataHeader.UTZPE_CNCT_MCHR_UNQ_ID,
                reqBody.dataHeader.UTZPE_CNCT_TEL_NO_TXT,
                reqBody.dataHeader.UTZPE_CNCT_MCHR_IDF_SRNO,
                reqBody.dataHeader.UTZ_MCHR_OS_DSCD,
                reqBody.dataHeader.UTZ_MCHR_OS_VER_NM,
                reqBody.dataHeader.UTZ_MCHR_MDL_NM,
                reqBody.dataHeader.UTZ_MCHR_APP_VER_NM
            ),
            new DataBody(
                reqBody.dataBody.WDR_ACNO,
                reqBody.dataBody.TRN_AM,
                reqBody.dataBody.RCV_BKCD,
                reqBody.dataBody.RCV_ACNO,
                reqBody.dataBody.PTN_PBOK_PRNG_TXT
            )
        );

        const response = await axios.post(`${HOST}${endpoint}`, requestBody, { headers });
        return response.data;
    } catch (error) {
        console.error('Error during Woori Bank transaction:', error);
        throw new Error('Error processing Woori Bank Transaction: ' + error.message);
    }
}

module.exports = {
    executeWooriBankTransaction,
    API_ENDPOINTS
};
