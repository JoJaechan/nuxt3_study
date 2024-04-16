const puppeteer = require('puppeteer');

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

        const pdfBuffer = await page.pdf({
            // path: 'example.pdf', // PDF 파일 경로와 이름
            format: 'A4',        // 종이 크기 설정
            printBackground: true // 배경 이미지/색상도 인쇄하려면 true로 설정
        });

        await browser.close();

        return pdfBuffer;
    } catch (error) {
        console.error('Error during generatePDF transaction:', error);
        throw new Error('Error processing generatePDF Transaction: ' + error.message);
    }
}

module.exports = {
    generatePDF,
    generateExcel
};
