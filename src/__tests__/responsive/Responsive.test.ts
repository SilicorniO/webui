const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const TIMEOUT = 5000
const WINDOW_WIDTH = 200
const WINDOW_HEIGHT = 200
const MOBILE_WIDTH_END = 450
const TABLET_WIDTH_END = 700
const HEIGHT = 800

// paddings
const MOBILE_PADDING = 20
const TABLET_PADDING = 50
const DESKTOP_PADDING = 100

describe("Responsive", () => {
    let browser: any
    let page: any

    beforeAll(async () => {
        browser = await puppeteer.launch({
            ignoreHTTPSErrors: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--ignore-certificate-errors",
                `--window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}`,
            ],
        })
        page = await browser.newPage()
    }, TIMEOUT)

    afterAll(async (done: () => void) => {
        await page.close()
        await browser.close()
        done()
    })

    test("Mobile", async () => {
        await page.setViewport({ width: MOBILE_WIDTH_END - 1, height: HEIGHT })
        await PuppeteerUtils.loadPage(page, __dirname, "mobile")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.left).toBe(0)
    })

    test("Mobile dimens", async () => {
        await page.setViewport({ width: MOBILE_WIDTH_END - 1, height: HEIGHT })
        await PuppeteerUtils.loadPage(page, __dirname, "mobile-dimens")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(content.width).toBe(element.width + MOBILE_PADDING * 2)
    })

    test("Tablet", async () => {
        await page.setViewport({ width: TABLET_WIDTH_END - 1, height: HEIGHT })
        await PuppeteerUtils.loadPage(page, __dirname, "tablet")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.left).toBe((screen.width - element.width) / 2)
    })

    test("Tablet dimens", async () => {
        await page.setViewport({ width: TABLET_WIDTH_END - 1, height: HEIGHT })
        await PuppeteerUtils.loadPage(page, __dirname, "tablet-dimens")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(content.width).toBe(element.width + TABLET_PADDING * 2)
    })

    test("Desktop", async () => {
        await page.setViewport({ width: TABLET_WIDTH_END + 1, height: HEIGHT })
        await PuppeteerUtils.loadPage(page, __dirname, "desktop")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.left).toBe(screen.width - element.width)
    })

    test("Desktop dimens", async () => {
        await page.setViewport({ width: TABLET_WIDTH_END + 1, height: HEIGHT })
        await PuppeteerUtils.loadPage(page, __dirname, "desktop-dimens")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(content.width).toBe(element.width + DESKTOP_PADDING * 2)
    })
})
