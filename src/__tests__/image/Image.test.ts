const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"
import TestUtils from "../TestUtils"

const TIMEOUT = 5000

describe("Image", () => {
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

    test("Image load", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "image-load")

        await TestUtils.delay(50)
        const image = await PuppeteerUtils.evalUiElement(page, "image")

        expect(image.width).toBe(200)
        expect(image.height).toBe(150)
    })

    test("Image padding", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "image-padding")

        await TestUtils.delay(50)
        const container = await PuppeteerUtils.evalUiElement(page, "container")

        expect(container.width).toBe(10 + 200 + 10)
        expect(container.height).toBe(10 + 150 + 10)
    })
})
