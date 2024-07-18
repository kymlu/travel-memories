export default class BasePolaroid extends HTMLElement {
    constructor(isAngledLeft, isBlank) {
        super();
        this.isAngledLeft = isAngledLeft;
        this.isBlank = isBlank;
    }

    /**
     * @param {boolean} newValue
     */
    set setNewAngle(newValue) {
        if (newValue != this.isAngledLeft) {
            this.isAngledLeft = newValue;
            this.classList.remove(this.classList.filter(item => {
                item.startsWith("left-") || item.startsWith("right")
            }));
            this.classList.add((this.isAngledLeft ? "left-" : "right-") + Math.floor(Math.random() * 4 + 1))
        }
    }
}