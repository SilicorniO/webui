const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const TIMEOUT = 5000
const PADDING = 50
const MARGIN_MEDIUM = 20

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
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const subscreen = await PuppeteerUtils.evalUiElement(page, "subscreen")

        expect(subscreen.width).toBe(screen.width - PADDING - PADDING)
    })

    test("Between header and footer", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "between-header-and-footer")
        const bodyContent = await PuppeteerUtils.evalElement(page, "body-content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const content = await PuppeteerUtils.evalUiElement(page, "content")

        console.log(bodyContent)
        console.log(content)
        expect(bodyContent.height).toBe(content.height)
        expect(screen.height).toBe(content.height)
    })
})
