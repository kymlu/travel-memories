import { isGalleryView, isMapView, isStartView } from "../../js/globals.js";
import {
    addClickListeners,
    addRemoveClass,
    addRemoveNoDisplay,
    addRemoveTransparent,
    setBilingualAttribute
} from "../../js/utils.js";

/** The Header class. */
export default class Header {
    constructor(header, regionDropdownFunc, globeFunc, mapFunc, infoFunc, filterFunc, creatorFunc) {
        this.headerElement = header;

        /** Header sections */
        this.sections = {
            left: this.headerElement.querySelector("#left-section"),
            right: this.headerElement.querySelector("#right-section"),
        };

        /** Header buttons */
        this.buttons = {
            globe: this.headerElement.querySelector("#globe-btn"),
            map: this.headerElement.querySelector("#map-btn"),
            regionDropdown: this.headerElement.querySelector("#rgn-title-btn"),
            regionInfo: this.headerElement.querySelector("#region-info-btn"),
            filter: this.headerElement.querySelector("#filter-btn"),
            creator: this.headerElement.querySelector("#creator-btn")
        };

        setBilingualAttribute([
            [this.buttons.globe, "Return to country picker", "国の選択へ戻る"],
            [this.buttons.map, "Return to map", "地図に戻る"],
            [this.buttons.creator, "About the site", "このサイトについて"],
            [this.buttons.filter, "Filter Pictures", "写真をフィルターする"]
        ], "title");

        addClickListeners([
            [this.buttons.regionDropdown, regionDropdownFunc],
            [this.buttons.creator, creatorFunc],
            [this.buttons.globe, globeFunc],
            [this.buttons.map, mapFunc],
            [this.buttons.filter, filterFunc],
            [this.buttons.regionInfo, infoFunc]
        ]);
    }

    /** Shows/hides the header.
     * @param {boolean} isVisible 
     */
    toggleVisibility(isVisible) {
        addRemoveTransparent(this.headerElement, !isVisible);
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
        ], "title");
    }

    /** Changes layouts when the view changes. */
    onChangeView() {
        if (isStartView()) {
            // Only shows the creator button
            addRemoveClass([this.sections.right], "justify-end", true);
            addRemoveTransparent([this.headerElement], true);
            addRemoveNoDisplay([this.sections.left], true);
        } else if (isMapView()) {
            // Only shows the creator and globe buttons
            addRemoveClass([this.sections.left], "left-section", false);
            addRemoveClass([this.sections.right], "right-section", false);
            addRemoveClass([this.sections.right], "justify-end", false);
            this.headerElement.style.position = "fixed";
            this.headerElement.style.backgroundColor = "transparent";
            addRemoveNoDisplay([this.buttons.globe, this.sections.left], false);
            addRemoveNoDisplay([this.buttons.map, this.buttons.regionDropdown, this.buttons.filter, this.buttons.regionInfo], true);
        } else if (isGalleryView()) {
            // Shows all buttons except the globe button
            addRemoveClass(this.sections.left, "left-section", true);
            addRemoveClass(this.sections.right, "right-section", true);
            this.headerElement.style.position = "sticky";
            this.headerElement.style.backgroundColor = "white";
            addRemoveNoDisplay([this.buttons.globe], true);
            addRemoveNoDisplay([this.buttons.map, this.buttons.regionInfo, this.buttons.regionDropdown], false);
        } else {
            console.error("View does not exist.");
        }
    }
}

window.customElements.define("header-component", Header);
