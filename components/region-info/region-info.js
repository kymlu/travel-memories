import { ATTRIBUTES, DEFAULT_TIMEOUT } from "../../js/constants.js";
import { startHandleDrag } from "../../js/globals.js";
import {
    addRemoveTransparent, addRemoveNoDisplay, getBilingualText, setBilingualProperty, addClickListeners
} from "../../js/utils.js";

/** The Region Info. */
export default class RegionInfo extends HTMLElement {
    constructor(headerElement) {
        super();
        this.isVisible = false;
        this.isThrottling = false;
        this.header = headerElement;
        this.hasMapLoaded = false;

        fetch("components/region-info/region-info.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            })
            .catch(error => {
                console.error("Error loading fullscreen.", error);
            });
        this.elements = {};
    }

    connectedCallback() {
        setTimeout(() => {
            this.elements = {
                background: this.querySelector("#rgn-info-bg"),
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
                this.elements.map.addEventListener("load", this.setMapLoaded.bind(this));
                this.elements.divider.addEventListener("touchstart", e => { startHandleDrag(e, "rgn-info-handle") }, false);
                addClickListeners([
                    ["rgn-info-bg", this.toggleVisibility],
                ]);
            }, 50);
        }, 50);
    }

    setMapLoaded(){
        this.hasMapLoaded = true;
        // TODO: Maybe filter map colours on load and change display and viewbox on region change?
    }

    /** Makes value changes based on new country.
     * @param {string} countryId 
     */
    handleNewCountry(countryId) {
        this.elements.map.data = `assets/img/country/${countryId}.svg`;
    }

    /** Sets the info for a new region.
     * @param {any} currentCountry 
     * @param {any[]} regionList 
     * @param {any[]} areaList 
     * @param {boolean} isSingleRegionSelected 
     */
    setNewRegionInfo(currentCountry, regionList, areaList, isSingleRegionSelected) {
        this.isVisible = true;

        if (isSingleRegionSelected) {
            addRemoveNoDisplay(this.elements.datesSection, false);
            let currentRegion = regionList[0];
            setBilingualProperty([
                [this.elements.areasTitle, "Areas", "所"],
                [this.elements.dates, currentRegion.datesEnglish, currentRegion.datesJapanese],
                [this.elements.descriptionTitle, "About", currentCountry.officialRegionNameJapanese + "について"]
            ], ATTRIBUTES.INNERHTML);

            [
                [this.elements.descriptionEnglish, currentRegion.descriptionEnglish],
                [this.elements.descriptionJapanese, currentRegion.descriptionJapanese],
                [this.elements.areasList, areaList.map(area => {
                    return getBilingualText(area.englishName, area.japaneseName);
                }).sort().join(" | ")]
            ].forEach(([element, text]) => {
                element.innerHTML = text;
            });
        } else {
            addRemoveNoDisplay(this.elements.datesSection, true);

            setBilingualProperty([
                [this.elements.areasTitle, currentCountry.officialRegionNameEnglish + "s", currentCountry.officialRegionNameJapanese],
                [this.elements.descriptionTitle, "About", "国について"]], ATTRIBUTES.INNERHTML);

            [
                [this.elements.descriptionEnglish, currentCountry.descriptionEnglish],
                [this.elements.descriptionJapanese, currentCountry.descriptionJapanese],
                [this.elements.areasList, regionList.map(area => {
                    return getBilingualText(area.englishName, area.japaneseName);
                }).sort().join(" | ")]
            ].forEach(([element, text]) => {
                element.innerHTML = text;
            });
        }
    }

    /** Shows the region info section.
     * @param {true} isForced 
     */
    show(isForced) {
        this.isVisible = true;
        addRemoveTransparent(this.elements.background, false);
        this.elements.background.classList.remove("visibility-hidden");
        if (isForced) {
            if (document.body.scrollTop < this.getBoundingClientRect().height) {
                scrollToTop(true);
            } else {
                this.style.position = "sticky";
                this.style.top = this.header.getBoundingClientRect().height; // TODO: ??
            }
        }
    }

    /** Hides the region info section.
     * @param {boolean} isForced 
     */
    hide(isForced) {
        this.isVisible = false;
        if (isForced) {
            let rgnInfoOffset = this.getBoundingClientRect().height;
            if (document.body.scrollTop <= rgnInfoOffset) {
                window.scrollTo({
                    top: rgnInfoOffset,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }
        addRemoveTransparent(this.elements.background, true);
        setTimeout(() => {
            this.elements.background.classList.add("visibility-hidden");
            this.style.position = "relative";
            this.style.top = "0";
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
        }, 250);
    }

    /** Toggle the visibility of the region info section. */
    toggleVisibility(isVisible) {
        if (this.isVisible == isVisible) {
            return;
        }

        if (isVisible == undefined) {
            isVisible = !this.isVisible;
        }

        if (isVisible) {
            this.show(true);
        } else {
            this.hide(true);
        }
    }

    /** Filter the mini map. */
    filterMiniMap(currentCountry, currentRegion) {
        setTimeout(() => {
            addRemoveTransparent([this.elements.map], true);
            console.log(this.elements.map)
            const svgDoc = this.elements.map.contentDocument;
            const regionList = currentCountry.regionGroups.flatMap(grp => grp.regions);
            try {
                regionList.forEach(rgn => {
                    const rgnImg = svgDoc.getElementById(`${rgn.id}-img`);
                    if (rgnImg) {
                        if (currentRegion == null) {
                            if (rgn.visited) {
                                rgnImg.setAttribute("fill", getAppColor());
                            } else {
                                rgnImg.setAttribute("fill", "lightgrey");
                            }
                            rgnImg.setAttribute("stroke", "none");
                        } else if (rgn.id != currentRegion.id) {
                            rgnImg.setAttribute("fill", "none");
                            rgnImg.setAttribute("stroke", "none");
                        } else {
                            rgnImg.setAttribute("fill", getAppColor());
                            rgnImg.setAttribute("stroke", "none");
                        }
                    }
                });
    
                // zoom into the specific region
                if (currentRegion) {
                    const countryImg = svgDoc.getElementById(currentCountry.id + "-img");
                    countryImg.setAttribute("viewBox", currentRegion.viewbox);
                }
            } catch (error) {
                console.error(error);
            } finally {
                // show map
                setTimeout(() => {
                    addRemoveTransparent([this.elements.map], false);
                }, DEFAULT_TIMEOUT / 2);
            }
        }, 50);
    }
}

window.customElements.define("region-info", RegionInfo);