import { DEFAULT_TIMEOUT, LOAD_ANIMATION_TIME, LOAD_DOT_COUNT } from "../../js/constants.js";
import { addRemoveNoDisplay, addRemoveTransparent } from "../../js/utils.js";
import { getCurrentCountry, isCountrySelected } from "../../js/globals.js";

export default class Loader extends HTMLElement {
    constructor(func) {
        super();
        this.functionToRetry = func;

        this.startTime = null;
        this.handleAnimationEnd = null;
        this.isLoading = false;

        // Get component html
        fetch("components/loader/loader.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;

                document.getElementById(`load${LOAD_DOT_COUNT}`).addEventListener("animationend", function () {
                    addRemoveNoDisplay("loading-screen", true);
                });

                Array.from(document.getElementsByClassName("loader-dot")).forEach(dot => {
                    dot.addEventListener("animationend", function () {
                        addRemoveNoDisplay([dot], true);
                    });
                });

                document.getElementById("error-btn").addEventListener("click", retryLoader);
            }).catch(error => console.log(error));
    }

    /**
     * Start the loader.
     * @param {Function} func 
     */
    startLoader() {
        isLoading = true;
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
    hideLoader() {
        addRemoveTransparent("loading-screen", true);
        document.body.style.overflowY = "auto";
        addRemoveTransparent([document.getElementsByTagName("header")], false); // TODO: ??
        setTimeout(() => {
            addRemoveNoDisplay("loading-screen", true);
        }, DEFAULT_TIMEOUT);
        isLoading = false;
        this.remove();
    }

    /**
     * Stop the loader when all dots complete a full cycle.
     * @param {Function} animationEndFunction 
     */
    stopLoader(animationEndFunction) {
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
        this.remove();
    }

    /**
     * Shows the error button for the data loader.
     */
    showDataLoadError() {
        setTimeout(() => {
            addRemoveNoDisplay("error-btn", false);
            addRemoveTransparent("error-btn", false);
            this.#setLoaderState("paused");
        }, DEFAULT_TIMEOUT);
    }

    /**
     * Retries the loading function.
     */
    retryLoader() {
        addRemoveNoDisplay("error-btn", true);
        this.#setLoaderState("running");
        functionToRetry();
    }

    /**
     * Sets all loader dots to a specified state. 
     * @param {string} state 
     */
    #setLoaderState(state) {
        for (let i = 0; i <= LOAD_DOT_COUNT; i++) {
            document.getElementById(`load${i}`).style.animationPlayState = state;
        }
    }
}