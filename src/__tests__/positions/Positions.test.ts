const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000

describe("Positions", () => {
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
        await PuppeteerUtils.loadPage(page, "positions", "top-left")
        const element = await PuppeteerUtils.evalElement(page, "ele")
        const screen = await PuppeteerUtils.evalElement(page, "screen")

        expect(element.top).toBe(0 + "px")
        expect(element.left).toBe(0 + "px")
    })

    test("Bottom right", async () => {
        await PuppeteerUtils.loadPage(page, "positions", "bottom-right")
        const element = await PuppeteerUtils.evalElement(page, "ele")
        const screen = await PuppeteerUtils.evalElement(page, "screen")

        expect(element.top).toBe(screen.height - element.height + "px")
        expect(element.left).toBe(screen.width - element.width + "px")
    })

    test("Center", async () => {
        await PuppeteerUtils.loadPage(page, "positions", "center")
        const element = await PuppeteerUtils.evalElement(page, "ele")
        const screen = await PuppeteerUtils.evalElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2 + "px")
        expect(element.left).toBe((screen.width - element.width) / 2 + "px")
    })

    test("Top center", async () => {
        await PuppeteerUtils.loadPage(page, "positions", "top-center")
        const element = await PuppeteerUtils.evalElement(page, "ele")
        const screen = await PuppeteerUtils.evalElement(page, "screen")

        expect(element.top).toBe(0 + "px")
        expect(element.left).toBe((screen.width - element.width) / 2 + "px")
    })

    test("Bottom center", async () => {
        await PuppeteerUtils.loadPage(page, "positions", "bottom-center")
        const element = await PuppeteerUtils.evalElement(page, "ele")
        const screen = await PuppeteerUtils.evalElement(page, "screen")

        expect(element.top).toBe(screen.height - element.height + "px")
        expect(element.left).toBe((screen.width - element.width) / 2 + "px")
    })

    test("Left center", async () => {
        await PuppeteerUtils.loadPage(page, "positions", "left-center")
        const element = await PuppeteerUtils.evalElement(page, "ele")
        const screen = await PuppeteerUtils.evalElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2 + "px")
        expect(element.left).toBe(0 + "px")
    })

    test("Right center", async () => {
        await PuppeteerUtils.loadPage(page, "positions", "right-center")
        const element = await PuppeteerUtils.evalElement(page, "ele")
        const screen = await PuppeteerUtils.evalElement(page, "screen")

        expect(element.top).toBe((screen.height - element.height) / 2 + "px")
        expect(element.left).toBe(screen.width - element.width + "px")
    })

    test("At left", async () => {
        await PuppeteerUtils.loadPage(page, "positions", "at-left")
        const element = await PuppeteerUtils.evalElement(page, "ele")
        const screen = await PuppeteerUtils.evalElement(page, "screen")

        expect(element.top).toBe(0 + "px")
        expect(element.left).toBe((screen.width - element.width) / 2 + "px")
    })
})
