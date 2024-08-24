import BaseElement from "../../../../../js/base-element.js";
import { addRemoveTransparent } from "../../../../../js/utils.js";

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
                    addRemoveTransparent([this.shadowRoot.querySelector(".polaroid-frame")], false);
                    observer.disconnect();
                }
            });
        });
        obs.observe(this);
    }

    connectedCallback() {
        const polaroid = this.shadowRoot.querySelector(".polaroid-frame");
        polaroid.classList.add(this.getRandomAngleClass());
    }

    /**
     * Sets a new angle for the polaroid to angle itself.
     * @param {boolean} newValue - the new value of ```isAngledLeft```.
     */
    set setNewAngle(newValue) {
        if (newValue != this.isAngledLeft) {
            this.isAngledLeft = newValue;
            this.classList.remove(this.classList.filter(item => {
                item.startsWith("left-") || item.startsWith("right")
            }));
            this.classList.add(this.getRandomAngleClass());
        }
    }

    /**
     * @returns a class name to angle the polaroid.
     */
    getRandomAngleClass() {
        return (this.isAngledLeft ? "left-" : "right-") + Math.floor(Math.random() * 4 + 1);
    }
}