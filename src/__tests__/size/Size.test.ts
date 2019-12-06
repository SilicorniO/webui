const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const TIMEOUT = 5000
const SIZE = 50

describe("Size", () => {
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

    test("Width", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "width")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.width).toBe(SIZE)
    })

    test("Height", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "height")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.height).toBe(SIZE)
    })

    test("Content horizontal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "content-horizontal")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(screen.width).toBe(element.width)
    })

    test("Content vertical", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "content-vertical")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(screen.height).toBe(element.height)
    })

    test("Percent horizontal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "percent-horizontal")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")

        expect(element1.left).toBe(0)
        expect(element1.width).toBe(screen.width / 2)
        expect(element2.left).toBe(screen.width / 2)
        expect(element2.width).toBe(screen.width / 2)
    })

    test("Percent vertical", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "percent-vertical")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")

        expect(element1.top).toBe(0)
        expect(element1.height).toBe(screen.height / 2)
        expect(element2.top).toBe(screen.height / 2)
        expect(element2.height).toBe(screen.height / 2)
    })
})
