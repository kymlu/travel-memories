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
     * @param {string} englishName 
     * @param {string} japaneseName 
     */
    constructor(isAngledLeft, englishName, japaneseName) {
        super(isAngledLeft, true);
        /** The text to display in the middle of the polaroid. @type string */
        this.text = getBilingualText(englishName, japaneseName);
        this.title = getBilingualText(`See images from ${englishName}`, `${japaneseName}の写真を表示する`);

        this.shadowRoot.appendChild(txtPolaroidTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        super.connectedCallback();
        const polaroidImg = this.queryByClassName("img-wrapper");
        polaroidImg.innerText = this.text;
    }
}

window.customElements.define("txt-polaroid", TextPolaroid);