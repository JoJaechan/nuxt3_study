const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const path = require('path');

async function setupPuppeteer() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    return { browser, page };
}

async function generatePDF(req) {
    const { browser, page } = await setupPuppeteer();
    try {
        const { url, filepath } = req.query;
        await page.goto(url, { waitUntil: 'networkidle2' });

        const pdfBuffer = await page.pdf({
            'path': filepath, // PDF 파일 경로와 이름
            format: 'A4',        // 종이 크기 설정
            printBackground: true // 배경 이미지/색상도 인쇄하려면 true로 설정
        });

        await browser.close();

        return { data: pdfBuffer.toString('base64'), filepath };
    } catch (error) {
        console.error('Error during generatePDF transaction:', error);
        throw new Error('Error processing generatePDF Transaction: ' + error.message);
    }  finally {
        await browser.close();
    }
}

async function generateExcel(req) {
    const { browser, page } = await setupPuppeteer();
    try {
        const { url, selector, filepath } = req.query;

        await page.goto(url, { waitUntil: 'networkidle2' });

        // 페이지에서 데이터 추출
        await page.evaluate((sel) => {
            return document.querySelector(sel) !== null;
        }, selector);

        // Extract data using the valid selector
        const data = await page.evaluate(() => {
            return document.querySelector('#__nuxt').innerText;
        });

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
        if (filepath) {
            const filePath = path.resolve(__dirname, 'report.xlsx');
            await workbook.xlsx.writeFile(filePath);
        }

        // 메모리에 엑셀 파일을 base64 문자열로 변환
        const buffer = await workbook.xlsx.writeBuffer();
        const base64 = buffer.toString('base64');

        return { data: base64, filepath };
    } catch (error) {
        console.error('Error during generateExcel transaction:', error);
        throw new Error('Error processing generateExcel Transaction: ' + error.message);
    } finally {
        await browser.close();
    }
}

module.exports = {
    generatePDF,
    generateExcel
};
