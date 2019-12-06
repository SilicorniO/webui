const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000

describe("Scrolls", () => {
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

    test("Scroll vertical", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "scroll-vertical")
        const content = await PuppeteerUtils.evalElement(page, "content")
        const lastElement = await PuppeteerUtils.evalElement(page, "lastElement")

        expect(lastElement.top).toBeGreaterThan(content.height)
        expect(content.overflowY).toBe("auto")
    })

    test("Scroll horizontal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "scroll-horizontal")
        const content = await PuppeteerUtils.evalElement(page, "content")
        const lastElement = await PuppeteerUtils.evalElement(page, "lastElement")

        expect(lastElement.left).toBeGreaterThan(content.width)
        expect(content.overflowX).toBe("auto")
    })

    test("Scroll vertical and horizontal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "scroll-vertical-and-horizontal")
        const content = await PuppeteerUtils.evalElement(page, "content")
        const lastElement = await PuppeteerUtils.evalElement(page, "lastElement")

        expect(lastElement.top).toBeGreaterThan(content.height)
        expect(content.overflowY).toBe("auto")
        expect(lastElement.left).toBeGreaterThan(content.width)
        expect(content.overflowX).toBe("auto")
    })
})
