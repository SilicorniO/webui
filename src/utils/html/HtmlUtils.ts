export default class HtmlUtils {
    /**
     * Get scrollbar width.
     * FROM: http://www.alexandre-gomes.com/?p=115
     * @return Integer scrollbar width
     **/
    public static getScrollWidth() {
        const inner = document.createElement("p")
        inner.style.width = "100%"
        inner.style.height = "200px"

        const outer = document.createElement("div")
        outer.style.position = "absolute"
        outer.style.top = "0px"
        outer.style.left = "0px"
        outer.style.visibility = "hidden"
        outer.style.width = "200px"
        outer.style.height = "150px"
        outer.style.overflow = "hidden"
        outer.appendChild(inner)

        document.body.appendChild(outer)
        const w1 = inner.offsetWidth
        outer.style.overflow = "scroll"
        let w2 = inner.offsetWidth
        if (w1 == w2) w2 = outer.clientWidth

        document.body.removeChild(outer)

        return w1 - w2
    }

    public static getPreviousElementWithAttribute(attribute: string, element: HTMLElement): HTMLElement | null {
        // check element has attribute
        if (element.hasAttribute(attribute)) {
            return element
        }

        // check it has parent
        const parentElement = element.parentElement
        if (parentElement == null) {
            return null
        }

        // continue searching
        return HtmlUtils.getPreviousElementWithAttribute(attribute, parentElement)
    }
}
