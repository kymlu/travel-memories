import { DEFAULT_TIMEOUT, LOAD_ANIMATION_TIME, LOAD_DOT_COUNT } from "../../js/constants.js";
import { addRemoveNoDisplay, addRemoveTransparent } from "../../js/utils.js";
import { getCurrentCountry, isCountrySelected } from "../../js/globals.js";

// TODO: restrict all loader functions to here!
let startTime = null;
let animationEndFunc = null;

export function setupLoader() {
    document.getElementById(`load${LOAD_DOT_COUNT}`).addEventListener("animationend", function () {
        addRemoveNoDisplay("loading-screen", true);
    });

    Array.from(document.getElementsByClassName("loader-dot")).forEach(dot => {
        dot.addEventListener("animationend", function () {
            addRemoveNoDisplay([dot], true);
        });
    });
}

// TODO: restore filter values if exit suddenly
/**
 * Start the loader.
 */
export function startLoader() {
    addRemoveNoDisplay("loading-screen", false);
    addRemoveTransparent("loading-screen", false);

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
}

/**
 * Stop the loader when all dots complete a full cycle.
 * @param {Function} animationEndFunction 
 */
export function stopLoader(animationEndFunction) {
    animationEndFunc = function () {
        addRemoveNoDisplay("loading-screen", true);
        if (animationEndFunction) animationEndFunction();
        document.getElementById(`load${LOAD_DOT_COUNT}`).removeEventListener("animationend", animationEndFunc);
    }
    document.getElementById(`load${LOAD_DOT_COUNT}`).addEventListener("animationend", animationEndFunc);

    setTimeout(() => {
        let iterationCount = Math.ceil((new Date() - startTime) / LOAD_ANIMATION_TIME);
        for (let i = 0; i <= LOAD_DOT_COUNT; i++) {
            document.getElementById(`load${i}`).style.animationIterationCount = iterationCount;
        }
    }, 100);
}

/**
 * Retries the loading function.
 * @param {Function} functionToRetry 
 */
export function retryLoader(functionToRetry) {
    addRemoveNoDisplay("error-btn", true);
    setLoaderState("running");
    functionToRetry();
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
 * Sets all loader dots to a specified state. 
 * @param {string} state 
 */
function setLoaderState(state) {
    for (let i = 0; i <= LOAD_DOT_COUNT; i++) {
        document.getElementById(`load${i}`).style.animationPlayState = state;
    }
}