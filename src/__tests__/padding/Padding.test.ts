const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000
const PADDING = 20

describe("Padding", () => {
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

    test("Padding all", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "padding-all")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.width).toBe(50 + content.width + 50)
        expect(element.height).toBe(50 + content.height + 50)
    })

    test("Padding all sized", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "padding-all-sized")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(content.width).toBe(10 + element.width + 10)
        expect(content.height).toBe(10 + element.height + 10)
    })

    test("Padding all fullsize", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "padding-all-fullsize")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.width).toBe(content.width - PADDING - PADDING)
        expect(element.height).toBe(content.height - PADDING - PADDING)
    })

    test("Padding left", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "padding-left")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")

        expect(element.width).toBe(PADDING + content.width)
        expect(element.height).toBe(content.height)
    })

    test("Padding right", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "padding-right")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")

        expect(element.width).toBe(content.width + PADDING)
        expect(element.height).toBe(content.height)
    })

    test("Padding top", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "padding-top")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")

        expect(element.width).toBe(content.width)
        expect(element.height).toBe(PADDING + content.height)
    })

    test("Padding bottom", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "padding-bottom")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")

        expect(element.width).toBe(content.width)
        expect(element.height).toBe(content.height + PADDING)
    })

    test("Padding size content", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "padding-size-content")

        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(content.height).toBe(element.height)
        expect(content.top).toBe(10)
        expect(content.left).toBe(10)
        expect(content.width).toBe(screen.width - 2 * 10)
    })
})
