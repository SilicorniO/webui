import { UIViewStateChange } from "../../model/UIView"
import { ATTR } from "../dom/UIAttrReader"
import { AXIS } from "../../model/UIAxis"
import UIViewAttrs from "../../model/UIViewAttrs"
import { UI_VISIBILITY } from "../../model/UIVisibility"

export interface UIViewStateChangeAndAxis {
    stateChange: UIViewStateChange
    axis?: AXIS
}

export default class UIViewEventsUtils {
    public static convertAttrToStateChangeWithAxis(
        attr: ATTR,
        previousAttributes: UIViewAttrs,
        value?: string | number | boolean,
    ): UIViewStateChangeAndAxis[] {
        switch (attr) {
            case ATTR.WIDTH:
            case ATTR.FULL_WIDTH:
                return [{ stateChange: UIViewStateChange.SIZE, axis: AXIS.X }]
            case ATTR.HEIGHT:
            case ATTR.FULL_HEIGHT:
                return [{ stateChange: UIViewStateChange.SIZE, axis: AXIS.Y }]
            case ATTR.LEFT:
            case ATTR.AT_RIGHT:
            case ATTR.AT_RIGHT_EQUAL:
                return [{ stateChange: UIViewStateChange.START, axis: AXIS.X }]
            case ATTR.TOP:
            case ATTR.AT_BOTTOM:
            case ATTR.AT_BOTTOM_EQUAL:
                return [{ stateChange: UIViewStateChange.START, axis: AXIS.Y }]
            case ATTR.RIGHT:
            case ATTR.AT_LEFT:
            case ATTR.AT_LEFT_EQUAL:
                return [{ stateChange: UIViewStateChange.END, axis: AXIS.X }]
            case ATTR.BOTTOM:
            case ATTR.AT_TOP:
            case ATTR.AT_TOP_EQUAL:
                return [{ stateChange: UIViewStateChange.END, axis: AXIS.Y }]
            case ATTR.MARGIN_LEFT:
                return [{ stateChange: UIViewStateChange.MARGIN_START, axis: AXIS.X }]
            case ATTR.MARGIN_TOP:
                return [{ stateChange: UIViewStateChange.MARGIN_START, axis: AXIS.Y }]
            case ATTR.MARGIN_RIGHT:
                return [{ stateChange: UIViewStateChange.MARGIN_END, axis: AXIS.X }]
            case ATTR.MARGIN_BOTTOM:
                return [{ stateChange: UIViewStateChange.MARGIN_END, axis: AXIS.Y }]
            case ATTR.MARGIN:
                return [
                    { stateChange: UIViewStateChange.MARGIN_START, axis: AXIS.X },
                    { stateChange: UIViewStateChange.MARGIN_END, axis: AXIS.X },
                    { stateChange: UIViewStateChange.MARGIN_START, axis: AXIS.Y },
                    { stateChange: UIViewStateChange.MARGIN_END, axis: AXIS.Y },
                ]
            case ATTR.PADDING_LEFT:
                return [{ stateChange: UIViewStateChange.PADDING_START, axis: AXIS.X }]
            case ATTR.PADDING_TOP:
                return [{ stateChange: UIViewStateChange.PADDING_START, axis: AXIS.Y }]
            case ATTR.PADDING_RIGHT:
                return [{ stateChange: UIViewStateChange.PADDING_END, axis: AXIS.X }]
            case ATTR.PADDING_BOTTOM:
                return [{ stateChange: UIViewStateChange.PADDING_END, axis: AXIS.Y }]
            case ATTR.PADDING:
                return [
                    { stateChange: UIViewStateChange.PADDING_START, axis: AXIS.X },
                    { stateChange: UIViewStateChange.PADDING_END, axis: AXIS.X },
                    { stateChange: UIViewStateChange.PADDING_START, axis: AXIS.Y },
                    { stateChange: UIViewStateChange.PADDING_END, axis: AXIS.Y },
                ]
            case ATTR.CENTER_HORIZONTAL:
                return [{ stateChange: UIViewStateChange.CENTER, axis: AXIS.X }]
            case ATTR.CENTER_VERTICAL:
                return [{ stateChange: UIViewStateChange.CENTER, axis: AXIS.Y }]
            case ATTR.CENTER:
                return [
                    { stateChange: UIViewStateChange.CENTER, axis: AXIS.X },
                    { stateChange: UIViewStateChange.CENTER, axis: AXIS.Y },
                ]
            case ATTR.SCROLL_HORIZONTAL:
                return [{ stateChange: UIViewStateChange.SCROLL, axis: AXIS.X }]
            case ATTR.SCROLL_VERTICAL:
                return [{ stateChange: UIViewStateChange.SCROLL, axis: AXIS.Y }]
            case ATTR.VISIBILITY:
                if (previousAttributes.visibility == UI_VISIBILITY.GONE || value == UI_VISIBILITY.GONE) {
                    return [{ stateChange: UIViewStateChange.VISIBILITY_GONE }]
                } else {
                    return [{ stateChange: UIViewStateChange.VISIBILITY }]
                }
            default:
                return [{ stateChange: UIViewStateChange.NONE }]
        }
    }
}
