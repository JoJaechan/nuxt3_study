const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

async function generatePDF(req) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const url = req.query.url;
        const path = req.query.path;

        await page.goto(url, { waitUntil: 'networkidle2' });

        const pdfBuffer = await page.pdf({
            path, // PDF 파일 경로와 이름
            format: 'A4',        // 종이 크기 설정
            printBackground: true // 배경 이미지/색상도 인쇄하려면 true로 설정
        });

        await browser.close();

        // base64로 인코딩된 PDF 파일을 반환
        return pdfBuffer.toString('base64');
    } catch (error) {
        console.error('Error during generatePDF transaction:', error);
        throw new Error('Error processing generatePDF Transaction: ' + error.message);
    }
}

async function generateExcel(req) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const url = req.query.url;

        await page.goto(url, { waitUntil: 'networkidle2' });

        // 페이지에서 데이터 추출
        const data = await page.evaluate(() => {
            return document.querySelector('#__nuxt').innerText;
        });

        console.log('data', data)

        // 데이터 파싱
        const rows = data.split('\n'); // 줄바꿈으로 행 분리
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('My Sheet');

        // 각 행을 탭으로 분리하여 엑셀에 추가
        rows.forEach((row, index) => {
            // 헤더가 아닌 행에서만 탭으로 분리
            if (index !== 0) {
                const values = row.split('\t');
                sheet.addRow(values);
            }
        });

        // 파일 경로 지정 및 파일 저장
        // const filePath = path.resolve(__dirname, 'report.xlsx');
        // await workbook.xlsx.writeFile(filePath);

        // 메모리에 엑셀 파일을 base64 문자열로 변환
        const buffer = await workbook.xlsx.writeBuffer();
        const base64 = buffer.toString('base64');

        await browser.close();

        // base64 문자열 반환
        return base64;
    } catch (error) {
        console.error('Error during generateExcel transaction:', error);
        throw new Error('Error processing generateExcel Transaction: ' + error.message);
    }
}

module.exports = {
    generatePDF,
    generateExcel
};
