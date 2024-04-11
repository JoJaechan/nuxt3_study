const axios = require('axios');
const { WooriClientID, WooriSecret, WooriAPIKey } = process.env;

const API_ENDPOINTS = {
    W2W: '/oai/wb/v1/trans/getWooriAcctToWooriAcct',
    EXECUTE_W2W: '/oai/wb/v1/trans/executeWooriAcctToWooriAcct',
    W2O: '/oai/wb/v1/trans/getWooriAcctToOtherAcct',
    EXECUTE_W2O: '/oai/wb/v1/trans/executeWooriAcctToOtherAcct'
};

const HOST = 'https://localhost:8080';

class DataHeader {
    constructor(UTZPE_CNCT_IPAD, UTZPE_CNCT_MCHR_UNQ_ID, UTZPE_CNCT_TEL_NO_TXT, UTZPE_CNCT_MCHR_IDF_SRNO, UTZ_MCHR_OS_DSCD, UTZ_MCHR_OS_VER_NM, UTZ_MCHR_MDL_NM, UTZ_MCHR_APP_VER_NM) {
        this.UTZPE_CNCT_IPAD = UTZPE_CNCT_IPAD;
        this.UTZPE_CNCT_MCHR_UNQ_ID = UTZPE_CNCT_MCHR_UNQ_ID;
        this.UTZPE_CNCT_TEL_NO_TXT = UTZPE_CNCT_TEL_NO_TXT;
        this.UTZPE_CNCT_MCHR_IDF_SRNO = UTZPE_CNCT_MCHR_IDF_SRNO;
        this.UTZ_MCHR_OS_DSCD = UTZ_MCHR_OS_DSCD;
        this.UTZ_MCHR_OS_VER_NM = UTZ_MCHR_OS_VER_NM;
        this.UTZ_MCHR_MDL_NM = UTZ_MCHR_MDL_NM;
        this.UTZ_MCHR_APP_VER_NM = UTZ_MCHR_APP_VER_NM;
    }
}

class DataBody {
    constructor(WDR_ACNO, TRN_AM, RCV_BKCD, RCV_ACNO, PTN_PBOK_PRNG_TXT) {
        this.WDR_ACNO = WDR_ACNO;
        this.TRN_AM = TRN_AM;
        this.RCV_BKCD = RCV_BKCD;
        this.RCV_ACNO = RCV_ACNO;
        this.PTN_PBOK_PRNG_TXT = PTN_PBOK_PRNG_TXT;
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
