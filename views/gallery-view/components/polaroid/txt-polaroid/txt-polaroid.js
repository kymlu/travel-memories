/// IMPORTS
import BasePolaroid from "../base-polaroid/base-polaroid.js"
import { polaroidHtmls } from "../../../../../js/globals.js";
import { getBilingualText } from '../../../../../js/utils.js';

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
        /** The region the polaroid represents. @type string */
        this.innerHTML = polaroidHtmls.txt;
        this.title = getBilingualText(`See images from ${englishName}`, `${japaneseName}の写真を表示する`);
    }

    connectedCallback() {
        super.connectedCallback();
        const polaroidImg = this.querySelector(".polaroid-img");
        polaroidImg.innerHTML = this.text;
    }
}

window.customElements.define("txt-polaroid", TextPolaroid);