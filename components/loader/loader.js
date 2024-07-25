import { DEFAULT_TIMEOUT, LOAD_ANIMATION_TIME, LOAD_DOT_COUNT } from "../../js/constants.js";
import { addRemoveNoDisplay, addRemoveTransparent } from "../../js/utils.js";
import { getCurrentCountry, isCountrySelected } from "../../js/globals.js";

let startTime = null;
let handleAnimationEnd = null;
let isLoading = false;
let functionToRetry = null;

export function isPageLoading(){
    return isLoading;
}

/** Set up the required listeners. */
export function initializeLoader() {
    document.getElementById(`load${LOAD_DOT_COUNT}`).addEventListener("animationend", function () {
        addRemoveNoDisplay("loading-screen", true);
    });

    Array.from(document.getElementsByClassName("loader-dot")).forEach(dot => {
        dot.addEventListener("animationend", function () {
            addRemoveNoDisplay([dot], true);
        });
    });

    document.getElementById("error-btn").addEventListener("click", retryLoader);
}

/**
 * Start the loader.
 * @param {Function} func 
 */
export function startLoader(func) {
    isLoading = true;
    addRemoveNoDisplay("loading-screen", false);
    addRemoveTransparent("loading-screen", false);
    functionToRetry = func;

    startTime = new Date();

    if (isCountrySelected()) {
        addRemoveNoDisplay("load-icon", false);
        document.getElementById("load-icon").src = `assets/icons/${getCurrentCountry()?.symbol}.svg`;
    } else {
        addRemoveNoDisplay("load-icon", true);
    }

    for (let i = 0; i <= LOAD_DOT_COUNT; i++) {
        document.getElementById(`load${i}`).style.animationIterationCount = "infinite";
        addRemoveNoDisplay(`load${i}`, false);
    }
}

/**
 * Stop the loader regardless of where it is.
 */
export function hideLoader() {
    addRemoveTransparent("loading-screen", true);
    document.body.style.overflowY = "auto";
    addRemoveTransparent(["top-bar"], false);
    setTimeout(() => {
        addRemoveNoDisplay("loading-screen", true);
    }, DEFAULT_TIMEOUT);
    isLoading = false;
}

/**
 * Stop the loader when all dots complete a full cycle.
 * @param {Function} animationEndFunction 
 */
export function stopLoader(animationEndFunction) {
    handleAnimationEnd = function () {
        // TODO: create a function that does both add transparent > timeout > no-display
        addRemoveTransparent("loading-screen", true);
        setTimeout(() => {
            addRemoveNoDisplay("loading-screen", true);            
        }, DEFAULT_TIMEOUT);
        animationEndFunction();
        document.getElementById(`load${LOAD_DOT_COUNT}`).removeEventListener("animationend", handleAnimationEnd);
    }

    document.getElementById(`load${LOAD_DOT_COUNT}`).addEventListener("animationend", handleAnimationEnd);

    setTimeout(() => {
        let iterationCount = Math.ceil((new Date() - startTime) / LOAD_ANIMATION_TIME);
        for (let i = 0; i <= LOAD_DOT_COUNT; i++) {
            document.getElementById(`load${i}`).style.animationIterationCount = iterationCount;
        }
    }, 100);
    isLoading = false;
}

/**
 * Shows the error button for the data loader.
 */
export function showDataLoadError() {
    setTimeout(() => {
        addRemoveNoDisplay("error-btn", false);
        addRemoveTransparent("error-btn", false);
        setLoaderState("paused");
    }, DEFAULT_TIMEOUT);
}

/**
 * Retries the loading function.
 */
function retryLoader() {
    addRemoveNoDisplay("error-btn", true);
    setLoaderState("running");
    functionToRetry();
}

/**
 * Sets all loader dots to a specified state. 
 * @param {string} state 
 */
function setLoaderState(state) {
    for (let i = 0; i <= LOAD_DOT_COUNT; i++) {
        document.getElementById(`load${i}`).style.animationPlayState = state;
    }
}