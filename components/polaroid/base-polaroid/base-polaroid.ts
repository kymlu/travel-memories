export default class BasePolaroid extends HTMLElement {
    isAngledLeft: boolean;
    isBlank: boolean;
    
    constructor(isAngledLeft: boolean, isBlank: boolean) {
        super();
        this.isAngledLeft = isAngledLeft;
        this.isBlank = isBlank;
    }

    set setNewAngle(newValue: boolean) {
        if (newValue != this.isAngledLeft) {
            this.isAngledLeft = newValue;
            this.classList.remove(Array.from(this.classList).find(item => {
                item.startsWith("left-") || item.startsWith("right")
            }) ?? "");
            this.classList.add((this.isAngledLeft ? "left-" : "right-") + Math.floor(Math.random() * 4 + 1))
        }
    }
}