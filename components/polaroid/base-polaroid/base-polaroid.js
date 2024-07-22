/**
 * The Base Polaroid object.
 */
export default class BasePolaroid extends HTMLElement {
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
    getRandomAngleClass(){
        return (this.isAngledLeft ? "left-" : "right-") + Math.floor(Math.random() * 4 + 1);
    }
}