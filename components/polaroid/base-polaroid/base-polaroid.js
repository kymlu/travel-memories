class BasePolaroid extends HTMLElement {
    constructor(isAngledLeft, isBlank) {
        super();
        this.isAngledLeft = isAngledLeft;
        this.isBlank = isBlank;

        fetch("components/polaroid/base-polaroid/base-polaroid.css")
            .then(response => response.text())
            .then(css => {
                const style = document.createElement("style");
                style.textContent = css;
                this.appendChild(style);
            });

        fetch("css/style.css")
            .then(response => response.text())
            .then(css => {
                const style = document.createElement("style");
                style.textContent = css;
                this.appendChild(style);
            });
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