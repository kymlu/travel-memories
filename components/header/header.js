import BaseElement from "../../js/base-element.js";
import { ATTRIBUTES, CUSTOM_EVENT_TYPES } from "../../js/constants.js";
import { isGalleryView, isMapView, isStartView } from "../../js/globals.js";
import {
    addClickListeners,
    toggleClass,
    toggleNoDisplay,
    toggleTransparent,
    fetchInnerHtml,
    flipArrow,
    setBilingualProperty
} from "../../js/utils.js";

/** The CustomHeader class. */
export default class CustomHeader extends BaseElement {
    constructor() {
        super();
        this.buttons = {};
        this.sections = {};
        document.addEventListener(CUSTOM_EVENT_TYPES.NEW_COUNTRY_SELECTED,
            (event) => {
                this.handleNewCountry(event.detail.country)
            });
    }

    connectedCallback() {
        fetchInnerHtml("components/header/header.html", this, true)
            .then(() => {
                this.classList.add("opacity-transition");

                /** CustomHeader sections */
                this.sections = {
                    header: this.shadowRoot.querySelector("header"),
                    left: this.queryById("left-section"),
                    centre: this.queryById("center-section"),
                    right: this.queryById("right-section"),
                };

                /** CustomHeader buttons */
                this.buttons = {
                    globe: this.queryById("globe-btn"),
                    map: this.queryById("map-btn"),
                    regionDropdown: this.queryById("rgn-title-btn"),
                    regionInfo: this.queryById("region-info-btn"),
                    filter: this.queryById("filter-btn"),
                    creator: this.queryById("creator-btn")
                };

                const loadingCompleteEvent = new CustomEvent(CUSTOM_EVENT_TYPES.LOADING_COMPLETE);
                this.dispatchEvent(loadingCompleteEvent);

                setBilingualProperty([
                    [this.buttons.globe, "Return to country picker", "国の選択へ戻る"],
                    [this.buttons.map, "Return to map", "地図に戻る"],
                    [this.buttons.creator, "About the site", "このサイトについて"],
                    [this.buttons.filter, "Filter Pictures", "写真をフィルターする"]
                ], ATTRIBUTES.TITLE);
            });
    }

    getHeight() {
        return this.sections.header.getBoundingClientRect().height;
    }

    setButtonFunctions(globeFunc, mapFunc, regionDropdownFunc, infoFunc, filterFunc, creatorFunc) {
        addClickListeners([
            [this.buttons.globe, globeFunc],
            [this.buttons.map, mapFunc],
            [this.buttons.regionDropdown, regionDropdownFunc],
            [this.buttons.regionInfo, infoFunc],
            [this.buttons.filter, filterFunc],
            [this.buttons.creator, creatorFunc]
        ]);
    }

    /** Shows/hides the header.
     * @param {boolean} isVisible 
     */
    toggleVisibility(isVisible) {
        toggleTransparent([this], !isVisible);
    }

    /** Shows/hides the filter indicator.
     * @param {boolean} isVisible 
     */
    toggleFilterIndicator(isVisible) {
        toggleNoDisplay([this.queryById("filter-indicator")], !isVisible);
    }

    setRegionTitle(newContent) {
        this.queryById("rgn-name").innerText = newContent;
    }

    flipRegionNameArrow(isUp) {
        flipArrow(this.queryById("rgn-name-arrow"), isUp);
    }

    /** Changes values when the selected country changes. */
    handleNewCountry(newCountry) {
        setBilingualProperty([
            [this.buttons.regionDropdown, `Change ${newCountry.regionTypeEn}`, `${newCountry.regionTypeJp}を切り替える`],
            [this.buttons.regionInfo, `Toggle ${newCountry.regionTypeEn} info`, `${newCountry.regionTypeJp}の情報をトグル`],
        ], ATTRIBUTES.TITLE);
    }

    /** Changes layouts when the view changes. */
    onChangeView() {
        if (isStartView()) {
            // Only shows the creator button
            toggleClass([this.sections.right], "justify-end", true);
            toggleNoDisplay([this.sections.left, this.sections.centre], true);
        } else if (isMapView()) {
            // Only shows the creator and globe buttons
            toggleClass([this.sections.left], "left-section", false);
            toggleClass([this.sections.right], "right-section", false);
            toggleClass([this.sections.right], "justify-end", false);
            toggleClass([this], "fixed-top", true);
            toggleClass([this], "sticky-top", false);
            this.sections.header.style.backgroundColor = "transparent";
            toggleNoDisplay([this.buttons.globe, this.sections.left], false);
            toggleNoDisplay([this.sections.centre, this.buttons.map, this.buttons.filter, this.buttons.regionInfo], true);
        } else if (isGalleryView()) {
            // Shows all buttons except the globe button
            toggleClass([this.sections.left], "left-section", true);
            toggleClass([this.sections.right], "right-section", true);
            toggleClass([this], "sticky-top", true);
            toggleClass([this], "fixed-top", false);
            this.sections.header.style.backgroundColor = "white";
            toggleNoDisplay([this.buttons.globe], true);
            toggleNoDisplay([this.sections.centre, this.buttons.filter, this.buttons.map, this.buttons.regionInfo], false);
        } else {
            console.error("View does not exist.");
        }
        const headerUpdatedEvent = new CustomEvent(CUSTOM_EVENT_TYPES.HEADER_UPDATED, { detail: { header: this } });
        document.dispatchEvent(headerUpdatedEvent);
    }
}

window.customElements.define("custom-header", CustomHeader);