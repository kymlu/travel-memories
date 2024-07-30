/// IMPORTS
import BasePolaroid from "../base-polaroid/base-polaroid.js"
import {
    addRemoveNoDisplay, addRemoveTransparent, getBilingualText, getPictureDate
} from '../../../js/utils.js';
import { DEFAULT_TIMEOUT, SHORT_DATETIME_FORMAT_EN, SHORT_DATETIME_FORMAT_JP } from '../../../js/constants.js'

/**
 * The Image Polaroid object.
 * @extends BasePolaroid
 */
export default class ImagePolaroid extends BasePolaroid {
    /**
     * @param {boolean} isAngledLeft 
     * @param {string} src 
     * @param {boolean} isFavourite 
     * @param {Date} date 
     * @param {number} offset 
     * @param {string} enCaption 
     * @param {string} jpCaption 
     */
    constructor(isAngledLeft, src, isFavourite, date, offset, enCaption, jpCaption) {
        super(isAngledLeft, false);

        /** The image source. @type string */
        this.src = src;
        /** ```True``` if the image is one of my favourites. @type boolean */
        this.isFavourite = isFavourite;
        /** The image date. @type Date */
        this.date = getPictureDate(new Date(date), offset);
        /** The English image caption. @type string */
        this.enCaption = enCaption;
        /** The Japanese image caption. @type string */
        this.jpCaption = jpCaption;
        this.title = getBilingualText("Expand image", "画像を拡大する");


        // The lazy loading observer
        // Based on: https://www.codepel.com/vanilla-javascript/javascript-image-loaded/
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    addRemoveTransparent([polaroid], false);
                    observer.disconnect();
                }
            });
        });
        obs.observe(this);
    }

    connectedCallback() {
        // Get component html
        fetch("components/polaroid/img-polaroid/img-polaroid.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            });

        const polaroid = this.querySelector(".polaroid-frame");
        polaroid.classList.add(this.getRandomAngleClass())

        const img = polaroid.querySelector("img");
        if (img) {
            img.onload = function () {
                if (this.width > this.height) {
                    img.classList.add("landscape-img");
                } else {
                    img.classList.add("portrait-img");
                }
                setTimeout(() => {
                    addRemoveTransparent([img], false);
                }, DEFAULT_TIMEOUT);
            }
            img.setAttribute("src", this.src);


        }
        const dates = polaroid.querySelector(".polaroid-date").querySelectorAll("span");
        if (dates) {
            if (this.date) {
                dates[0].innerHTML = SHORT_DATETIME_FORMAT_EN.format(this.date);
                dates[1].innerHTML = SHORT_DATETIME_FORMAT_JP.format(this.date);
            } else {
                dates[0].innerHTML = "";
                dates[1].innerHTML = "";
            }
        }

        const captions = polaroid.querySelector(".polaroid-caption-text-container").querySelectorAll("span");
        if (captions) {
            captions[0].innerHTML = this.enCaption ?? "";
            captions[1].innerHTML = this.jpCaption ?? "";
        }

        if (this.isFavourite) {
            addRemoveNoDisplay([polaroid.querySelector(".polaroid-pin-star")], false);
        }
    }
}

window.customElements.define("img-polaroid", ImagePolaroid);