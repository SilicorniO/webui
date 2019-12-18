import UIViewAttrs from "../../../model/UIViewAttrs"
import { UI_SIZE, UI_VIEW_ID } from "../../../model/UIAttr"
import UIAttrReader from "../../../core/dom/UIAttrReader"
import { UI_VISIBILITY } from "../../../model/UIVisibility"

describe("UiAttrReader", () => {
    test("generateUiAttr - size screen", async () => {
        // generate attributes
        const viewAttrs = new UIViewAttrs()
        viewAttrs.x.size = UI_SIZE.SCREEN
        viewAttrs.x.sizeValue = 200
        viewAttrs.y.size = UI_SIZE.SCREEN
        viewAttrs.y.sizeValue = 300

        // convert to text
        const uiAttr = UIAttrReader.generateUiAttr(viewAttrs)

        // check text
        expect(uiAttr).toBe("w:200;h:300")
    })

    test("generateUiAttr - size percent", async () => {
        // generate attributes
        const viewAttrs = new UIViewAttrs()
        viewAttrs.x.size = UI_SIZE.PERCENTAGE
        viewAttrs.x.sizeValue = 50
        viewAttrs.y.size = UI_SIZE.PERCENTAGE
        viewAttrs.y.sizeValue = 30
        viewAttrs.y.percentPos = 1

        // convert to text
        const uiAttr = UIAttrReader.generateUiAttr(viewAttrs)

        // check text
        expect(uiAttr).toBe("w:50%;h:30%1")
    })

    test("generateUiAttr - references", async () => {
        // generate attributes
        const viewAttrs = new UIViewAttrs()

        viewAttrs.x.startStart = "_l"
        viewAttrs.x.startEnd = "_ar"
        viewAttrs.x.endEnd = "_r"
        viewAttrs.x.endStart = "_al"

        viewAttrs.y.startStart = "_t"
        viewAttrs.y.startEnd = "_ab"
        viewAttrs.y.endEnd = "_b"
        viewAttrs.y.endStart = "_at"

        // convert to text
        const uiAttr = UIAttrReader.generateUiAttr(viewAttrs)

        // check text
        expect(uiAttr).toBe("l:_l;ar:_ar;r:_r;al:_al;t:_t;ab:_ab;b:_b;at:_at")
    })

    test("generateUiAttr - margin", async () => {
        // generate attributes
        const viewAttrs = new UIViewAttrs()
        viewAttrs.x.marginStart = "10"
        viewAttrs.x.marginEnd = "mm"
        viewAttrs.y.marginStart = "20"
        viewAttrs.y.marginEnd = "mh"

        // convert to text
        const uiAttr = UIAttrReader.generateUiAttr(viewAttrs)

        // check text
        expect(uiAttr).toBe("ml:10;mr:mm;mt:20;mb:mh")
    })

    test("generateUiAttr - padding", async () => {
        // generate attributes
        const viewAttrs = new UIViewAttrs()
        viewAttrs.x.paddingStart = "10"
        viewAttrs.x.paddingEnd = "mm"
        viewAttrs.y.paddingStart = "20"
        viewAttrs.y.paddingEnd = "mh"

        // convert to text
        const uiAttr = UIAttrReader.generateUiAttr(viewAttrs)

        // check text
        expect(uiAttr).toBe("pl:10;pr:mm;pt:20;pb:mh")
    })

    test("generateUiAttr - center", async () => {
        // generate attributes
        const viewAttrs = new UIViewAttrs()
        viewAttrs.x.center = UI_VIEW_ID.PARENT
        viewAttrs.y.center = UI_VIEW_ID.PARENT

        // convert to text
        const uiAttr = UIAttrReader.generateUiAttr(viewAttrs)

        // check text
        expect(uiAttr).toBe("ch:p;cv:p")
    })

    test("generateUiAttr - scroll", async () => {
        // generate attributes
        const viewAttrs = new UIViewAttrs()
        viewAttrs.x.scroll = true
        viewAttrs.y.scroll = true

        // convert to text
        const uiAttr = UIAttrReader.generateUiAttr(viewAttrs)

        // check text
        expect(uiAttr).toBe("sh;sv")
    })

    test("generateUiAttr - visibility gone", async () => {
        // generate attributes
        const viewAttrs = new UIViewAttrs()
        viewAttrs.visibility = UI_VISIBILITY.GONE

        // convert to text
        const uiAttr = UIAttrReader.generateUiAttr(viewAttrs)

        // check text
        expect(uiAttr).toBe("v:g")
    })

    test("generateUiAttr - visibility gone", async () => {
        // generate attributes
        const viewAttrs = new UIViewAttrs()
        viewAttrs.visibility = UI_VISIBILITY.INVISIBLE

        // convert to text
        const uiAttr = UIAttrReader.generateUiAttr(viewAttrs)

        // check text
        expect(uiAttr).toBe("v:i")
    })
})
