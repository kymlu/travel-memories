class ImagePolaroid extends BasePolaroid {
    constructor(){
        super();

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
            
        fetch("css/style.css")
            .then(response => response.text())
            .then(css => {
                const style = document.createElement("style");
                style.textContent = css;
                this.appendChild(style);
            });
    }

    // TODO: put this in a utility class
    getPictureDate(date, picOffset){
        // picOffset is in hours
        const localOffset = now.getTimezoneOffset();
        return new Date(date.getTime() - ((picOffset * -60) - localOffset) * 60000);
    }
    
    getEnglishDate(date, isFullDate, picOffset) {
        let hours = date.getHours();
        return (isFullDate ? dayNamesEn[date.getDay()] +", " : "") +
            monthNames[date.getMonth()] + " " + 
            date.getDate() + ", " + 
            date.getFullYear() + 
            (isFullDate ? 
                " " + (hours > 12 ? hours - 12 : hours).toString() + ":" + 
                date.getMinutes().toString().padStart(2, "0") + ":" + 
                date.getSeconds().toString().padStart(2, "0")  + 
                (hours >= 12 ? " PM" : " AM") + 
                (picOffset > 0 ? " +" : " -") + 
                Math.floor(picOffset) + ":" + 
                String((picOffset - Math.floor(picOffset)) * 60).padStart(2, "0")
                : "");
    }
    
    getJapaneseDate(date, isFullDate, picOffset) {
        let hours = date.getHours();
        return date.getFullYear() + "年" + 
            (date.getMonth() + 1) + "月" + 
            date.getDate() + "日" + 
            (isFullDate ? 
                "（" + dayNamesJp[date.getDay()] + "）" +
                (hours >= 12 ? "午後" : "午前") + 
                (hours > 12 ? hours - 12 : hours).toString() + ":" + 
                date.getMinutes().toString().padStart(2, "0") + ":" + 
                date.getSeconds().toString().padStart(2, "0")  + 
                (picOffset >= 0 ? "+" : "") + 
                Math.floor(picOffset) + ":" + 
                String((picOffset - Math.floor(picOffset)) * 60).padStart(2, "0")
                : "");
    }

    connectedCallback(){
        // Based on: https://www.codepel.com/vanilla-javascript/javascript-image-loaded/
        // The lazy loading observer
        this.title = getBilingualText("Expand image", "画像を拡大する");
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        const polaroid = this.querySelector(".polaroid-frame");
                        polaroid.classList.add((this.getAttribute("isAngledLeft") === "true" ? "left-" : "right-") + Math.floor(Math.random() * 4 + 1))

                        const img = polaroid.querySelector("img");
                        if(img){
                            img.onload = function () {
                                if (this.width > this.height) {
                                    img.classList.add("landscape-img");
                                } else {
                                    img.classList.add("portrait-img");
                                }
                                setTimeout(() => {
                                    addRemoveTransparent([img], false);			
                                }, defaultTimeout);
                            }
                            img.setAttribute("src", this.getAttribute("src"));

                            
                        }
                        const dates = polaroid.querySelector(".polaroid-date").querySelectorAll("span");
                        if(dates){
                            if(this.getAttribute("date") && this.getAttribute("offset")){
                                let date = this.getPictureDate(new Date(this.getAttribute("date")), this.getAttribute("offset"));
                                dates[0].innerHTML = this.getEnglishDate(date, false, this.getAttribute("offset"));
                                dates[1].innerHTML = this.getJapaneseDate(date, false, this.getAttribute("offset"));
                            } else {
                                dates[0].innerHTML = "";
                                dates[1].innerHTML = "";
                            }
                        }

                        const captions = polaroid.querySelector(".polaroid-caption-text-container").querySelectorAll("span");
                        if(captions){
                            if (this.getAttribute("enCaption")){
                                captions[0].innerHTML = this.getAttribute("enCaption");
                            }
                            if (this.getAttribute("jpCaption")){
                                captions[1].innerHTML = this.getAttribute("jpCaption");
                            }
                        }

                        if(this.getAttribute("isFavourite") === "true"){
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

    static getObservedAttributes(){
        return ["src", "isFavourite", "date", "offset", "enCaption", "jpCaption"];
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

window.customElements.define("img-polaroid", ImagePolaroid);