import CustomHeader from "../../../../../components/header/header.js";
import { ATTRIBUTES, CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT } from "../../../../../js/constants.js";
import { getAppColor, getCurrentCountry, getHeader } from "../../../../../js/globals.js";
import {
    addRemoveTransparent, addRemoveNoDisplay, getBilingualText,
    setBilingualProperty, addClickListeners, scrollToTop,
    addRemoveClass,
    fetchInnerHtml,
    isPortraitMode
} from "../../../../../js/utils.js";
import BaseDrawer from "../base-drawer/base-drawer.js";

/** The Region Info. */
export default class RegionInfo extends BaseDrawer {
    #elements;

    constructor() {
        super();
        this.isVisible = false;
        this.isThrottling = false;
        /** @type {CustomHeader} */
        this.header = getHeader();
        document.addEventListener(CUSTOM_EVENT_TYPES.HEADER_CHANGED, (event) => { this.header = event.detail.header });
        this.hasMapLoaded = false;
        this.currentCountry = null;
        this.isNewGallery = true;
        this.#elements = {};
    }

    connectedCallback() {
        fetchInnerHtml("views/gallery-view/components/drawer/region-info/region-info.html", this, true)
            .then(() => {
                super.connectedCallback();
                this.#elements = {
                    regionInfo: this.shadowRoot.querySelector("#rgn-info"),
                    background: this.shadowRoot.querySelector("#rgn-info-bg"),
                    drawer: this.shadowRoot.querySelector("#rgn-info-drawer"),
                    map: this.shadowRoot.querySelector("#country-map-mini"),
                    areasTitle: this.shadowRoot.querySelector("#areas-title"),
                    datesSection: this.shadowRoot.querySelector("#rgn-info-dates"),
                    dates: this.shadowRoot.querySelector("#rgn-dates"),
                    descriptionEnglish: this.shadowRoot.querySelector("#rgn-desc-eng"),
                    descriptionJapanese: this.shadowRoot.querySelector("#rgn-desc-jp"),
                    descriptionTitle: this.shadowRoot.querySelector("#description-title"),
                    areasList: this.shadowRoot.querySelector("#rgn-areas"),
                };

                setTimeout(() => {
                    addClickListeners([
                        [this.#elements.background, this.toggleVisibility.bind(this, false)],
                    ]);
                    addRemoveTransparent([this.#elements.drawer]);
                    addRemoveNoDisplay([this], true);
                }, 50);
            });
    }

    dragDownFunction() {
        super.dragDownFunction();
        this.show(true);
    }

    dragUpFunction() {
        super.dragUpFunction();
        this.hide(true);
    }

    repositionBackground() {
        this.#elements.background.style.top = this.header.getHeight();
    }

    /** Makes value changes based on new country.
     * @param {string} countryId 
     */
    handleNewCountry() {
        addRemoveNoDisplay([this], false);
        this.currentCountry = getCurrentCountry();
        this.#elements.map.data = `assets/img/country/${this.currentCountry.id}.svg`;
    }

    /** Sets the info for a new region.
     * @param {any[]} regionList 
     * @param {any[]} areaList 
     * @param {boolean} isSingleRegionSelected 
     */
    setNewRegionInfo(regionList, areaList, isSingleRegionSelected, isNewGallery) {
        if (isNewGallery) {
            this.isNewGallery = true;
            addRemoveTransparent([this.#elements.regionInfo], true);
        } else {
            addRemoveTransparent([this.#elements.background], false);
            addRemoveClass([this.#elements.background], "visibility-hidden", false);
        }

        this.isVisible = true;

        if (isSingleRegionSelected) {
            addRemoveNoDisplay(this.#elements.datesSection, false);
            let currentRegion = regionList[0];
            setBilingualProperty([
                [this.#elements.areasTitle, "Areas", "所"],
                [this.#elements.dates, currentRegion.datesEnglish, currentRegion.datesJapanese],
                [this.#elements.descriptionTitle, "About", this.currentCountry.officialRegionNameJapanese + "について"]
            ], ATTRIBUTES.INNERHTML);

            [
                [this.#elements.descriptionEnglish, currentRegion.descriptionEnglish],
                [this.#elements.descriptionJapanese, currentRegion.descriptionJapanese],
                [this.#elements.areasList, areaList.map(area => {
                    return getBilingualText(area.englishName, area.japaneseName);
                }).sort().join(" | ")]
            ].forEach(([element, text]) => {
                element.innerHTML = text;
            });
            this.filterMiniMap(currentRegion);
        } else {
            addRemoveNoDisplay(this.#elements.datesSection, true);

            setBilingualProperty([
                [this.#elements.areasTitle, this.currentCountry.officialRegionNameEnglish + "s", this.currentCountry.officialRegionNameJapanese],
                [this.#elements.descriptionTitle, "About", "国について"],
                [this.shadowRoot.querySelector("#dates-title"), "Dates visited", "訪れた日付"]]
                , ATTRIBUTES.INNERHTML);

            [
                [this.#elements.descriptionEnglish, this.currentCountry.descriptionEnglish],
                [this.#elements.descriptionJapanese, this.currentCountry.descriptionJapanese],
                [this.#elements.areasList, regionList.map(area => {
                    return getBilingualText(area.englishName, area.japaneseName);
                }).sort().join(" | ")]
            ].forEach(([element, text]) => {
                element.innerHTML = text;
            });
            this.filterMiniMap(null);
        }
        this.shadowRoot.querySelector(".rgn-info").scrollTo({ top: 0, behavior: "smooth" });
    }

    /** Shows the region info section.
     * @param {true} isForced 
     */
    show(isForced) {
        if (this.isNewGallery) {
            this.repositionBackground();
        }

        if (isPortraitMode()) {
            this.shadowRoot.querySelector("#dates-title").scrollIntoView({ block: isPortraitMode() ? "end" : "start" });
        }

        this.isVisible = true;
        addRemoveTransparent([this.#elements.background, this.#elements.drawer], false);
        addRemoveClass([this.#elements.background], "visibility-hidden", false);
        if (isForced) {
            if (document.body.scrollTop < this.getBoundingClientRect().height) {
                scrollToTop(true);
            } else {
                this.#elements.regionInfo.style.position = "sticky";
                this.#elements.regionInfo.style.top = this.header.getHeight();
            }
        }
        if (this.isNewGallery) {
            addRemoveTransparent([this.#elements.regionInfo], false);
            this.isNewGallery = false;
        }
    }

    /** Hides the region info section.
     * @param {boolean} isForced 
     */
    hide(isForced) {
        this.isVisible = false;
        if (isForced) {
            let rgnInfoOffset = this.#elements.drawer.getBoundingClientRect().height;
            if (document.body.scrollTop <= rgnInfoOffset) {
                window.scrollTo({
                    top: rgnInfoOffset,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }
        addRemoveTransparent([this.#elements.background, this.#elements.drawer], true);
        setTimeout(() => {
            addRemoveClass([this.#elements.background], "visibility-hidden", true);
            this.#elements.regionInfo.style.position = "relative";
            this.#elements.regionInfo.style.top = "0";
            addRemoveTransparent([this.#elements.drawer], false);
        }, DEFAULT_TIMEOUT);
    }

    /** Shows/hides the pic info section if user scrolls to a certain point. */
    handleScroll() {
        if (this.isThrottling) return;

        this.isThrottling = true;
        setTimeout(() => {
            let rgnInfoOffset = this.getBoundingClientRect().height / 2;
            if (this.isVisible && document.body.scrollTop > rgnInfoOffset) {
                this.hide(false);
            } else if (!this.isVisible && document.body.scrollTop < rgnInfoOffset) {
                this.show(false);
            }
            this.isThrottling = false;
        }, 50);
    }

    /** Toggle the visibility of the region info section. */
    toggleVisibility(isVisible) {
        if (this.isVisible == isVisible) {
            return;
        }

        if (isVisible == undefined || isVisible == null) {
            isVisible = !this.isVisible;
        }

        if (isVisible) {
            this.show(true);
        } else {
            this.hide(true);
        }
    }

    /** Filter the mini map. */
    filterMiniMap(currentRegion) {
        if (!this.#elements.map.hasAttribute("data") || this.#elements.map.data == "") {
            setTimeout(() => {
                this.filterMiniMap(currentRegion);
                return;
            }, 0);
        };
        setTimeout(() => {
            const svgDoc = this.#elements.map.contentDocument;
            const appColour = getAppColor();
            const regionList = this.currentCountry.regionGroups.flatMap(grp => grp.regions);
            try {
                regionList.forEach(rgn => {
                    const rgnImg = svgDoc.getElementById(`${rgn.id}-img`);
                    if (rgnImg) {
                        if (currentRegion == null) {
                            if (rgn.visited) {
                                rgnImg.setAttribute("fill", appColour);
                            } else {
                                rgnImg.setAttribute("fill", "lightgrey");
                            }
                        } else if (rgn.id != currentRegion.id) {
                            rgnImg.setAttribute("fill", "none");
                        } else {
                            rgnImg.setAttribute("fill", appColour);
                        }
                        rgnImg.setAttribute("stroke", "none");
                    }
                });

                // zoom into the specific region
                const countryImg = svgDoc.getElementById(this.currentCountry.id + "-img");
                if (currentRegion) {
                    countryImg?.setAttribute("viewBox", currentRegion.viewbox);
                } else {
                    countryImg?.setAttribute("viewBox", `0 0 ${countryImg.width.baseVal.valueInSpecifiedUnits} ${countryImg.height.baseVal.valueInSpecifiedUnits}`);
                }
            } catch (error) {
                console.error(error);
                this.filterMiniMap(currentRegion);
            }
        }, 100);
    }
}

window.customElements.define("region-info", RegionInfo);