import { fetchStyle } from "./utils.js";

let globalStyleSheet = new CSSStyleSheet();
fetchStyle("css/style.css", globalStyleSheet);

export default class BaseElement extends HTMLElement {
    constructor() {
        super();
        this._elements = {};
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets.push(globalStyleSheet);
    }

    queryById(id){
        return this.shadowRoot.querySelector(`#${id}`);
    }

    queryByClassName(className){
        return this.shadowRoot.querySelector(`.${className}`);
    }
}