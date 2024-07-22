import { LOAD_ANIMATION_TIME, LOAD_DOT_COUNT } from "../../js/constants";
import { getCurrentCountry } from "../../js/globals";

// TODO: restrict all loader functions to here!
let startTime = null;
/**
 * Start the loader.
 */
export function startLoader() {
    startTime = new Date();
    document.getElementById("load-icon").src = `assets/icons/${getCurrentCountry().symbol}.svg`;

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
    setTimeout(() => {
        addRemoveNoDisplay("loading-screen", true);
        setTimeout(() => {
            addRemoveTransparent("loading-screen", false);
            isLoading = false;
        }, DEFAULT_TIMEOUT);
    }, DEFAULT_TIMEOUT);
}

/**
 * Stop the loader when all dots complete a full cycle.
 * @param {Function} animationEndFunction 
 */
export function stopLoader(animationEndFunction) {
    document.getElementById(`load${LOAD_DOT_COUNT}`).addEventListener("animationend", animationEndFunction);

    setTimeout(() => {
        let iterationCount = Math.ceil((new Date() - startTime) / LOAD_ANIMATION_TIME);
        for (let i = 0; i <= LOAD_DOT_COUNT; i++) {
            document.getElementById(`load${i}`).style.animationIterationCount = iterationCount;
        }
    }, 100);
}