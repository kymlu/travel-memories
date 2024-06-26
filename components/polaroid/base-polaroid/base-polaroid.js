class BasePolaroid extends HTMLElement {
    constructor(){
        super();

        // Get HTML and CSS
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

    static getObservedAttributes(){
        return ["isAngledLeft"];
    }

    // TODO: make sure this works
    attributeChangedCallback(attrName, oldVal, newVal) {
        console.log("changed")
        if (attrName == "isAngledLeft") {
            const polaroid = this.querySelector(".polaroid-frame");
            polaroid.classList.add(newVal === "true" ? "left-" : "right-") + Math.floor(Math.random() * 4 + 1);
        }
      }
}

window.customElements.define("base-polaroid", BasePolaroid);
