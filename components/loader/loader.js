import { DEFAULT_TIMEOUT, LOAD_ANIMATION_TIME, LOAD_DOT_COUNT } from "../../js/constants.js";
import { addRemoveNoDisplay, addRemoveTransparent } from "../../js/utils.js";
import { getCurrentCountry, isCountrySelected } from "../../js/globals.js";

/** The Loader. */
export default class Loader extends HTMLElement {
    constructor() {
        super();
        this.functionToRetry = null;

        this.startTime = null;
        this.handleAnimationEnd = null;
        this.isLoading = false;

        // Get component html
        fetch("components/loader/loader.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            }).catch(error => console.log(error));

        this.elements = null;
    }


    connectedCallback() {
        setTimeout(() => {
            this.elements = {
                dots: Array.from(document.getElementsByClassName("loader-dot")),
                lastDot: document.querySelector(`.dot-${LOAD_DOT_COUNT}`),
                icon: document.querySelector(".small-icon"),
                error: document.querySelector(".error-btn")
            }
            this.elements.error.addEventListener("click", this.retry.bind(this));
            this.start();
        }, 50);
    }

    /**
     * Start the loader.
     * @param {Function} func 
     */
    start() {
        this.isLoading = true;

        this.startTime = new Date();

        // TODO: ensure this works
        if (isCountrySelected()) {
            addRemoveNoDisplay([this.elements.icon], false);
            this.elements.icon.src = `assets/icons/${getCurrentCountry()?.symbol}.svg`;
        }

        setTimeout(() => {
            this.elements.dots.forEach(dot => {
                dot.style.animationIterationCount = "infinite";
            });
        }, 100);
    }

    /**
     * Stop the loader regardless of where it is.
     */
    quickStop() {
        this.isLoading = false;
        addRemoveTransparent([this], true);
        setTimeout(() => {
            this.remove();
        }, DEFAULT_TIMEOUT);
    }

    /**
     * Stop the loader when all dots complete a full cycle.
     * @param {Function} animationEndFunction 
     */
    stop(animationEndFunction) {
        this.handleAnimationEnd = function () {
            addRemoveTransparent([this], true);
            if (animationEndFunction) {
                animationEndFunction();
            }
            setTimeout(() => {
                this.remove();
            }, DEFAULT_TIMEOUT);
        }

        this.elements.lastDot.addEventListener("animationend", this.handleAnimationEnd);

        let iterationCount = Math.ceil((new Date() - this.startTime) / LOAD_ANIMATION_TIME);
        this.elements.dots.forEach(dot => {
            dot.style.animationIterationCount = iterationCount
        });
        this.isLoading = false;
    }

    /**
     * Shows the error button for the data loader.
     */
    showDataLoadError(func) {
        this.functionToRetry = func;
        setTimeout(() => {
            addRemoveTransparent([this.elements.error], false);
            this.#setLoaderState("paused");
        }, DEFAULT_TIMEOUT);
    }

    /**
     * Retries the loading function.
     */
    retry() {
        addRemoveTransparent([this.elements.error], true);
        this.#setLoaderState("running");
        if (this.functionToRetry) {
            this.functionToRetry();
        }
    }

    /**
     * Sets all loader dots to a specified state. 
     * @param {string} state 
     */
    #setLoaderState(state) {
        this.elements.dots.forEach(dot => {
            dot.style.animationPlayState = state;
        });
    }
}

window.customElements.define("loader-component", Loader);
