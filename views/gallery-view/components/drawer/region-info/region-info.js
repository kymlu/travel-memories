import { ATTRIBUTES, CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT } from "../../../../../js/constants.js";
import { getAppColor, getCurrentCountry, getHeader } from "../../../../../js/globals.js";
import {
    addClickListeners, addRemoveTransparent, addRemoveNoDisplay, getBilingualText,
    fetchInnerHtml, isPortraitMode, scrollToTop, setBilingualProperty
} from "../../../../../js/utils.js";
import BaseDrawer from "../base-drawer/base-drawer.js";

/** The Region Info. */
export default class RegionInfo extends BaseDrawer {
    constructor() {
        super();
        this.isVisible = false;
        this.isThrottling = false;
        this.hasMapLoaded = false;

        this.currentCountry = null;
        document.addEventListener(CUSTOM_EVENT_TYPES.NEW_COUNTRY_SELECTED, this.handleNewCountry.bind(this));
    }

    connectedCallback() {
        fetchInnerHtml("views/gallery-view/components/drawer/region-info/region-info.html", this, true)
            .then(() => {
                super.connectedCallback();
                this._elements = {
                    regionInfo: this.queryById("rgn-info"),
                    background: this.queryById("rgn-info-bg"),
                    drawer: this.queryById("rgn-info-drawer"),
                    map: this.queryById("country-map-mini"),
                    areasTitle: this.queryById("areas-title"),
                    datesSection: this.queryById("rgn-info-dates"),
                    dates: this.queryById("rgn-dates"),
                    descriptionEnglish: this.queryById("rgn-desc-eng"),
                    descriptionJapanese: this.queryById("rgn-desc-jp"),
                    descriptionTitle: this.queryById("description-title"),
                    areasList: this.queryById("rgn-areas"),
                };

                document.addEventListener(CUSTOM_EVENT_TYPES.HEADER_UPDATED, () => {
                    this._elements.background.style.top = `${getHeader()?.getHeight()}px`;
                });

                setTimeout(() => {
                    this._elements.map.addEventListener("load", this.filterMiniMap.bind(this, null));

                    addClickListeners([
                        [this._elements.background, this.toggleVisibility.bind(this, false)],
                    ]);

                    setBilingualProperty(
                        [[this.queryById("dates-title"), "Dates visited", "訪れた日付"]]
                        , ATTRIBUTES.INNERHTML);
                    addRemoveTransparent([this._elements.regionInfo], true);
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

    /** Makes value changes based on new country.
     * @param {string} countryId
     */
    handleNewCountry() {
        addRemoveNoDisplay([this], false);
        this.currentCountry = getCurrentCountry();
        addRemoveTransparent([this._elements.map], true);
        setTimeout(() => {
            this.createMap();
        }, 50);
    }

    /** Sets the appropriate map. 
     * Simply setting the data attribute does not work.
     * @link https://stackoverflow.com/questions/55175178/how-to-update-the-source-of-an-embedded-svg-element
    */
    createMap() {
        let newMap = document.createElement("object");
        newMap.setAttribute("class", "mini-map opacity-transition");
        newMap.setAttribute("type", "image/svg+xml");
        newMap.setAttribute("data", `assets/img/country/${this.currentCountry.id}.svg`);
        this._elements.map.parentElement.replaceChild(newMap, this._elements.map);
        this._elements.map = newMap;
    }

    /** Sets the info for a new region.
     * @param {any[]} regionList
     * @param {any[]} areaList
     * @param {boolean} isSingleRegionSelected
     */
    setNewRegionInfo(regionList, areaList, isSingleRegionSelected, isNewGallery) {
        if (!isNewGallery) {
            addRemoveTransparent([this._elements.background], false);
        }
        
        this.isVisible = true;
        addRemoveNoDisplay([this._elements.datesSection], !isSingleRegionSelected);

        if (isSingleRegionSelected) {
            let currentRegion = regionList[0];

            setTimeout(() => {
                this.filterMiniMap(currentRegion);
            }, 0);

            setBilingualProperty([
                [this._elements.areasTitle, "Areas", "所"],
                [this._elements.dates, currentRegion.datesEnglish, currentRegion.datesJapanese],
                [this._elements.descriptionTitle, "About", this.currentCountry.officialRegionNameJapanese + "について"]
            ], ATTRIBUTES.INNERHTML);

            [
                [this._elements.descriptionEnglish, currentRegion.descriptionEnglish],
                [this._elements.descriptionJapanese, currentRegion.descriptionJapanese],
                [this._elements.areasList, areaList.map(area => {
                    return getBilingualText(area.englishName, area.japaneseName);
                }).sort().join(" | ")]
            ].forEach(([element, text]) => {
                element.innerHTML = text;
            });
        } else {
            setTimeout(() => {
                this.filterMiniMap(null);
            }, 0);

            setBilingualProperty([
                [this._elements.areasTitle, this.currentCountry.officialRegionNameEnglish + "s", this.currentCountry.officialRegionNameJapanese],
                [this._elements.descriptionTitle, "About", "国について"]]
                , ATTRIBUTES.INNERHTML);

            [
                [this._elements.descriptionEnglish, this.currentCountry.descriptionEnglish],
                [this._elements.descriptionJapanese, this.currentCountry.descriptionJapanese],
                [this._elements.areasList, regionList.map(area => {
                    return getBilingualText(area.englishName, area.japaneseName);
                }).sort().join(" | ")]
            ].forEach(([element, text]) => {
                element.innerHTML = text;
            });
        }
        this.queryByClassName("rgn-info").scrollTo({ top: 0, behavior: "smooth" });
    }

    /** Shows the region info section.
     * @param {true} isForced
     */
    show(isForced) {
        if (isPortraitMode()) {
            this.queryById("dates-title").scrollIntoView({ block: isPortraitMode() ? "end" : "start" });
        }

        this.isVisible = true;
        addRemoveTransparent([this._elements.regionInfo], false);
        if (isForced) {
            if (document.body.scrollTop < this.getBoundingClientRect().height) {
                scrollToTop(true);
            } else {
                this._elements.regionInfo.style.position = "sticky";
                this._elements.regionInfo.style.top = `${getHeader()?.getHeight()}px`;
            }
        }
    }

    /** Hides the region info section.
     * @param {boolean} isForced
     */
    hide(isForced) {
        this.isVisible = false;
        if (isForced) {
            let rgnInfoOffset = this._elements.drawer.getBoundingClientRect().height;
            if (document.body.scrollTop <= rgnInfoOffset) {
                this.isThrottling = true;
                window.scrollTo({
                    top: rgnInfoOffset,
                    left: 0,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    this.isThrottling = false;
                }, DEFAULT_TIMEOUT);
            }
        }
        addRemoveTransparent([this._elements.regionInfo], true);
        setTimeout(() => {
            this._elements.regionInfo.style.position = "relative";
            this._elements.regionInfo.style.top = "0";
            addRemoveTransparent([this._elements.drawer], false);
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
        setTimeout(() => {
            if (!this._elements.map.hasAttribute("data") || this._elements.map.data == "") {
                setTimeout(() => {
                    this.filterMiniMap(currentRegion);
                    return;
                }, 0);
            };
            const svgDoc = this._elements.map.contentDocument;
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
                        } else if (rgn.id == currentRegion.id) {
                            rgnImg.setAttribute("fill", appColour);
                        } else {
                            rgnImg.setAttribute("fill", "none");
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
                addRemoveTransparent([this._elements.map], false);
            } catch (error) {
                console.error(error);
                this.filterMiniMap(currentRegion);
            }
        }, 50);
    }
}

window.customElements.define("region-info", RegionInfo);