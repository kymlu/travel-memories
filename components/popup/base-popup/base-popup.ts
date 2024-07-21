import { addRemoveNoDisplay, addRemoveTransparent, addRemoveClass } from '../../../js/utility.ts'
import { DEFAULT_TIMEOUT } from '../../../js/constants.ts';

export default class BasePopup extends HTMLElement {
    previouslyOpened: boolean;

    constructor() {
        super();
        this.previouslyOpened = false;
    }

    connectedCallback() { }

    openPopup() {
        let popupOverlay: HTMLElement = this.querySelector(".overlay")!;
        let popupContent: HTMLElement = this.querySelector(".popup-content")!;
        let popup: HTMLElement = this.querySelector(".popup")!;
        let popupBg: HTMLElement = this.querySelector(".popup-bg")!;
        popupOverlay.style.visibility = "visible";

        addRemoveTransparent([popup, popupBg], false);
        // TODO: CHECK: probably don't need? -> document.getElementById("info-popup").style.visibility = "visible";
        addRemoveClass([popup], "popup-width", true);
        setTimeout(() => {
            addRemoveNoDisplay([popupContent], false);
            addRemoveTransparent([popupContent], false);
            addRemoveClass([popup], "popup-height", true);
            this.querySelector(".close-btn")!.addEventListener("click", () => { this.closePopup(false); });
            this.querySelector(".popup-bg")!.addEventListener("click", () => { this.closePopup(true); });
        }, DEFAULT_TIMEOUT);

        if (!this.previouslyOpened) {
            this.setupPopup();
            this.previouslyOpened = true;
        }
    }

    setupPopup() {
        this.querySelector(".popup")!.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    closePopup(forceClose: boolean) {
        let popupOverlay: HTMLElement = this.querySelector(".overlay")!;
        let popupContent: HTMLElement = this.querySelector(".popup-content")!;
        let popup: HTMLElement = this.querySelector(".popup")!;
        let popupBg: HTMLElement = this.querySelector(".popup-bg")!;
        if (!forceClose) {
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
                        }, DEFAULT_TIMEOUT);
                    }, DEFAULT_TIMEOUT);
                }, DEFAULT_TIMEOUT);
            }, DEFAULT_TIMEOUT);
        } else {
            popupOverlay.style.visibility = "hidden";
            addRemoveTransparent([popupContent], true);
            addRemoveClass([popup], "popup-height", false);
            addRemoveNoDisplay([popupContent], true);
            addRemoveClass([popup], "popup-width", false);
            addRemoveTransparent([popup, popupBg], true);
        }
    }
}