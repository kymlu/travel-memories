import { ATTRIBUTES } from "../../js/constants.js";
import { addRemoveTransparent, getBilingualText, setBilingualAttribute } from "../../js/utils.js";

/** The Region Info. */
export default class RegionInfo extends HTMLElement {
    constructor() {
        super();
        this.isVisible = false;
        this.isThrottling = false;
        this.elements = {
            background: document.getElementById("rgn-info-bg"),
            map: document.getElementById("country-map-mini"),
            areasTitle: document.getElementById("areas-title"),
            datesSection: document.getElementById("rgn-info-dates"),
            dates: document.getElementById("rgn-dates"),
            descriptionEnglish: document.getElementById("rgn-desc-eng"),
            descriptionJapanese: document.getElementById("rgn-desc-jp"),
            name: document.getElementById("rgn-name"),
            descriptionTitle: document.getElementById("description-title"),
            areasList: document.getElementById("rgn-areas"),
        }
    }

    /** Makes value changes based on new country.
     * @param {string} countryId 
     */
    handleNewCountry(countryId) {
        const svgObj = this.elements.map;
        svgObj.data = `assets/img/country/${countryId}.svg`;
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

            setBilingualAttribute([
                [this.elements.areasTitle, "Areas", "所"],
                [this.elements.dates, currentRegion.datesEnglish, currentRegion.datesJapanese],
                [this.elements.name, currentRegion.englishName, currentRegion.japaneseName],
                [this.elements.descriptionTitle, "About", currentCountry.officialRegionNameJapanese + "について"]
            ], ATTRIBUTES.INNERHTML);

            [
                [this.elements.descriptionEnglish, currentRegion.descriptionEnglish],
                [this.elements.descriptionJapanese, currentRegion.descriptionJapanese],
                [this.elements.areasList, areaList.map(area => {
                    return getBilingualText(area.englishName, area.japaneseName);
                }).sort().join(" | ")]
            ].forEach(([id, text]) => {
                document.getElementById(id).innerHTML = text;
            });
        } else {
            addRemoveNoDisplay(this.elements.datesSection, true);

            setBilingualAttribute([
                [this.elements.areasTitle, currentCountry.officialRegionNameEnglish + "s", currentCountry.officialRegionNameJapanese],
                [this.elements.name, currentCountry.englishName, currentCountry.japaneseName],
                [this.elements.descriptionTitle, "About", "国について"]], ATTRIBUTES.INNERHTML);

            [
                [this.elements.descriptionEnglish, currentCountry.descriptionEnglish],
                [this.elements.descriptionJapanese, currentCountry.descriptionJapanese],
                [this.elements.areasList, regionList.map(area => {
                    return getBilingualText(area.englishName, area.japaneseName);
                }).sort().join(" | ")]
            ].forEach(([id, text]) => {
                document.getElementById(id).innerHTML = text;
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
                this.style.top = document.getElementsByTagName("header").getBoundingClientRect().height; // TODO: ??
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
        if (isThrottling) return;

        isThrottling = true;
        setTimeout(() => {
            let rgnInfoOffset = this.getBoundingClientRect().height / 2;
            if (this.isVisible && document.body.scrollTop > rgnInfoOffset) {
                hide(false);
            } else if (!this.isVisible && document.body.scrollTop < rgnInfoOffset) {
                show(false);
            }
            isThrottling = false;
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
        addRemoveTransparent([this.elements.map], true);
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
                addRemoveTransparent([svgObj], false);
            }, DEFAULT_TIMEOUT / 2);
        }
    }
}

window.customElements.define("region-info", RegionInfo);