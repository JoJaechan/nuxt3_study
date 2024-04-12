const puppeteer = require('puppeteer');

async function generatePDF(req, res) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

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
};