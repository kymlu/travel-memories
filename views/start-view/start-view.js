import { DEFAULT_TIMEOUT } from "../../js/constants.js";
import {
    getAllCountryData, setAppColor, setCurrentCountry,
} from "../../js/globals.js";
import {
    addRemoveClass, addRemoveNoDisplay, addRemoveTransparent,
    getBilingualText, scrollToTop
} from "../../js/utils.js";

/** The Start View. */
export default class StartView extends HTMLElement {
    constructor() {
        super();
    }

    /** Initializes the start view contents. */
    initialize() {
        const btn = document.createElement("button");
        btn.classList.add("start-btn", "highlight-btn", "text-btn");
        const text = document.createElement("div");
        text.classList.add("country-text");
        const iconSection = document.createElement("div");
        iconSection.classList.add("start-icon");
        const img = document.createElement("img");
        img.classList.add("start-icon");

        this.replaceChildren();

        getAllCountryData().forEach(country => {
            const abb = country.abbreviation;

            let newBtn = btn.cloneNode();
            newBtn.id = `start-btn-${abb}`;
            newBtn.title = getBilingualText(`See ${country.englishName}`, `${country.japaneseName}へ`);
            newBtn.classList.add(abb);
            newBtn.addEventListener("click", this.selectCountry.bind(this, country.id, `--${abb}-color`));

            let engTxt = text.cloneNode();
            engTxt.innerHTML = country.englishName;

            let jpTxt = text.cloneNode();
            jpTxt.innerHTML = country.japaneseName;

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

            newBtn.appendChild(engTxt);
            newBtn.appendChild(newIconSection);
            newBtn.appendChild(jpTxt);

            // TODO: check if this is ok
            newBtn.addEventListener("mouseover", this.highlightCountry.bind(this, abb, true));
            newBtn.addEventListener("touchstart", this.highlightCountry.bind(this, abb, true));
            newBtn.addEventListener("mouseout", this.highlightCountry.bind(this, abb, false));
            newBtn.addEventListener("touchend", this.highlightCountry.bind(this, abb, false));

            this.appendChild(newBtn);
        });
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

    highlightCountry(abbreviation, isHover) {
        addRemoveTransparent(`${abbreviation}-start-icon-c`, isHover);
        addRemoveClass([this.querySelector(`#${abbreviation}-start-icon`)], "animated", isHover);
    }
}

window.customElements.define("start-view", StartView);