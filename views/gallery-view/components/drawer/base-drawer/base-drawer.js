import { isPortraitMode } from "../../../../../js/utils.js";

/** The base drawer. */
export default class BaseDrawer extends HTMLElement {
    constructor() {
        super();
        this.startYValue;
        this.isHandleGrabbed = false;
        this.isVisible;
    }

    connectedCallback() { 
        // TODO: test (not sure if touchend is ok)
        setTimeout(() => {
            this.querySelector(".drawer-handle-container")?.addEventListener("touchstart", this.onStartHandleDrag, false);
            this.querySelector(".drawer-handle-container")?.addEventListener("touchend", this.onEndHandleDrag, false);
        }, 50);
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
        if (isHandleGrabbed) {
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