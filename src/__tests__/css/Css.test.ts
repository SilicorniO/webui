const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000

describe("Css", () => {
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

    test("List horizontal css", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "list-horizontal-css")
        let screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const screenHeight = screen.height

        await page.click("#addFirstItem")
        screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const item1 = await PuppeteerUtils.evalUiElement(page, "item1")
        const item2 = await PuppeteerUtils.evalUiElement(page, "item2")

        expect(screen.height).toBeGreaterThan(screenHeight)
        expect(item2.left).toBe(item1.left + item1.width + 20)
    })
})
