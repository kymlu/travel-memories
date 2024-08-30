/// IMPORTS
import BasePolaroid from "../base-polaroid/base-polaroid.js"
import { fetchInnerHtml, getBilingualText } from '../../../../../js/utils.js';

let txtPolaroidTemplate = document.createElement("template");
fetchInnerHtml("views/gallery-view/components/polaroid/txt-polaroid/txt-polaroid.html", txtPolaroidTemplate, false);

/**
 * The Text Polaroid object.
 * @extends BasePolaroid
 */
export default class TextPolaroid extends BasePolaroid {
    /**
     * @param {boolean} isAngledLeft 
     * @param {string} nameEn 
     * @param {string} nameJp 
     */
    constructor(isAngledLeft, nameEn, nameJp) {
        super(isAngledLeft, true);
        /** The text to display in the middle of the polaroid. @type string */
        this.nameEn = nameEn;
        this.nameJp = nameJp;
        this.title = getBilingualText(`See images from ${nameEn}`, `${nameJp}の写真を表示する`);

        this.shadowRoot.appendChild(txtPolaroidTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        super.connectedCallback();
        this.queryById("name-en").innerText = this.nameEn;
        this.queryById("name-jp").innerText = this.nameJp;
    }
}

window.customElements.define("txt-polaroid", TextPolaroid);