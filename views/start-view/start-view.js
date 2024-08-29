import BaseElement from "../../js/base-element.js";
import { DEFAULT_TIMEOUT } from "../../js/constants.js";
import {
    getAllCountryData, setAppColor, setCurrentCountry,
} from "../../js/globals.js";
import {
    addRemoveClass, addRemoveNoDisplay, addRemoveTransparent,
    getBilingualText, scrollToTop
} from "../../js/utils.js";

/** The Start View. */
export default class StartView extends BaseElement {
    constructor() {
        super();

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', 'views/start-view/start-view.css');
        this.shadowRoot.appendChild(linkElem);
    }

    /** Initializes the start view contents. */
    initialize() {
        const btn = document.createElement("button");
        btn.classList.add("start-btn");
        const text = document.createElement("span");
        const iconSection = document.createElement("div");
        iconSection.classList.add("start-icon");
        const img = document.createElement("img");
        img.classList.add("start-icon");

        this.replaceChildren();

        let startViewWrapper = document.createElement("div");
        startViewWrapper.classList.add("start-screen");

        getAllCountryData().forEach(country => {
            const abb = country.abbreviation;

            let newBtn = btn.cloneNode();
            newBtn.id = `start-btn-${abb}`;
            newBtn.title = getBilingualText(`See ${country.nameEn}`, `${country.nameJp}へ`);
            newBtn.classList.add(abb);
            newBtn.addEventListener("click", this.selectCountry.bind(this, country.id, `--${abb}-color`));

            let txtEn = text.cloneNode();
            txtEn.innerText = country.nameEn;

            let txtJp = text.cloneNode();
            txtJp.innerText = country.nameJp;

            let newIconSection = iconSection.cloneNode();
            newIconSection.id = `${abb}-start-icon`;

            let imgWhite = img.cloneNode();
            imgWhite.id = `${abb}-start-icon-w`;
            imgWhite.src = `assets/icons/${country.symbol}_white.svg`;

            let imgColor = img.cloneNode();
            imgColor.id = `${abb}-start-icon-c`;
            imgColor.src = `assets/icons/${country.symbol}.svg`;
            imgColor.classList.add("opacity-transition");

            newIconSection.appendChild(imgWhite);
            newIconSection.appendChild(imgColor);

            newBtn.appendChild(txtEn);
            newBtn.appendChild(newIconSection);
            newBtn.appendChild(txtJp);

            newBtn.addEventListener("pointerover", () => {
                addRemoveClass([newBtn], "animated", true);
                addRemoveTransparent([imgColor], true);
                addRemoveClass([newIconSection], "animated", true);
            });
            newBtn.addEventListener("pointerout", () => {
                addRemoveClass([newBtn], "animated", false);
                addRemoveTransparent([imgColor], false);
                addRemoveClass([newIconSection], "animated", false);
            });

            startViewWrapper.appendChild(newBtn)
        });
        this.shadowRoot.appendChild(startViewWrapper);
    }

    /** Shows the start view. */
    show(isPopped) {
        if (isPopped == null) {
            window.history.pushState({ type: VIEW_NAMES.StartView }, "", null);
        }

        setCurrentCountry(null, null, false);
        scrollToTop(false);
        setAppColor("--default-color");
        addRemoveNoDisplay([this], false);
        this.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });
        setTimeout(() => {
            addRemoveTransparent([this], false);
        }, 10);
    }

    hide() {
        addRemoveTransparent([this], true);
        setTimeout(() => {
            addRemoveNoDisplay([this], true);
        }, DEFAULT_TIMEOUT);
    }

    selectCountry(countryId, countryColor) {
        setCurrentCountry(countryId, countryColor, false);
        this.hide();
    }
}

window.customElements.define("start-view", StartView);