import BaseElement from "../../js/base-element.js";
import {
    CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT, LOAD_ANIMATION_TIME, LOAD_DOT_COUNT
} from "../../js/constants.js";
import { getCurrentCountry, isCountrySelected } from "../../js/globals.js";
import {
    addRemoveClass, addRemoveNoDisplay, addRemoveTransparent, fetchInnerHtml
} from "../../js/utils.js";

/** The Loader. */
export default class Loader extends BaseElement {
    #startTime;

    constructor() {
        super();
        this.functionToRetry = null;
        this.#startTime = null;

        this.style.zIndex = 100;
    }

    connectedCallback() {
        fetchInnerHtml("components/loader/loader.html", this, true)
            .then(() => {
                setTimeout(() => {
                    addRemoveClass([this], "opacity-transition", true);
                    this._elements = {
                        dots: Array.from(this.shadowRoot.querySelectorAll(".loader-dot")),
                        icon: this.queryByClassName("loader-icon"),
                        error: this.queryByClassName("error-btn")
                    }
                    this._elements.error.addEventListener("click", this.retry.bind(this));
                    addRemoveNoDisplay([this._elements.error], true);
                    this.start();
                }, 50);
            });
    }

    /**
     * Start the loader.
     * @param {Function} func 
     */
    start() {
        this.#startTime = new Date();

        if (isCountrySelected()) {
            addRemoveNoDisplay([this._elements.icon], false);
            this._elements.icon.src = `assets/icons/${getCurrentCountry()?.symbol}.svg`;
        }

        this._elements.dots.forEach(dot => {
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
        let dispatchFunction = this.#dispatchLoadingEvent.bind(this);
        let handleAnimationEnd = function () {
            addRemoveTransparent([this], true);
            dispatchFunction();
            if (animationEndFunction) {
                animationEndFunction();
            }
        }

        this._elements.dots[LOAD_DOT_COUNT].addEventListener("animationend", handleAnimationEnd.bind(this));
        let iterationCount = Math.ceil((new Date() - this.#startTime) / LOAD_ANIMATION_TIME);
        this._elements.dots.forEach(dot => {
            dot.style.animationIterationCount = iterationCount
        });
    }

    /**
     * Shows the error button for the data loader.
     */
    showDataLoadError(func) {
        this.functionToRetry = func;
        addRemoveNoDisplay([this._elements.error], false);
        addRemoveTransparent([this._elements.error], false);
        this.#setLoaderState("paused");
    }

    /**
     * Retries the loading function.
    */
    retry() {
        addRemoveTransparent([this._elements.error], true);
        setTimeout(() => {
            addRemoveNoDisplay([this._elements.error], true);
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
        this._elements.dots.forEach(dot => {
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
