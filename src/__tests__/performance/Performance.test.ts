const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const TIMEOUT = 5000
const PADDING = 50
const MARGIN_MEDIUM = 20

describe("Performance", () => {
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

    test("List speed", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "list-speed")
        const timeProcess = await page.evaluate(() => {
            return timeProcess
        })

        console.log(timeProcess)
        expect(timeProcess).toBeGreaterThan(0)
        expect(timeProcess).toBeLessThan(200)
    })
})
