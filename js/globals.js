/** @type string */
let appColor = null;
/** @type any */
let currentCountry = null;

/**
 * Gets the current app colour.
 * @returns the current app colour.
 */
export function getAppColor() {
    return appColor;
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
 * Sets the new country.
 * @param {object}} newValue - the new country to set.
 */
export function setCurrentCountry(newValue) {
    currentCountry = newValue;
}

/**
 * @returns ```True``` if a country is currently selected.
 */
export function isCountrySelected() {
    return currentCountry != null;
}