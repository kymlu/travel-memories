/// IMPORTS
import BasePolaroid from "../base-polaroid/base-polaroid.js"
import { getBilingualText, getPictureDate, addRemoveNoDisplay, addRemoveTransparent } from '../../../js/utils.js';
import { MONTH_NAMES, DEFAULT_TIMEOUT } from '../../../js/constants.js'

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

        // Get component html
        fetch("components/polaroid/img-polaroid/img-polaroid.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            })

        this.title = getBilingualText("Expand image", "画像を拡大する");

        // The lazy loading observer
        // Based on: https://www.codepel.com/vanilla-javascript/javascript-image-loaded/
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
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
                                dates[0].innerHTML = this.getEnglishDate();
                                dates[1].innerHTML = this.getJapaneseDate();
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

                        setTimeout(() => {
                            addRemoveTransparent([polaroid], false);
                        }, 75);
                        observer.disconnect();
                    }, 100);
                }
            });
        });
        obs.observe(this);
    }

    /**
     * @returns the image date formatted for English text.
     */
    getEnglishDate() {
        return MONTH_NAMES[this.date.getMonth()] + " " +
            this.date.getDate() + ", " +
            this.date.getFullYear();
    }

    /**
     * @returns the image date formatted for Japanese text.
     */
    getJapaneseDate() {
        return this.date.getFullYear() + "年" +
            (this.date.getMonth() + 1) + "月" +
            this.date.getDate() + "日";
    }
}

window.customElements.define("img-polaroid", ImagePolaroid);