import BaseElement from "../../../../../js/base-element.js";
import { fetchStyle, isPortraitMode } from "../../../../../js/utils.js";

let baseDrawerStyle = new CSSStyleSheet();
fetchStyle("components/base-drawer/base-drawer.css", baseDrawerStyle);

/** The base drawer. */
export default class BaseDrawer extends BaseElement {
    constructor() {
        super();
        this.startYValue;
        this.isHandleGrabbed = false;
        this.isVisible;
        this.shadowRoot.adoptedStyleSheets.push(baseDrawerStyle);
    }

    connectedCallback() {
        this.queryByClassName("drawer-handle-container")?.addEventListener("touchstart", this.onStartHandleDrag.bind(this), false);
        this.queryByClassName("drawer-handle-container")?.addEventListener("touchend", this.onEndHandleDrag.bind(this), false);
    }

    /**
     * To run when user starts dragging handle.
     * @param {TouchEvent} e - the touch event.
     */
    onStartHandleDrag(e) {
        if (isPortraitMode()) {
            this.isHandleGrabbed = true;
            this.startYValue = e.touches[0].clientY;
        }
    }

    /** 
     * To run when user stops dragging handle.
     * @link https://stackoverflow.com/questions/53192433/how-to-detect-swipe-in-javascript
     * @param {TouchEvent} e - the touch event.
     */
    onEndHandleDrag(e) {
        if (this.isHandleGrabbed) {
            let endYValue = e.changedTouches[0].clientY;
            if (endYValue > this.startYValue) {
                this.dragDownFunction();
            } else if (endYValue < this.startYValue) {
                this.dragUpFunction();
            }

            this.startYValue = null;
            this.isHandleGrabbed = false;
        }
    }

    dragUpFunction() { }
    dragDownFunction() { }
}