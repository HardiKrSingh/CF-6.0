const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/newrating', async (req, res) => {
    const handle = req.body.handle;
    console.log(req.body.handle);
    if (!handle) {
        return res.status(400).json({ error: 'Handle is required' });
    }
    console.log(`Fetching rating for handle: ${handle}`);

    try {
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();
        await page.goto(`https://codeforces.com/profile/${handle}`, { waitUntil: 'networkidle2' });

        await page.waitForSelector('#pageContent > div:nth-child(3) > div > div.info > ul > li:nth-child(1) > span.user-green', { timeout: 10000 });
        
        const grab = await page.evaluate(() => {
            const ratingElement = document.querySelector('#pageContent > div:nth-child(3) > div > div.info > ul > li:nth-child(1) > span.user-green');
            return ratingElement ? ratingElement.innerText : null;
        });

        await browser.close();

        if (grab) {
            console.log('Rating fetched successfully:', grab);
            res.json({ rating: grab });
        } else {
            res.status(404).json({ error: 'Rating not found' });
        }
    } catch (error) {
        console.error('Error fetching rating:', error);
        res.status(500).json({ error: 'Failed to fetch rating' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
