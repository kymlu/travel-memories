import BasePolaroid from "../base-polaroid/base-polaroid.js"
import { SHORT_DATETIME_FORMAT_EN, SHORT_DATETIME_FORMAT_JP } from '../../../../../js/constants.js'
import {
    toggleNoDisplay, toggleTransparent, fetchInnerHtml, fetchStyle, getBilingualText, getPictureDate
} from '../../../../../js/utils.js';

let imgPolaroidTemplate = document.createElement("template");
fetchInnerHtml("views/gallery-view/components/polaroid/img-polaroid/img-polaroid.html", imgPolaroidTemplate, false);
let imgPolaroidStyle = new CSSStyleSheet();
fetchStyle("views/gallery-view/components/polaroid/img-polaroid/img-polaroid.css", imgPolaroidStyle);

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
     * @param {string} captionEn 
     * @param {string} captionJp 
     */
    constructor(isAngledLeft, src, isFavourite, date, offset, captionEn, captionJp) {
        super(isAngledLeft, false);

        this.shadowRoot.adoptedStyleSheets.push(imgPolaroidStyle);
        this.shadowRoot.appendChild(imgPolaroidTemplate.content.cloneNode(true));

        /** The image source. @type string */
        this.src = src;
        /** ```True``` if the image is one of my favourites. @type boolean */
        this.isFavourite = isFavourite;
        /** The image date. @type Date */
        this.date = getPictureDate(new Date(date), offset);
        /** The English image caption. @type string */
        this.captionEn = captionEn;
        /** The Japanese image caption. @type string */
        this.captionJp = captionJp;
        
        this.title = getBilingualText("Expand image", "画像を拡大する");
    }

    connectedCallback() {
        super.connectedCallback();

        const polaroid = this.queryByClassName("frame");
        
        const img = polaroid.querySelector("img");
        if (img) {
            img.onload = function () {
                if (this.width > this.height) {
                    img.classList.add("landscape-img");
                } else {
                    img.classList.add("portrait-img");
                }
                setTimeout(() => {
                    toggleTransparent([img], false);
                }, 0);
            }
            img.setAttribute("src", this.src);
            img.setAttribute("alt", "");
        }

        const dates = polaroid.querySelector(".polaroid-date").querySelectorAll("span");
        if (dates) {
            if (this.date) {
                dates[0].innerText = SHORT_DATETIME_FORMAT_EN.format(this.date);
                dates[1].innerText = SHORT_DATETIME_FORMAT_JP.format(this.date);
            } else {
                dates[0].innerText = "";
                dates[1].innerText = "";
            }
        }

        const captions = polaroid.querySelector(".caption-text-container").querySelectorAll("span");
        if (captions) {
            captions[0].innerText = this.captionEn ?? "";
            captions[1].innerText = this.captionJp ?? "";
        }

        if (this.isFavourite) {
            toggleNoDisplay([polaroid.querySelector(".star")], false);
        }
    }
}

window.customElements.define("img-polaroid", ImagePolaroid);