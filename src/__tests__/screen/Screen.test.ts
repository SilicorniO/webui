const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const TIMEOUT = 5000
const PADDING = 50

describe("Screen", () => {
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

    test("Subscreen", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "subscreen")
        const screen = await PuppeteerUtils.evalElement(page, "screen")
        const subscreen = await PuppeteerUtils.evalElement(page, "subscreen")

        expect(subscreen.width).toBe(screen.width - PADDING - PADDING)
    })
})
