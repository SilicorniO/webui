const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000

describe("Dom", () => {
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

    test("Doctype", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "doctype")
        const layer1 = await PuppeteerUtils.evalUiElement(page, "layer1")

        expect(layer1.width).not.toBe(0)
        expect(layer1.height).not.toBe(0)
    })
})
