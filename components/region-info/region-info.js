import { ATTRIBUTES, DEFAULT_TIMEOUT } from "../../js/constants.js";
import { getAppColor, getCurrentCountry, startHandleDrag } from "../../js/globals.js";
import {
    addRemoveTransparent, addRemoveNoDisplay, getBilingualText,
    setBilingualProperty, addClickListeners, scrollToTop,
    addRemoveClass
} from "../../js/utils.js";

/** The Region Info. */
export default class RegionInfo extends HTMLElement {
    #elements;

    constructor(headerElement) {
        super();
        this.isVisible = false;
        this.isThrottling = false;
        this.header = headerElement;
        this.hasMapLoaded = false;
        this.currentCountry = null;
        this.isNewGallery = true;

        fetch("components/region-info/region-info.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            })
            .catch(error => {
                console.error("Error loading fullscreen.", error);
            });
        this.#elements = {};
    }

    connectedCallback() {
        setTimeout(() => {
            this.#elements = {
                regionInfo: this.querySelector("#rgn-info"),
                background: this.querySelector("#rgn-info-bg"),
                drawer: this.querySelector("#rgn-info-drawer"),
                map: this.querySelector("#country-map-mini"),
                areasTitle: this.querySelector("#areas-title"),
                datesSection: this.querySelector("#rgn-info-dates"),
                dates: this.querySelector("#rgn-dates"),
                descriptionEnglish: this.querySelector("#rgn-desc-eng"),
                descriptionJapanese: this.querySelector("#rgn-desc-jp"),
                descriptionTitle: this.querySelector("#description-title"),
                areasList: this.querySelector("#rgn-areas"),
                divider: this.querySelector("#rgn-info-handle")
            };

            setTimeout(() => {
                this.#elements.divider.addEventListener("touchstart", e => { startHandleDrag(e, "rgn-info-handle") }, false);
                addClickListeners([
                    [this.#elements.background, this.toggleVisibility.bind(this, false)],
                ]);
                addRemoveTransparent([this.#elements.drawer]);
                addRemoveNoDisplay([this], true);
            }, 50);
        }, 50);
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
                [this.#elements.descriptionTitle, "About", "国について"]], ATTRIBUTES.INNERHTML);

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
        this.querySelector(".rgn-info").scrollTo({ top: 0, behavior: "smooth" });
    }

    /** Shows the region info section.
     * @param {true} isForced 
     */
    show(isForced) {
        if (this.isNewGallery) {
            this.repositionBackground();
        }

        this.isVisible = true;
        addRemoveTransparent([this.#elements.background], false);
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
        addRemoveTransparent([this.#elements.background], true);
        setTimeout(() => {
            addRemoveClass([this.#elements.background], "visibility-hidden", true);
            this.#elements.regionInfo.style.position = "relative";
            this.#elements.regionInfo.style.top = "0";
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
        if (!this.#elements.map.hasAttribute("data") || this.#elements.map.data == "") return;
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
            }
        }, 50);
    }
}

window.customElements.define("region-info", RegionInfo);