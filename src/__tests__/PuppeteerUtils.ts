export interface DataElement {
    top: string
    left: string
    width: number
    height: number
}

export default class PuppeteerUtils {
    public static async loadPage(page: any, folder: string, testName: string) {
        await page.goto(
            "file:///Users/jsr/workspace/webui/webui_github/src/__tests__/" + folder + "/html/" + testName + ".html",
            {
                waitUntil: "domcontentloaded",
            },
        )
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
                top: element.style.top,
                left: element.style.left,
                width: element.offsetWidth,
                height: element.offsetHeight,
            }
        }, elementId)
    }
}
