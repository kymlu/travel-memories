import { PAGE_NAMES } from "./constants.js";
import { sortImgs } from "./utils.js";

/** @type string */
let appColor = null;
/** @type any */
let currentCountry = null;
/** @type string */
let currentPage = PAGE_NAMES.START;

let allCountryData = [];

export function setCurrentPage(pageName) {
    currentPage = pageName;
}

export function getCurrentPage() {
    return currentPage;
}

export function isStartPage() {
    return currentPage == PAGE_NAMES.START;
}

export function isMapPage() {
    return currentPage == PAGE_NAMES.MAP;
}

export function isGalleryPage() {
    return currentPage == PAGE_NAMES.GALLERY;
}

/**
 * Gets the current app colour.
 * @returns the current app colour.
 */
export function getAppColor() {
    return appColor;
}

export function setAllCountryData(data) {
    allCountryData = data;
}

export function getAllCountryData() {
    return allCountryData;
}

export function setCurrentCountry(countryId) {
    if (countryId == null) {
        currentCountry = null;
    } else {
        currentCountry = allCountryData.find(country => country.id == countryId);
        currentCountry.regionGroups.forEach(rgnGrp => {
            rgnGrp.regions.forEach(rgn => {
                if (rgn.imageList != null) {
                    rgn.imageList.sort(sortImgs);
                }
            });
        });
    }
}

/**
 * Sets the new app colour.
 * @param {string} newColor - the new colour to set.
 */
export function setAppColor(newColor) {
    let root = document.querySelector(':root');
    root.style.setProperty('--main-color', getComputedStyle(root).getPropertyValue(newColor));
    let temp = getComputedStyle(root).getPropertyValue("--main-color").split(", ");
    appColor = `rgb(${temp[0]}, ${temp[1]}, ${temp[2]})`;
}

/**
 * Gets the current country.
 * @returns the current country.
 */
export function getCurrentCountry() {
    return currentCountry;
}

/**
 * @returns ```True``` if a country is currently selected.
 */
export function isCountrySelected() {
    return currentCountry != null;
}