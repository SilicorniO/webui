const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const TIMEOUT = 5000

describe("Events", () => {
    let browser: any
    let page: any

    beforeAll(async () => {
        browser = await puppeteer.launch({
            ignoreHTTPSErrors: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-certificate-errors"],
        })
        page = await browser.newPage()
    }, TIMEOUT)

    afterAll(async (done: () => void) => {
        await page.close()
        await browser.close()
        done()
    })

    test("Start event", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "start-event")
        const startEvent = await page.evaluate(() => {
            return startEvent
        })

        expect(startEvent).toBeTruthy()
    })

    test("End event", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "end-event")
        const endEvent = await page.evaluate(() => {
            return endEvent
        })

        expect(endEvent).toBeTruthy()
    })
})
