import BasePolaroid from "../base-polaroid/base-polaroid.js"
import { getBilingualText } from '../../../js/utility.js';

export default class TextPolaroid extends BasePolaroid {
    constructor(isAngledLeft, text, regionId, officialRegionName) {
        super(isAngledLeft, true);
        this.text = text;
        this.regionId = regionId;
        this.officialRegionName = officialRegionName;

        fetch("components/polaroid/txt-polaroid/txt-polaroid.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            })

        // fetch("components/polaroid/txt-polaroid/txt-polaroid.css")
        //     .then(response => response.text())
        //     .then(css => {
        //         const style = document.createElement("style");
        //         style.textContent = css;
        //         this.appendChild(style);
        //     });
    }

    connectedCallback() {
        // Based on: https://www.codepel.com/vanilla-javascript/javascript-image-loaded/
        // The lazy loading observer
        this.title = getBilingualText("See images from this" + this.officialRegionName, "この地域の写真を表示する");
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        const polaroid = this.querySelector(".polaroid-frame");
                        polaroid.classList.add((this.isAngledLeft ? "left-" : "right-") + Math.floor(Math.random() * 4 + 1))

                        const polaroidImg = this.querySelector(".polaroid-img");
                        polaroidImg.innerHTML = this.text;

                        setTimeout(() => {
                            addRemoveTransparent([polaroid], false);
                        }, 75);
                        observer.disconnect();
                    }, 0);
                }
            });
        });
        obs.observe(this);
    }
}

window.customElements.define("txt-polaroid", TextPolaroid);