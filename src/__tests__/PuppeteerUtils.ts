export interface UiDataElement {
    top: number
    left: number
    sTop: string
    sLeft: string
    width: number
    height: number
    overflowX: string
    overflowY: string
    opacity: string
    transition: string
}

export interface DataElement {
    width: number
    height: number
}

export default class PuppeteerUtils {
    public static async loadPage(page: any, folder: string, testName: string) {
        await page.goto("file://" + folder + "/html/" + testName + ".html", {
            waitUntil: "domcontentloaded",
        })
    }

    public static async evalUiElement(page: any, elementId: string): Promise<UiDataElement> {
        await page.waitFor("#" + elementId)
        return await page.evaluate((eId: string) => {
            // get element
            const element = document.getElementById(eId)
            if (element == null) {
                return "Element not exists!"
            }

            // evaluate right position
            return {
                sTop: element.style.top,
                sLeft: element.style.left,
                top: parseFloat(element.style.top),
                left: parseFloat(element.style.left),
                width: element.offsetWidth,
                height: element.offsetHeight,
                overflowX: element.style.overflowX,
                overflowY: element.style.overflowY,
                opacity: element.style.opacity,
                transition: element.style.transition,
            }
        }, elementId)
    }

    public static async evalElement(page: any, elementId: string): Promise<DataElement> {
        await page.waitFor("#" + elementId)
        return await page.evaluate((eId: string) => {
            // get element
            const element = document.getElementById(eId)
            if (element == null) {
                return "Element not exists!"
            }

            // evaluate right position
            return {
                width: element.offsetWidth,
                height: element.offsetHeight,
            }
        }, elementId)
    }
}
