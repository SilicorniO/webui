const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000
const MARGIN = 20

describe("Margin", () => {
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

    test("Margin All", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "margin-all")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(MARGIN)
        expect(element.left).toBe(MARGIN)
        expect(element.width).toBe(screen.width - MARGIN - MARGIN)
        expect(element.height).toBe(screen.height - MARGIN - MARGIN)
    })

    test("Margin left", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "margin-left")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2)
        expect(element.left).toBe(content.left + content.width + MARGIN)
    })

    test("Margin right", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "margin-right")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2)
        expect(element.left).toBe(content.left - MARGIN - element.width)
    })

    test("Margin top", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "margin-top")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(content.top + content.height + MARGIN)
        expect(element.left).toBe((screen.width - element.width) / 2)
    })

    test("Margin bottom", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "margin-bottom")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(content.top - MARGIN - element.height)
        expect(element.left).toBe((screen.width - element.width) / 2)
    })
})
