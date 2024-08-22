/// IMPORTS
import { fetchInnerHtml } from "../../../js/utils.js";
import BasePopup from "../base-popup/base-popup.js"

/**
 * The Info Popup object.
 * @extends BasePopup
 */
export default class InfoPopup extends BasePopup {
    constructor(){
        super();

        fetchInnerHtml("components/popup/info-popup/info-popup.html", this);
    }

    /** @inheritdoc */
    connectedCallback(){
        setTimeout(() => {
            this.querySelectorAll(".action-btn").forEach(element => {
                element.addEventListener("click", () => { this.goToGithub(); });
            });
            super.connectedCallback();
        }, 0);
    }

    /** Opens a new page on this project's Github repo. */
    goToGithub(){
        window.open("https://github.com/kymlu/travel-memories");
    }
}

window.customElements.define("info-popup", InfoPopup);