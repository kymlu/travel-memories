/// IMPORTS
import { addRemoveClass, addRemoveNoDisplay, addRemoveTransparent, setBilingualAttribute } from '../../../js/utils.js'
import { ATTRIBUTES, DEFAULT_TIMEOUT } from '../../../js/constants.js';

/**
 * The Base Popup object.
 */
export default class BasePopup extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;

        /** ```True``` if the popup has been opened before. @type boolean */
        this.previouslyOpened = false;
    }

    /** Sets up the popup. */
    connectedCallback() {
        if (!this.previouslyOpened) {
            setTimeout(() => {
                setBilingualAttribute([[this.querySelector(".close-btn"), "Close", "閉じる"]], ATTRIBUTES.TITLE);
                this.querySelector(".popup").addEventListener("click", (event) => {
                    event.stopPropagation();
                });
                addRemoveNoDisplay([this], true);
            }, 50);
        }
    }

    isPopupOpen() {
        return this.isOpen;
    }

    /** Opens the popup. */
    open() {
        let popupContent = this.querySelector(".popup-content");
        let popup = this.querySelector(".popup");
        let popupBg = this.querySelector(".popup-bg");
        addRemoveNoDisplay([this], false);
        //popupOverlay.classList.remove("visibility-hidden");

        setTimeout(() => {
            addRemoveTransparent([popup, popupBg], false);
            addRemoveClass([popup], "popup-width", true);
            setTimeout(() => {
                addRemoveNoDisplay([popupContent], false);
                addRemoveTransparent([popupContent], false);
                addRemoveClass([popup], "popup-height", true);
                this.querySelector(".close-btn").addEventListener("click", () => { this.close(false); });
                this.querySelector(".popup-bg").addEventListener("click", () => { this.close(true); });
            }, DEFAULT_TIMEOUT);
        }, 50);

        if (!this.previouslyOpened) {
            this.previouslyOpened = true;
        }

        this.isOpen = true;
        document.addEventListener("keydown", this.handleKeydown);
    }

    handleKeydown(event) {
        if (event.key == "Escape") {
            this.close(true);
        }
    }

    /** 
     * Closes the popup.
     * @param {boolean} forceClose - ```True``` if the user has forcefully closed 
     * the popup through the esc key or clicking the background.
     */
    close(forceClose) {
        document.removeEventListener("keydown", this.handleKeydown);

        this.isOpen = false;
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
                        addRemoveNoDisplay([this], true);
                        //popupOverlay.classList.add("visibility-hidden");
                    }, timeout);
                }, timeout);
            }, timeout);
        }, timeout);
    }
}