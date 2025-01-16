import { fetchInnerHtml } from "../../../js/utils.js";
import BasePopup from "../base-popup/base-popup.js"

/**
 * The Info Popup object.
 * @extends BasePopup
 */
export default class InfoPopup extends BasePopup {
    constructor() {
        super();
    }

    connectedCallback() {
        fetchInnerHtml("components/popup/info-popup/info-popup.html", this, true)
            .then(() => {
                this.shadowRoot.querySelectorAll(".action-btn").forEach(element => {
                    element.addEventListener("click", () => { this.goToGithub(); });
                });
                super.connectedCallback();
            });
    }

    /** Opens this project's Github repo in a anew tab. */
    goToGithub() {
        window.open("https://github.com/kymlu/travel-memories");
    }
}

window.customElements.define("info-popup", InfoPopup);