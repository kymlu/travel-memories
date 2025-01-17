import { fetchStyle } from "./utils.js";

let globalStyleSheet = new CSSStyleSheet();
fetchStyle("css/style.css", globalStyleSheet);

export default class BaseElement extends HTMLElement {
    constructor() {
        super();
        
        /** An object where every property repesents an element within the element. */
        this._elements = {};
        
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets.push(globalStyleSheet);
    }

    /**
     * Gets an element within the shadow root by querying the element id.
     * @param {string} id The element id.
     * @returns The element or null.
     */
    queryById(id){
        return this.shadowRoot.querySelector(`#${id}`);
    }

    /**
     * Gets the first element within the shadow root that has the given class.
     * @param {string} className The name of the class
     * @returns The first element or null.
     */
    queryByClassName(className){
        return this.shadowRoot.querySelector(`.${className}`);
    }
}