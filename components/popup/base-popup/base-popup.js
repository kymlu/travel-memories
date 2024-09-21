/// IMPORTS
import BaseElement from '../../../js/base-element.js';
import { ATTRIBUTES, DEFAULT_TIMEOUT } from '../../../js/constants.js';
import {
    toggleClass, toggleNoDisplay, toggleTransparent, fetchStyle, setBilingualProperty
} from '../../../js/utils.js'

let basePopupStyleSheet = new CSSStyleSheet();
fetchStyle("components/popup/base-popup/base-popup.css", basePopupStyleSheet);

/** * The Base Popup object. */
export default class BasePopup extends BaseElement {
    constructor() {
        super();
        this.isOpen = false;
        this.shadowRoot.adoptedStyleSheets.push(basePopupStyleSheet);

        /** ```True``` if the popup has been opened before. @type boolean */
        this.previouslyOpened = false;
    }

    /** Sets up the popup. */
    connectedCallback() {
        if (!this.previouslyOpened) {
            setBilingualProperty([[this.queryByClassName("close-btn"), "Close", "閉じる"]], ATTRIBUTES.TITLE);
            this.queryByClassName("popup").addEventListener("click", (event) => {
                event.stopPropagation();
            });
            toggleNoDisplay([this], true);
        }
    }

    isPopupOpen() {
        return this.isOpen;
    }

    /** Opens the popup. */
    open(openFunction) {
        let popupContent = this.queryByClassName("popup-content");
        let popup = this.queryByClassName("popup");
        let popupBg = this.queryByClassName("popup-bg");
        toggleNoDisplay([this], false);

        setTimeout(() => {
            toggleTransparent([popup, popupBg], false);
            toggleClass([popup], "popup-width", true);
            setTimeout(() => {
                toggleNoDisplay([popupContent], false);
                toggleTransparent([popupContent], false);
                toggleClass([popup], "popup-height", true);
                this.queryByClassName("close-btn").addEventListener("click", () => { this.close(false); });
                this.queryByClassName("popup-bg").addEventListener("click", () => { this.close(true); });
                if (openFunction) {
                    openFunction();
                }
            }, DEFAULT_TIMEOUT);
        }, 50);

        if (!this.previouslyOpened) {
            this.previouslyOpened = true;
        }

        this.isOpen = true;
        document.addEventListener("keydown", this.handleKeydown.bind(this));
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
        document.removeEventListener("keydown", this.handleKeydown.bind(this));

        this.isOpen = false;
        let popupContent = this.queryByClassName("popup-content");
        let popup = this.queryByClassName("popup");
        let popupBg = this.queryByClassName("popup-bg");

        // if forced close, everything should happen at once, hence timeout length of 0
        let timeout = forceClose ? 0 : DEFAULT_TIMEOUT;

        // hide content
        toggleTransparent([popupContent], true);
        setTimeout(() => {
            // height transition
            toggleClass([popup], "popup-height", false);
            setTimeout(() => {
                // remove content and width transition
                toggleNoDisplay([popupContent], true);
                toggleClass([popup], "popup-width", false);
                setTimeout(() => {
                    // hide popup and bg
                    toggleTransparent([popup, popupBg], true);
                    setTimeout(() => {
                        toggleNoDisplay([this], true);
                    }, timeout);
                }, timeout);
            }, timeout);
        }, timeout);
    }
}