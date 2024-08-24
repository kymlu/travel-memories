const globalStyleSheet = document.createElement('link');
globalStyleSheet.setAttribute('rel', 'stylesheet');
globalStyleSheet.setAttribute('type', "text/css");
globalStyleSheet.setAttribute('href', 'css/style.css');

const fontAwesomeStyleSheet = document.createElement('link');
fontAwesomeStyleSheet.setAttribute('rel', 'stylesheet');
fontAwesomeStyleSheet.setAttribute('type', "text/css");
fontAwesomeStyleSheet.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

export default class BaseElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(globalStyleSheet.cloneNode(true));
        this.shadowRoot.appendChild(fontAwesomeStyleSheet.cloneNode(true));
    }
}