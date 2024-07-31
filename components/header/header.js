import { ATTRIBUTES } from "../../js/constants.js";
import { isGalleryView, isMapView, isStartView } from "../../js/globals.js";
import {
    addClickListeners,
    addRemoveClass,
    addRemoveNoDisplay,
    addRemoveTransparent,
    setBilingualAttribute
} from "../../js/utils.js";

/** The CustomHeader class. */
export default class CustomHeader extends HTMLElement {
    constructor(globeFunc, mapFunc, regionDropdownFunc, infoFunc, filterFunc, creatorFunc) {
        super();
        this.globeFunc = globeFunc;
        this.mapFunc = mapFunc;
        this.regionDropdownFunc = regionDropdownFunc;
        this.infoFunc = infoFunc;
        this.filterFunc = filterFunc;
        this.creatorFunc = creatorFunc;
        this.buttons = {};
        this.sections = {};

        fetch("components/header/header.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            })
            .catch(error => {
                console.error(`Error loading header.`, error);
            });;
    }

    connectedCallback() {
        setTimeout(() => {
            this.classList.add("opacity-transition");
            
            /** CustomHeader sections */
            this.sections = {
                left: this.querySelector("#left-section"),
                centre: this.querySelector("#rgn-title"),
                right: this.querySelector("#right-section"),
            };

            /** CustomHeader buttons */
            this.buttons = {
                globe: this.querySelector("#globe-btn"),
                map: this.querySelector("#map-btn"),
                regionDropdown: this.querySelector("#rgn-title-btn"),
                regionInfo: this.querySelector("#region-info-btn"),
                filter: this.querySelector("#filter-btn"),
                creator: this.querySelector("#creator-btn")
            };

            setTimeout(() => {
                setBilingualAttribute([
                    [this.buttons.globe, "Return to country picker", "国の選択へ戻る"],
                    [this.buttons.map, "Return to map", "地図に戻る"],
                    [this.buttons.creator, "About the site", "このサイトについて"],
                    [this.buttons.filter, "Filter Pictures", "写真をフィルターする"]
                ], ATTRIBUTES.TITLE);
                
                addClickListeners([
                    [this.buttons.globe, this.globeFunc],
                    [this.buttons.map, this.mapFunc],
                    [this.buttons.regionDropdown, this.regionDropdownFunc],
                    [this.buttons.regionInfo, this.infoFunc],
                    [this.buttons.filter, this.filterFunc],
                    [this.buttons.creator, this.creatorFunc]
                ]);
            }, 50);

        }, 50);
    }

    /** Shows/hides the header.
     * @param {boolean} isVisible 
     */
    toggleVisibility(isVisible) {
        addRemoveTransparent([this], !isVisible);
    }

    /** Shows/hides the filter indicator.
     * @param {boolean} isVisible 
     */
    toggleFilterIndicator(isVisible) {
        addRemoveNoDisplay("filter-indicator", !isVisible);
    }

    /** Changes values when the selected country changes. */
    onChangeCountry(englishRegionName, japaneseRegionName) {
        setBilingualAttribute([
            [this.buttons.regionDropdown, `Change ${englishRegionName}`, `${japaneseRegionName}を切り替える`],
            [this.buttons.info, `Toggle ${englishRegionName} info`, `${japaneseRegionName}の情報をトグル`],
        ], ATTRIBUTES.TITLE);
    }

    /** Changes layouts when the view changes. */
    onChangeView() {
        if (isStartView()) {
            // Only shows the creator button
            addRemoveClass([this.sections.right], "justify-end", true);
            addRemoveNoDisplay([this.sections.left, this.sections.centre], true);
        } else if (isMapView()) {
            // Only shows the creator and globe buttons
            addRemoveClass([this.sections.left], "left-section", false);
            addRemoveClass([this.sections.right], "right-section", false);
            addRemoveClass([this.sections.right], "justify-end", false);
            this.style.position = "fixed";
            this.style.backgroundColor = "transparent";
            addRemoveNoDisplay([this.buttons.globe, this.sections.left], false);
            addRemoveNoDisplay([this.sections.centre, this.buttons.map, this.buttons.filter, this.buttons.regionInfo], true);
        } else if (isGalleryView()) {
            // Shows all buttons except the globe button
            addRemoveClass(this.sections.left, "left-section", true);
            addRemoveClass(this.sections.right, "right-section", true);
            this.style.position = "sticky";
            this.style.backgroundColor = "white";
            addRemoveNoDisplay([this.buttons.globe], true);
            addRemoveNoDisplay([this.sections.centre, this.buttons.map, this.buttons.regionInfo], false);
        } else {
            console.error("View does not exist.");
        }
    }
}

window.customElements.define("custom-header", CustomHeader);
