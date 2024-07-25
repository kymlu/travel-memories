import { getAllCountryData, setAppColor, setCurrentCountry, setCurrentPage } from "../../js/globals.js";
import {
    addRemoveClass, addRemoveNoDisplay, addRemoveTransparent,
    getBilingualText, scrollToTop
} from "../../js/utils.js";
import * as Loader from "../../components/loader/loader.js"
import { DEFAULT_TIMEOUT, PAGE_NAMES } from "../../js/constants.js";
import * as MapPage from '../map-page/map-page.js'
import * as GalleryPage from '../gallery-page/gallery-page.js'


export function initializeStartScreen() {
    const btn = document.createElement("button");
    btn.classList.add("start-btn", "highlight-btn", "txt-btn");
    const text = document.createElement("div");
    text.classList.add("country-text");
    const icon = document.createElement("div");
    icon.classList.add("start-icon");
    const img = document.createElement("img");
    img.classList.add("start-icon", "img");

    document.getElementById("start-screen").replaceChildren();

    getAllCountryData().forEach(country => {
        const abb = country.abbreviation;

        let newBtn = btn.cloneNode();
        newBtn.id = `start-btn-${abb}`;
        newBtn.title = getBilingualText(`See ${country.englishName}`, `${country.japaneseName}へ`);
        newBtn.classList.add(abb);
        newBtn.addEventListener("click", function () {
            selectCountry(country.id, `--${abb}-color`);
        });

        let engTxt = text.cloneNode();
        engTxt.innerHTML = country.englishName;

        let jpTxt = text.cloneNode();
        jpTxt.innerHTML = country.japaneseName;

        let iconn = icon.cloneNode();
        iconn.id = `${abb}-start-icon`;

        let imgWhite = img.cloneNode();
        imgWhite.id = `${abb}-start-icon-w`;
        imgWhite.src = `assets/icons/${country.symbol}_white.svg`;

        let imgColor = img.cloneNode();
        imgColor.id = `${abb}-start-icon-c`;
        imgColor.src = `assets/icons/${country.symbol}.svg`;
        imgColor.classList.add("opacity-transition");

        newBtn.addEventListener("mouseover", function () {
            highlightCountry(abb, true);
        });
        newBtn.addEventListener("touchstart", function () {
            highlightCountry(abb, true);
        });
        newBtn.addEventListener("mouseout", function () {
            highlightCountry(abb, false);
        });
        newBtn.addEventListener("touchend", function () {
            highlightCountry(abb, false);
        });

        newBtn.appendChild(engTxt);
        newBtn.appendChild(iconn);
        newBtn.appendChild(jpTxt);
        iconn.appendChild(imgWhite);
        iconn.appendChild(imgColor);

        document.getElementById("start-screen").appendChild(newBtn);
    });

    window.history.pushState({}, "", null);
}

export function showStartScreen(isPoppedPage) {
    setCurrentPage(PAGE_NAMES.START);
    if (isPoppedPage == null) {
        window.history.pushState({}, "", null);
    }

    setCurrentCountry(null);
    scrollToTop(false);
    setAppColor("--default-color");
    addRemoveTransparent("top-bar", false);
    addRemoveTransparent("map-page", true);
    addRemoveClass("btn-grp-right", "justify-end", true);
    addRemoveNoDisplay(["top-bar", "start-screen"], false);
    addRemoveNoDisplay(["btn-grp-left", "map-page"], true);
    document.getElementById("start-screen").scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
    });
    setTimeout(() => {
        addRemoveTransparent("start-screen", false);
    }, 10);
}

export function selectCountry(countryId, countryColor, isPoppedPage) {
	setCurrentCountry(countryId);
	setAppColor(countryColor);
	Loader.startLoader();

	if (isPoppedPage == null) {
		window.history.pushState({ country: countryId, countryColor: countryColor }, "", null);
	}

	MapPage.handleNewCountry();

	GalleryPage.handleNewCountry();
	GalleryPage.createRegionDropDown();
	setTimeout(() => {
		Loader.stopLoader(MapPage.goToMapPage);
	}, 1200);
    addRemoveTransparent("start-screen", true);
    setTimeout(() => {
        addRemoveNoDisplay("start-screen", true);
    }, DEFAULT_TIMEOUT);
}

function highlightCountry(abbreviation, isHover) {
    addRemoveTransparent(`${abbreviation}-start-icon-c`, isHover);
    let icons = Array.from(document.getElementById(`${abbreviation}-start-icon`).getElementsByTagName("img"));
    addRemoveClass(icons, "animated", isHover);
}