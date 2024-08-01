/// IMPORTS
import BasePolaroid from "../base-polaroid/base-polaroid.js"
import { addRemoveTransparent, getBilingualText } from '../../../js/utils.js';
import { polaroidHtmls } from "../../../js/globals.js";

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

        // The lazy loading observer
        // Based on: https://www.codepel.com/vanilla-javascript/javascript-image-loaded/
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        const polaroid = this.querySelector(".polaroid-frame");
                        polaroid.classList.add(this.getRandomAngleClass())

                        const polaroidImg = this.querySelector(".polaroid-img");
                        polaroidImg.innerHTML = this.text;

                        setTimeout(() => {
                            addRemoveTransparent([polaroid], false);
                        }, 75);
                        observer.disconnect();
                    }, 0);
                }
            });
        });
        obs.observe(this);
    }
}

window.customElements.define("txt-polaroid", TextPolaroid);