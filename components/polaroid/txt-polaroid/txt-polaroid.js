/*** Imports */
import BasePolaroid from "../base-polaroid/base-polaroid.js"
import { getBilingualText, addRemoveTransparent } from '../../../js/utils.js';

/**
 * The Text Polaroid object.
 * @extends BasePolaroid
 */
export default class TextPolaroid extends BasePolaroid {
    /**
     * 
     * @param {boolean} isAngledLeft 
     * @param {string} text 
     * @param {string} regionId 
     * @param {string} officialRegionNameEnglish 
     */
    constructor(isAngledLeft, text, regionId, officialRegionNameEnglish) {
        super(isAngledLeft, true);
        /** The text to display in the middle of the polaroid. @type string */
        this.text = text;
        /** The region the polaroid represents. @type string */
        this.regionId = regionId;
        /** The official region name for the current country. @type string */
        // TODO: make some variables shared between all the files (a shared file, currentColour, currentCountry, etc.)
        this.officialRegionNameEnglish = officialRegionNameEnglish;

        // Get component html
        fetch("components/polaroid/txt-polaroid/txt-polaroid.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            });

        this.title = getBilingualText(`See images from this ${this.officialRegionNameEnglish}`, "この地域の写真を表示する");

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