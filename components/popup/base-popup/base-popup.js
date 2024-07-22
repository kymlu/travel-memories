/// IMPORTS
import { addRemoveNoDisplay, addRemoveTransparent, addRemoveClass } from '../../../js/utils.js'
import { DEFAULT_TIMEOUT } from '../../../js/constants.js';

/**
 * The Base Popup object.
 */
export default class BasePopup extends HTMLElement {
    constructor() {
        super();
        /** ```True``` if the popup has been opened before. @type boolean */
        this.previouslyOpened = false;
    }

    /** Sets up the popup. */
    setupPopup() {
        this.querySelector(".popup").addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    /** Opens the popup. */
    openPopup() {
        let popupOverlay = this.querySelector(".overlay");
        let popupContent = this.querySelector(".popup-content");
        let popup = this.querySelector(".popup");
        let popupBg = this.querySelector(".popup-bg");
        popupOverlay.style.visibility = "visible";

        addRemoveTransparent([popup, popupBg], false);
        // CHECK: probably don't need? -> document.getElementById("info-popup").style.visibility = "visible";
        addRemoveClass([popup], "popup-width", true);
        setTimeout(() => {
            addRemoveNoDisplay([popupContent], false);
            addRemoveTransparent([popupContent], false);
            addRemoveClass([popup], "popup-height", true);
            this.querySelector(".close-btn").addEventListener("click", () => { this.closePopup(false); });
            this.querySelector(".popup-bg").addEventListener("click", () => { this.closePopup(true); });
        }, DEFAULT_TIMEOUT);

        if (!this.previouslyOpened) {
            this.setupPopup();
            this.previouslyOpened = true;
        }
    }

    /** 
     * Closes the popup.
     * @param {boolean} forceClose - ```True``` if the user has forcefully closed 
     * the popup through the esc key or clicking the background.
     */
    closePopup(forceClose) {
        let popupOverlay = this.querySelector(".overlay");
        let popupContent = this.querySelector(".popup-content");
        let popup = this.querySelector(".popup");
        let popupBg = this.querySelector(".popup-bg");

        // if forced close, everything should happen at once, hence timeout length of 0
        let timeout = forceClose ? 0 : DEFAULT_TIMEOUT;

        // hide content
        addRemoveTransparent([popupContent], true);
        setTimeout(() => {
            // height transition
            addRemoveClass([popup], "popup-height", false);
            setTimeout(() => {
                // remove content and width transition
                addRemoveNoDisplay([popupContent], true);
                addRemoveClass([popup], "popup-width", false);
                setTimeout(() => {
                    // hide popup and bg
                    addRemoveTransparent([popup, popupBg], true);
                    setTimeout(() => {
                        popupOverlay.style.visibility = "hidden";
                    }, timeout);
                }, timeout);
            }, timeout);
        }, timeout);
    }
}