import WebUI from "../../WebUI"
import MutationObserver from "../../__mocks__/MutationObserver"
const puppeteer = require("puppeteer")
const fs = require("fs")

const timeout = 5000

describe("Positions", () => {
    let browser: any
    let page: any

    beforeAll(async () => {
        // ;(global as any).MutationObserver = MutationObserver
        // page = await global.browser.newPage()
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
        await page.goto("file:///Users/jsr/workspace/webui/webui_github/src/__tests__/positions/top-left.html", {
            waitUntil: "domcontentloaded",
        })
        await page.waitFor("#ele")
        const result = await page.evaluate(() => {
            // get element
            const element = document.getElementById("ele")
            if (element == null) {
                return "Element not exists!"
            }

            // get screen
            const screen = document.getElementById("screen")
            if (screen == null) {
                return "Screen not exists!"
            }

            // evaluate right position
            return {
                elementTop: element.style.top,
                elementLeft: element.style.left,
                elementWidth: element.offsetWidth,
                elementHeight: element.offsetHeight,
                screenWidth: screen.offsetWidth,
                screenHeight: screen.offsetHeight,
            }
        })
        console.log(result)
        expect(result.elementTop).toBe("0px")
        expect(result.elementLeft).toBe("0px")
    })

    test("Bottom right", async () => {
        await page.goto("file:///Users/jsr/workspace/webui/webui_github/src/__tests__/positions/bottom-right.html", {
            waitUntil: "domcontentloaded",
        })
        await page.waitFor("#ele")
        const result = await page.evaluate(() => {
            // get element
            const element = document.getElementById("ele")
            if (element == null) {
                return "Element not exists!"
            }

            // get screen
            const screen = document.getElementById("screen")
            if (screen == null) {
                return "Screen not exists!"
            }

            // evaluate right position
            return {
                elementTop: element.style.top,
                elementLeft: element.style.left,
                elementWidth: element.offsetWidth,
                elementHeight: element.offsetHeight,
                screenWidth: screen.offsetWidth,
                screenHeight: screen.offsetHeight,
            }
        })
        console.log(result)
        expect(result.elementTop).toBe(result.screenHeight - result.elementHeight + "px")
        expect(result.elementLeft).toBe(result.screenWidth - result.elementWidth + "px")
    })

    test("Center", async () => {
        await page.goto("file:///Users/jsr/workspace/webui/webui_github/src/__tests__/positions/center.html", {
            waitUntil: "domcontentloaded",
        })
        await page.waitFor("#ele")
        const result = await page.evaluate(() => {
            // get element
            const element = document.getElementById("ele")
            if (element == null) {
                return "Element not exists!"
            }

            // get screen
            const screen = document.getElementById("screen")
            if (screen == null) {
                return "Screen not exists!"
            }

            // evaluate right position
            return {
                elementTop: element.style.top,
                elementLeft: element.style.left,
                elementWidth: element.offsetWidth,
                elementHeight: element.offsetHeight,
                screenWidth: screen.offsetWidth,
                screenHeight: screen.offsetHeight,
            }
        })
        console.log(result)
        expect(result.elementTop).toBe((result.screenHeight - result.elementHeight) / 2 + "px")
        expect(result.elementLeft).toBe((result.screenWidth - result.elementWidth) / 2 + "px")
    })
})
