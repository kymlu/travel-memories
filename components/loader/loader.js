import {
    CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT, LOAD_ANIMATION_TIME, LOAD_DOT_COUNT
} from "../../js/constants.js";
import { getCurrentCountry, isCountrySelected } from "../../js/globals.js";
import { addRemoveClass, addRemoveNoDisplay, addRemoveTransparent } from "../../js/utils.js";

/** The Loader. */
export default class Loader extends HTMLElement {
    #startTime;
    #elements;

    constructor() {
        super();
        this.functionToRetry = null;
        this.#startTime = null;
        this.#elements = null;

        // Get component html
        fetch("components/loader/loader.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            }).catch(error => console.error(error));

        this.style.zIndex = 100;
    }


    connectedCallback() {
        setTimeout(() => {
            addRemoveClass([this], "opacity-transition", true);
            this.#elements = {
                dots: Array.from(document.querySelectorAll(".loader-dot")),
                lastDot: document.querySelector(`.dot-${LOAD_DOT_COUNT}`),
                icon: document.querySelector(".small-icon"),
                error: document.querySelector(".error-btn")
            }
            this.#elements.error.addEventListener("click", this.retry.bind(this));
            addRemoveNoDisplay([this.#elements.error], true);
            this.start();
        }, 50);
    }

    /**
     * Start the loader.
     * @param {Function} func 
     */
    start() {
        this.#startTime = new Date();

        // TODO: ensure this works
        if (isCountrySelected()) {
            addRemoveNoDisplay([this.#elements.icon], false);
            document.querySelector(".small-icon").src = `assets/icons/${getCurrentCountry()?.symbol}.svg`;
        }

        Array.from(document.querySelectorAll(".loader-dot")).forEach(dot => {
            dot.style.animationIterationCount = "infinite";
        });
    }

    /**
     * Stop the loader regardless of where it is.
     */
    quickStop() {
        addRemoveTransparent([this], true);
        setTimeout(this.#dispatchLoadingEvent.bind(this), DEFAULT_TIMEOUT);
    }

    /**
     * Stop the loader when all dots complete a full cycle.
     * @param {Function} animationEndFunction 
     */
    stop(animationEndFunction) {
        let dispatchFunction = () => { this.#dispatchLoadingEvent.bind(this)(); }
        let handleAnimationEnd = function () {
            addRemoveTransparent([this], true); // TODO: make removing the icon quicker
            dispatchFunction();
            if (animationEndFunction) {
                animationEndFunction();
            }
        }

        document.querySelector(`.dot-${LOAD_DOT_COUNT}`).addEventListener("animationend", handleAnimationEnd.bind(this));
        let iterationCount = Math.ceil((new Date() - this.#startTime) / LOAD_ANIMATION_TIME);
        Array.from(document.querySelectorAll(".loader-dot")).forEach(dot => {
            dot.style.animationIterationCount = iterationCount
        });
    }

    /**
     * Shows the error button for the data loader.
     */
    showDataLoadError(func) {
        this.functionToRetry = func;
        addRemoveNoDisplay([this.#elements.error], false);
        addRemoveTransparent([this.#elements.error], false);
        this.#setLoaderState("paused");
    }

    /**
     * Retries the loading function.
    */
    retry() {
        addRemoveTransparent([this.#elements.error], true);
        setTimeout(() => {
            addRemoveNoDisplay([this.#elements.error], true);
        }, DEFAULT_TIMEOUT);
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
        this.#elements.dots.forEach(dot => {
            dot.style.animationPlayState = state;
        });
    }

    /** Dispatches the loading complete event. */
    #dispatchLoadingEvent() {
        const loadingCompleteEvent = new CustomEvent(CUSTOM_EVENT_TYPES.LOADING_COMPLETE);
        this.dispatchEvent(loadingCompleteEvent);
    }
}

window.customElements.define("loader-component", Loader);
