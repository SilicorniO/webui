const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000

describe("List", () => {
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

    test("List vertical", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "list-vertical")
        const item1 = await PuppeteerUtils.evalUiElement(page, "item1")
        const item2 = await PuppeteerUtils.evalUiElement(page, "item2")
        const item3 = await PuppeteerUtils.evalUiElement(page, "item3")

        expect(item1.top).toBe(0)
        expect(item1.left).toBe(0)
        expect(item2.top).toBe(item1.top + item1.height)
        expect(item2.left).toBe(0)
        expect(item3.top).toBe(item2.top + item2.height)
        expect(item3.left).toBe(0)
    })

    test("List vertical center horizontal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "list-vertical-center-horizontal")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const item1 = await PuppeteerUtils.evalUiElement(page, "item1")
        const item2 = await PuppeteerUtils.evalUiElement(page, "item2")
        const item3 = await PuppeteerUtils.evalUiElement(page, "item3")

        expect(item1.left).toBe(0)
        expect(item1.width).toBeLessThan(screen.width)
        expect(item2.left).toBe(0)
        expect(item2.width).toBe(screen.width)
        expect(item3.left).toBe((screen.width - item3.width) / 2)
        expect(item3.width).toBeLessThan(screen.width)
    })

    test("List horizontal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "list-horizontal")
        const item1 = await PuppeteerUtils.evalUiElement(page, "item1")
        const item2 = await PuppeteerUtils.evalUiElement(page, "item2")
        const item3 = await PuppeteerUtils.evalUiElement(page, "item3")

        expect(item1.top).toBe(0)
        expect(item1.left).toBe(0)
        expect(item2.top).toBe(0)
        expect(item2.left).toBe(item1.left + item1.width)
        expect(item3.top).toBe(0)
        expect(item3.left).toBe(item2.left + item2.width)
    })

    test("List horizontal center vertical", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "list-horizontal-center-vertical")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const item1 = await PuppeteerUtils.evalUiElement(page, "item1")
        const item2 = await PuppeteerUtils.evalUiElement(page, "item2")
        const item3 = await PuppeteerUtils.evalUiElement(page, "item3")

        expect(item1.top).toBe(0)
        expect(item1.height).toBeLessThan(screen.height)
        expect(item2.top).toBe(0)
        expect(item2.height).toBe(screen.height)
        expect(item3.top).toBe((screen.height - item3.height) / 2)
        expect(item3.height).toBeLessThan(screen.height)
    })
})
