const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000

describe("Lists", () => {
    let browser: any
    let page: any

    beforeAll(async () => {
        browser = await puppeteer.launch({
            ignoreHTTPSErrors: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-certificate-errors"],
        })
        page = await browser.newPage()
    }, timeout)

    afterAll(async (done: () => void) => {
        await page.close()
        await browser.close()
        done()
    })

    test("Table 0", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "table-0")
        const t0 = await PuppeteerUtils.evalElement(page, "t0")
        const t2 = await PuppeteerUtils.evalElement(page, "t2")
        const r0e0 = await PuppeteerUtils.evalElement(page, "r0e0")
        const r1e2 = await PuppeteerUtils.evalElement(page, "r1e2")

        expect(r0e0.left).toBe(t0.left)
        expect(r0e0.width).toBe(t0.width)
        expect(r0e0.top).toBe(t0.top + t0.height)
        expect(r1e2.left).toBe(t2.left)
        expect(r1e2.width).toBe(t2.width)
        expect(r1e2.top).toBe(r0e0.top + r0e0.height)
    })
})
