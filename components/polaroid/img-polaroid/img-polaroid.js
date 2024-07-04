class ImagePolaroid extends BasePolaroid {
    constructor(isAngledLeft, src, isFavourite, date, offset, enCaption, jpCaption) {
        super(isAngledLeft, false);

        this.src = src;
        this.isFavourite = isFavourite;
        this.date = this.getPictureDate(new Date(date), offset);
        this.enCaption = enCaption;
        this.jpCaption = jpCaption;

        // Get HTML and CSS
        fetch("components/polaroid/img-polaroid/img-polaroid.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            })

        fetch("components/polaroid/img-polaroid/img-polaroid.css")
            .then(response => response.text())
            .then(css => {
                const style = document.createElement("style");
                style.textContent = css;
                this.appendChild(style);
            });

        fetch("components/polaroid/base-polaroid/base-polaroid.css")
            .then(response => response.text())
            .then(css => {
                const style = document.createElement("style");
                style.textContent = css;
                this.appendChild(style);
            });

        this.title = getBilingualText("Expand image", "画像を拡大する");

        // Based on: https://www.codepel.com/vanilla-javascript/javascript-image-loaded/
        // The lazy loading observer
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        const polaroid = this.querySelector(".polaroid-frame");
                        polaroid.classList.add((this.isAngledLeft ? "left-" : "right-") + Math.floor(Math.random() * 4 + 1))

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
                    }, 0);
                }
            });
        });
        obs.observe(this);
    }

    connectedCallback() { }

    // TODO: put this in a utility class
    getPictureDate(date, picOffset) {
        // picOffset is in hours
        const localOffset = now.getTimezoneOffset();
        return new Date(date.getTime() - ((picOffset * -60) - localOffset) * 60000);
    }

    getEnglishDate() {
        return MONTH_NAMES[this.date.getMonth()] + " " +
            this.date.getDate() + ", " +
            this.date.getFullYear();
    }

    getJapaneseDate() {
        return this.date.getFullYear() + "年" +
            (this.date.getMonth() + 1) + "月" +
            this.date.getDate() + "日";
    }
}

window.customElements.define("img-polaroid", ImagePolaroid);