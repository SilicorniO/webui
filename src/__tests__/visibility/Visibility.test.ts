const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const TIMEOUT = 5000

describe("Visibility", () => {
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

    test("Visible", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "visible")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")

        expect(element1.opacity).toBe("1")
        expect(element2.left).toBe(element1.left + element1.width)
    })

    test("Visible javascript", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "visible-js")
        await page.waitForSelector("#element1", { visible: true })
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")

        expect(element1.opacity).toBe("1")
        expect(element2.left).toBe(element1.left + element1.width)
    })

    test("Invisible", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "invisible")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")

        expect(element1.opacity).toBe("0")
        expect(element2.left).toBe(element1.left + element1.width)
    })

    test("Invisible parent", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "invisible-parent")
        const parent = await PuppeteerUtils.evalUiElement(page, "parent")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(parent.opacity).toBe("0")
        expect(element.top).toBe(parent.top + parent.height)
    })

    test("Invisible javascript", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "invisible-js")
        await page.waitForSelector("#element1", { visible: false })
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")

        expect(element1.opacity).toBe("1")
        expect(element2.left).toBe(element1.left + element1.width)
    })

    test("Gone to visible", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "gone-to-visible")
        await page.waitForSelector("#element", { visible: true })
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.width).not.toBe(0)
    })

    test("Gone", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "gone")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")

        expect(element1.opacity).toBe("0")
        expect(element2.left).toBe(0)
    })

    test("Gone parent", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "gone-parent")
        const parent = await PuppeteerUtils.evalUiElement(page, "parent")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(parent.opacity).toBe("0")
        expect(element.top).toBe(0)
    })

    test("Gone javascript", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "gone-js")
        await page.waitForSelector("#element1", { visible: false })
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")

        expect(element1.opacity).toBe("1")
        expect(element2.left).toBe(element1.left + element1.width)
    })

    test("Opacity disabled", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "opacity-disabled")
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.transition).toBe("")
    })

    test("Opacity enabled", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "opacity-enabled")

        // initial opacity
        const element = await PuppeteerUtils.evalUiElement(page, "element")

        expect(element.transition.length).toBeGreaterThan(0)
    })

    test("Opacity class", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "opacity-class")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")

        expect(element1.opacity).toBe("0.2")
    })

    test("Opacity style", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "opacity-style")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")

        expect(element1.opacity).toBe("0.2")
    })
})
