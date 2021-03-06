const puppeteer = require("puppeteer")
import PuppeteerUtils from "../PuppeteerUtils"
import TestUtils from "../TestUtils"

const TIMEOUT = 10000
const REDRAW_TIME = 30
const MARGIN_MEDIUM = 20

describe("Dom", () => {
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
        await TestUtils.delay(REDRAW_TIME)
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        expect(element1.top).toBe(0)
        expect(element1.left).toBe(0)

        // add second element
        await page.click("#addElement")
        await TestUtils.delay(REDRAW_TIME)
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element2.top).toBe(0)
        expect(element2.left).toBe(0)
    })

    test("Add element UI", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "add-element-ui")

        // add one element
        await page.click("#addElement")
        await TestUtils.delay(REDRAW_TIME)
        const element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        expect(element1.top).toBe(0)
        expect(element1.left).toBe(MARGIN_MEDIUM)

        // add second element
        await page.click("#addElement")
        await TestUtils.delay(REDRAW_TIME)
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element2.top).toBe(element1.top + element1.height)
        expect(element2.left).toBe(MARGIN_MEDIUM)
    })

    test("Add element UI nested", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "add-element-ui-nested")

        // add one element
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const text = await PuppeteerUtils.evalUiElement(page, "text")
        expect(element.top).toBe(0)
        expect(element.left).toBe(0)
        expect(element.width).toBe(200)
        expect(element.height).toBe(200)
        expect(text.top).toBe(0)
        expect(text.left).toBe(0)
    })

    test("Add element UI nested no parent", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "add-element-ui-nested-no-parent")

        // add one element
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element2.width).toBe(50)
        expect(element2.height).toBe(50)
    })

    test("Add change element content", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "add-change-element-content")

        // click events
        await page.click("#addContent")
        await page.click("#changeContent")

        // get elements
        const content = await PuppeteerUtils.evalUiElement(page, "content")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        const text = await PuppeteerUtils.evalUiElement(page, "text")
        const center = await PuppeteerUtils.evalUiElement(page, "center")
        const textCenter = await PuppeteerUtils.evalUiElement(page, "textCenter")

        expect(element.left).toBe((content.width - element.width) / 2)
        expect(text.left).toBe((element.width - text.width) / 2)
        expect(text.top).toBe((element.height - text.height) / 2)
        expect(center.left).toBe((content.width - center.width) / 2)
        expect(textCenter.left).toBe((center.width - textCenter.width) / 2)
        expect(textCenter.top).toBe((center.height - textCenter.height) / 2)
    })

    test("Remove element", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "remove-element")

        // add one element
        await page.click("#removeElement")
        const container = await PuppeteerUtils.evalUiElement(page, "container")
        const element2 = await PuppeteerUtils.evalElement(page, "element2")
        expect(container.width).toBe(element2.width)
    })

    test("Remove element UI", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "remove-element-ui")

        // add one element
        await page.click("#removeElement")
        await TestUtils.delay(REDRAW_TIME)
        const container = await PuppeteerUtils.evalUiElement(page, "container")
        const element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(container.width).toBe(element2.width)
        expect(container.height).toBe(element2.height)
    })

    test("Change element UI", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "change-element-ui")

        // check position
        let element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        let element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element2.top).toBe(element1.top + element1.height)
        expect(element2.left).toBe(element1.left)

        // add one element
        await page.click("#changeElement")
        await TestUtils.delay(REDRAW_TIME)
        element1 = await PuppeteerUtils.evalUiElement(page, "element1")
        element2 = await PuppeteerUtils.evalUiElement(page, "element2")
        expect(element2.top).toBe(element1.top)
        expect(element2.left).toBe(element1.left + element1.width)
    })

    test("Change element content", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "change-element-content")

        // check position
        let element = await PuppeteerUtils.evalUiElement(page, "element")
        const elementWidth = element.width

        // add one element
        await page.click("#changeContent")
        element = await PuppeteerUtils.evalUiElement(page, "element")
        expect(element.width).toBeGreaterThan(elementWidth)
    })

    test("Change element content add", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "change-element-content-add")

        // check position
        let container = await PuppeteerUtils.evalUiElement(page, "container")
        const containerWidth = container.width

        // add one element
        await page.click("#addContent")
        container = await PuppeteerUtils.evalUiElement(page, "container")
        expect(container.width).toBeGreaterThan(containerWidth)
    })

    test("Change element content remove", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "change-element-content-remove")

        // check position
        let container = await PuppeteerUtils.evalUiElement(page, "container")
        const containerWidth = container.width

        // add one element
        await page.click("#removeContent")
        container = await PuppeteerUtils.evalUiElement(page, "container")
        expect(container.width).toBeLessThan(containerWidth)
    })

    test("Change element content sub", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "change-element-content-sub")

        // check position
        let screen = await PuppeteerUtils.evalUiElement(page, "screen")
        const screenWidth = screen.width
        const screenHeight = screen.height

        // add one element
        await page.click("#changeContent")
        screen = await PuppeteerUtils.evalUiElement(page, "screen")
        expect(screen.width).toBeGreaterThan(screenWidth)
        expect(screen.height).toBe(screenHeight)
    })

    test("Change element ui content", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "change-element-ui-content")

        // check position
        let text = await PuppeteerUtils.evalUiElement(page, "text")
        const textWidth = text.width
        const textHeight = text.height

        // add one element
        await page.click("#changeElement")
        const element = await PuppeteerUtils.evalUiElement(page, "element")
        text = await PuppeteerUtils.evalUiElement(page, "text")
        expect(element.left).toBe(0)
        expect(element.top).toBe(0)
        expect(text.width).toBeGreaterThan(textWidth)
        expect(text.height).toBe(textHeight)
    })

    test("Change element subscreen", async () => {
        await PuppeteerUtils.loadPage(page, __dirname, "change-element-subscreen")

        // check position
        let element = await PuppeteerUtils.evalUiElement(page, "element")
        const elementWidth = element.width
        const elementHeight = element.height

        // add one element
        await page.click("#changeContent")
        element = await PuppeteerUtils.evalUiElement(page, "element")
        expect(element.width).toBeGreaterThan(elementWidth)
        expect(element.height).toBe(elementHeight)
    })
})
