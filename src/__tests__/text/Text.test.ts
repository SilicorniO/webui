const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const TIMEOUT = 5000
const SIZE = 50

describe("Text", () => {
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

    test("Text multiline", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "text-multiline")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        const element3 = await PuppeteerUtils.evalUiElement(page, "element3")

        expect(element2.height).toBeGreaterThan(element1.height)
        expect(element2.height).toBeLessThan(element3.height)
    })
})
