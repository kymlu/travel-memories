class InfoPopup extends BasePopup {
    constructor(){
        super();

        fetch("components/popup/info-popup/info-popup.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            });

        // fetch("components/popup/base-popup/base-popup.css")
        //     .then(response => response.text())
        //     .then(css => {
        //         const style = document.createElement("style");
        //         style.textContent = css;
        //         this.appendChild(style);
        //     });
    }

    connectedCallback(){
        super.connectedCallback();
    }

    setupPopup(){
        super.setupPopup();
        this.querySelectorAll(".action-btn").forEach(element => {
            element.addEventListener("click", () => { this.goToGithub(); });
        });
    }

    openPopup(){
        super.openPopup();
    }

    closePopup(forceClose) {
        super.closePopup(forceClose);
        
        const infoClosedEvent = new CustomEvent('info-popup-closed');
        this.dispatchEvent(infoClosedEvent);
    }

    goToGithub(){
        window.open("https://github.com/kymlu/travel-memories");
    }
}

window.customElements.define("info-popup", InfoPopup);