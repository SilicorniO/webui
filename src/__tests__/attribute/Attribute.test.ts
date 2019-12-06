const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000

describe("Attribute", () => {
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

    test("Different name", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "different-name")
        const screen = await PuppeteerUtils.evalElement(page, "screen")
        const element = await PuppeteerUtils.evalElement(page, "element")

        expect(element.top).toBe((screen.height - element.height) / 2)
        expect(element.left).toBe((screen.width - element.width) / 2)
    })
})
