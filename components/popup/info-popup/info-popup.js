/// IMPORTS
import BasePopup from "../base-popup/base-popup.js"

// TODO: maybe redesign this to make it more obviously bilingual
// Tabs? Button to scroll down to Japanese?

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