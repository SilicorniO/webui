const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"

const timeout = 5000

describe("Dom", () => {
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

    test("Doctype", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "doctype")
        const layer1 = await PuppeteerUtils.evalUiElement(page, "layer1")

        expect(layer1.width).not.toBe(0)
        expect(layer1.height).not.toBe(0)
    })

    test("Add element", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "add-element")

        // add one element
        await page.click("#addElement")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        expect(element1.top).toBe(0)
        expect(element1.left).toBe(0)

        // add second element
        await page.click("#addElement")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element2.top).toBe(0)
        expect(element2.left).toBe(0)
    })

    test("Add element UI", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "add-element-ui")

        // add one element
        await page.click("#addElement")
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        expect(element1.top).toBe(0)
        expect(element1.left).toBe(0)

        // add second element
        await page.click("#addElement")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element2.top).toBe(element1.top + element1.height)
        expect(element2.left).toBe(0)
    })
})
