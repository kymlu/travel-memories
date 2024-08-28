import BaseElement from "../../../../../js/base-element.js";
import { addRemoveTransparent, fetchStyle } from "../../../../../js/utils.js";

let basePolaroidStyle = new CSSStyleSheet();
fetchStyle("views/gallery-view/components/polaroid/base-polaroid/base-polaroid.css", basePolaroidStyle);

/**
 * The Base Polaroid object.
 */
export default class BasePolaroid extends BaseElement {
    /**
     * @param {boolean} isAngledLeft 
     * @param {boolean} isBlank 
     */
    constructor(isAngledLeft, isBlank) {
        super();

        this.shadowRoot.adoptedStyleSheets.push(basePolaroidStyle);

        /**
         * ```True``` if the polaroid should face left, otherwise faces right.
         *  @type Boolean
         */
        this.isAngledLeft = isAngledLeft;
        /**
         * ```True``` if the polaroid does not have a picture inside.
         * @type Boolean
         */
        this.isBlank = isBlank;

        // The lazy loading observer
        // Based on: https://www.codepel.com/vanilla-javascript/javascript-image-loaded/
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    addRemoveTransparent([this.queryByClassName("frame")], false);
                    observer.disconnect();
                }
            });
        });
        obs.observe(this);
    }

    connectedCallback() {
        const polaroid = this.queryByClassName("frame");
        polaroid.classList.add(this.getRandomAngleClass());
    }

    /**
     * @returns a class name to angle the polaroid.
     */
    getRandomAngleClass() {
        return (this.isAngledLeft ? "left-" : "right-") + Math.floor(Math.random() * 4 + 1);
    }
}