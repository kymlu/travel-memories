import { fetchStyle } from "./utils.js";

let globalStyleSheet = new CSSStyleSheet();
fetchStyle("css/style.css", globalStyleSheet);

const fontAwesomeStyleSheet = new CSSStyleSheet();
fetchStyle("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css", fontAwesomeStyleSheet);

export default class BaseElement extends HTMLElement {
    constructor() {
        super();
        this._elements = {};
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets.push(globalStyleSheet);
        this.shadowRoot.adoptedStyleSheets.push(fontAwesomeStyleSheet);
    }
    
    queryById(id){
        return this.shadowRoot.querySelector(`#${id}`);
    }

    queryByClassName(className){
        return this.shadowRoot.querySelector(`.${className}`);
    }
}