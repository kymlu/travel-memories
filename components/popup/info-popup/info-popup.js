/// IMPORTS
import { CUSTOM_EVENT_TYPES } from "../../../js/constants.js";
import BasePopup from "../base-popup/base-popup.js"

/**
 * The Info Popup object.
 * @extends BasePopup
 */
export default class InfoPopup extends BasePopup {
    constructor(){
        super();

        // Get component html
        fetch("components/popup/info-popup/info-popup.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            });
    }

    /** @inheritdoc */
    initializePopup(){
        super.initializePopup();
        this.querySelectorAll(".action-btn").forEach(element => {
            element.addEventListener("click", () => { this.goToGithub(); });
        });
    }

    /** @inheritdoc */
    openPopup(){
        super.openPopup();
    }

    /** @inheritdoc */
    closePopup(forceClose) {
        super.closePopup(forceClose);
        
        const infoClosedEvent = new CustomEvent(CUSTOM_EVENT_TYPES.INFO_POPUP_CLOSED);
        this.dispatchEvent(infoClosedEvent);
    }

    /** Opens a new page on this project's Github repo. */
    goToGithub(){
        window.open("https://github.com/kymlu/travel-memories");
    }
}

window.customElements.define("info-popup", InfoPopup);