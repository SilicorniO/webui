const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000

describe("Position", () => {
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

    test("Top Left", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "top-left")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(0)
        expect(element.left).toBe(0)
    })

    test("Bottom right", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "bottom-right")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(screen.height - element.height)
        expect(element.left).toBe(screen.width - element.width)
    })

    test("Center", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "center")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2)
        expect(element.left).toBe((screen.width - element.width) / 2)
    })

    test("Top center", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "top-center")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(0)
        expect(element.left).toBe((screen.width - element.width) / 2)
    })

    test("Bottom center", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "bottom-center")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(screen.height - element.height)
        expect(element.left).toBe((screen.width - element.width) / 2)
    })

    test("Left center", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "left-center")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2)
        expect(element.left).toBe(0)
    })

    test("Right center", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "right-center")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2)
        expect(element.left).toBe(screen.width - element.width)
    })

    test("At left", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "at-left")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2)
        expect(element.left).toBe(content.left - element.width)
    })

    test("At right", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "at-right")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2)
        expect(element.left).toBe(content.left + content.width)
    })

    test("At top", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "at-top")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(content.top - element.height)
        expect(element.left).toBe((screen.width - element.width) / 2)
    })

    test("At bottom", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "at-bottom")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(content.top + content.height)
        expect(element.left).toBe((screen.width - element.width) / 2)
    })

    test("At left equal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "at-left-equal")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")

        expect(element.top).toBe(content.top)
        expect(element.height).toBe(content.height)
        expect(element.left).toBe(content.left - element.width)
    })

    test("At right equal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "at-right-equal")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(content.top)
        expect(element.height).toBe(content.height)
        expect(element.left).toBe(content.left + content.width)
    })

    test("At top equal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "at-top-equal")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(content.top - element.height)
        expect(element.left).toBe(content.left)
        expect(element.width).toBe(content.width)
    })

    test("At bottom equal", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "at-bottom-equal")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const screen = await PuppeteerUtils.evalUiElement(page, "screen")

        expect(element.top).toBe(content.top + content.height)
        expect(element.left).toBe(content.left)
        expect(element.width).toBe(content.width)
    })
})
