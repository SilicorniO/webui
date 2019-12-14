const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"
import TestUtils from "../TestUtils"

const TIMEOUT = 5000
const ANIMATION_TIME = 300
const SQUARE_SIZE = 200
const MARGIN = 100

describe("Animation", () => {
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

    test("Animate width", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "animate-width")

        // check position
        let element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        let element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element1.left).toBe(0)
        expect(element1.width).toBe(SQUARE_SIZE)
        expect(element2.left).toBe(element1.left + element1.width + MARGIN)
        expect(element2.width).toBe(SQUARE_SIZE)

        await TestUtils.delay(ANIMATION_TIME)
        element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element1.left).toBe(0)
        expect(element1.width).toBe(300)
        expect(element2.left).toBe(element1.left + element1.width + 200)
        expect(element2.width).toBe(50)
    })

    test("Animate visibility", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "animate-visibility")

        // check position
        let element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        let element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element1.left).toBe(0)
        expect(element1.width).toBe(SQUARE_SIZE)
        expect(element2.left).toBe(element1.left + element1.width + MARGIN)
        expect(element2.width).toBe(SQUARE_SIZE)

        await TestUtils.delay(ANIMATION_TIME)
        element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element1.opacity).toBe("0")
        expect(element2.left).toBe(MARGIN)
        expect(element2.width).toBe(SQUARE_SIZE)
    })
})
