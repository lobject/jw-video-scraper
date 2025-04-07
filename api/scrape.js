const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

module.exports = async (req, res) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(
      'https://www.jw.org/ja/ライブラリー/ビデオ/#ja/mediaitems/StudioMonthlyPrograms',
      { waitUntil: 'networkidle2' }
    );

    const videos = await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll('.media-item');

      items.forEach((item) => {
        const title = item.querySelector('.title')?.innerText?.trim();
        const href = item.querySelector('a')?.href;
        if (title && href) {
          results.push({ title, url: href });
        }
      });

      return results;
    });

    res.status(200).json(videos);
  } catch (err) {
    console.error('Scrape error:', err);  // ここでエラー内容をログに出力
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  } finally {
    if (browser) await browser.close();
  }
};
