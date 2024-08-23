import { ATTRIBUTES } from "../../js/constants.js";
import { isGalleryView, isMapView, isStartView } from "../../js/globals.js";
import {
    addClickListeners,
    addRemoveClass,
    addRemoveNoDisplay,
    addRemoveTransparent,
    flipArrow,
    setBilingualProperty
} from "../../js/utils.js";

/** The CustomHeader class. */
export default class CustomHeader extends HTMLElement {
    constructor() {
        super();
        this.globeFunc = null;
        this.mapFunc = null;
        this.regionDropdownFunc = null;
        this.infoFunc = null;
        this.filterFunc = null;
        this.creatorFunc = null;
        this.buttons = {};
        this.sections = {};

        fetchInnerHtml("components/header/header.html", this);
    }

    connectedCallback() {
        setTimeout(() => {
            this.classList.add("opacity-transition");

            /** CustomHeader sections */
            this.sections = {
                header: this.querySelector("header"),
                left: this.querySelector("#left-section"),
                centre: this.querySelector("#center-section"),
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
                setBilingualProperty([
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

    getHeight() {
        return this.sections.header.getBoundingClientRect().height;
    }

    setButtonFunctions(globeFunc, mapFunc, regionDropdownFunc, infoFunc, filterFunc, creatorFunc) {
        this.globeFunc = globeFunc;
        this.mapFunc = mapFunc;
        this.regionDropdownFunc = regionDropdownFunc;
        this.infoFunc = infoFunc;
        this.filterFunc = filterFunc;
        this.creatorFunc = creatorFunc;
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

    setRegionTitle(newContent) {
        this.querySelector("#rgn-name").innerHTML = newContent;
    }

    flipRegionNameArrow(isUp) {
        flipArrow(this.querySelector("#rgn-name-arrow"), isUp);
    }

    /** Changes values when the selected country changes. */
    onChangeCountry(englishRegionName, japaneseRegionName) {
        setBilingualProperty([
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
            addRemoveClass([this], "fixed-top", true);
            addRemoveClass([this], "sticky-top", false);
            this.sections.header.style.backgroundColor = "transparent";
            addRemoveNoDisplay([this.buttons.globe, this.sections.left], false);
            addRemoveNoDisplay([this.sections.centre, this.buttons.map, this.buttons.filter, this.buttons.regionInfo], true);
        } else if (isGalleryView()) {
            // Shows all buttons except the globe button
            addRemoveClass([this.sections.left], "left-section", true);
            addRemoveClass([this.sections.right], "right-section", true);
            addRemoveClass([this], "sticky-top", true);
            addRemoveClass([this], "fixed-top", false);
            this.sections.header.style.backgroundColor = "white";
            addRemoveNoDisplay([this.buttons.globe], true);
            addRemoveNoDisplay([this.sections.centre, this.buttons.filter, this.buttons.map, this.buttons.regionInfo], false);
        } else {
            console.error("View does not exist.");
        }
    }
}

window.customElements.define("custom-header", CustomHeader);
