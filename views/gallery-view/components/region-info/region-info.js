import { ATTRIBUTES, CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT } from "../../../../js/constants.js";
import { getAppColor, getHeader } from "../../../../js/globals.js";
import {
    addClickListeners, addRemoveTransparent, addRemoveNoDisplay, getBilingualText,
    fetchInnerHtml, isPortraitMode, scrollToTop, setBilingualProperty,
    getScrollPosition
} from "../../../../js/utils.js";
import BaseDrawer from "../../../../components/base-drawer/base-drawer.js";

/** The Region Info. */
export default class RegionInfo extends BaseDrawer {
    constructor() {
        super();
        this.isVisible = false;
        this.isThrottling = false;
        this.hasMapLoaded = false;

        this.currentCountry = null;
        document.addEventListener(CUSTOM_EVENT_TYPES.NEW_COUNTRY_SELECTED,
            (event) => { this.handleNewCountry(event.detail.country) });
    }

    connectedCallback() {
        fetchInnerHtml("views/gallery-view/components/region-info/region-info.html", this, true)
            .then(() => {
                super.connectedCallback();
                this._elements = {
                    wrapper: this.queryById("wrapper"),
                    background: this.queryById("background"),
                    drawer: this.queryById("drawer"),
                    map: this.queryByClassName("mini-map"),
                    areasTitle: this.queryById("areas-title"),
                    datesSection: this.queryById("dates-section"),
                    dates: this.queryById("dates-text"),
                    descriptionEn: this.queryById("description-en"),
                    descriptionJp: this.queryById("description-jp"),
                    descriptionTitle: this.queryById("description-title"),
                    areasList: this.queryById("areas-text"),
                };

                document.addEventListener(CUSTOM_EVENT_TYPES.HEADER_UPDATED, (event) => {
                    this._elements.wrapper.style.top = `${event.detail.header?.getHeight()}px`;
                });

                setTimeout(() => {
                    this._elements.map.addEventListener("load", this.filterMiniMap.bind(this, null));

                    addClickListeners([
                        [this._elements.background, this.toggleVisibility.bind(this, false)],
                    ]);

                    setBilingualProperty(
                        [[this.queryById("dates-title"), "Dates visited", "訪れた日付"]]
                        , ATTRIBUTES.INNERTEXT);
                    addRemoveTransparent([this._elements.wrapper], true);
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
    handleNewCountry(newCountry) {
        addRemoveNoDisplay([this], false);
        this.currentCountry = newCountry;
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
        newMap.setAttribute("title", getBilingualText("Map", "地図"));
        newMap.addEventListener("load", this.filterMiniMap.bind(this, null));
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
            }, 50);

            setBilingualProperty([
                [this._elements.areasTitle, "Areas", "所"],
                [this._elements.dates, currentRegion.datesEn, currentRegion.datesJp],
                [this._elements.descriptionTitle, "About", this.currentCountry.regionTypeJp + "について"]
            ], ATTRIBUTES.INNERTEXT);

            [
                [this._elements.descriptionEn, currentRegion.descriptionEn],
                [this._elements.descriptionJp, currentRegion.descriptionJp],
                [this._elements.areasList, areaList.map(area => {
                    return getBilingualText(area.nameEn, area.nameJp);
                }).sort().join(" | ")]
            ].forEach(([element, text]) => {
                element.innerText = text;
            });
        } else {
            setTimeout(() => {
                this.filterMiniMap(null);
            }, 50);

            setBilingualProperty([
                [this._elements.areasTitle, this.currentCountry.regionTypeEn + "s", this.currentCountry.regionTypeJp],
                [this._elements.descriptionTitle, "About", "国について"]]
                , ATTRIBUTES.INNERTEXT);

            [
                [this._elements.descriptionEn, this.currentCountry.descriptionEn],
                [this._elements.descriptionJp, this.currentCountry.descriptionJp],
                [this._elements.areasList, regionList.map(area => {
                    return getBilingualText(area.nameEn, area.nameJp);
                }).sort().join(" | ")]
            ].forEach(([element, text]) => {
                element.innerText = text;
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
        addRemoveTransparent([this._elements.wrapper, this._elements.background], false);
        if (isForced) {
            if (getScrollPosition() < this.getBoundingClientRect().height) {
                this.isThrottling = true;
                scrollToTop(true);
                setTimeout(() => {
                    this.isThrottling = false;
                }, DEFAULT_TIMEOUT * 2);
            } else {
                this._elements.wrapper.style.position = "sticky";
                this._elements.wrapper.style.top = `${getHeader()?.getHeight()}px`;
            }
        } else {
            this._elements.wrapper.style.top = "0px";
        }
    }

    /** Hides the region info section.
     * @param {boolean} isForced
     */
    hide(isForced) {
        this.isVisible = false;
        if (isForced) {
            let rgnInfoOffset = this._elements.drawer.getBoundingClientRect().height;
            if (getScrollPosition() <= rgnInfoOffset) {
                this.isThrottling = true;
                window.scrollTo({
                    top: rgnInfoOffset,
                    left: 0,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    this.isThrottling = false;
                }, DEFAULT_TIMEOUT * 2);
            }
        }
        if (window.innerHeight < document.body.getBoundingClientRect().height) {
            addRemoveTransparent([this._elements.wrapper], true);
        } else {
            addRemoveTransparent([this._elements.background], true);
        }
        setTimeout(() => {
            this._elements.wrapper.style.position = "relative";
            addRemoveTransparent([this._elements.drawer], false);
        }, DEFAULT_TIMEOUT);
    }

    /** Shows the background. */
    resetPosition(){
        this.queryByClassName("rgn-info").scrollTo({top: 0});
        addRemoveTransparent([this._elements.background], false);
        this.isVisible = true;
    }

    /** Shows/hides the pic info section if user scrolls to a certain point. */
    handleScroll() {
        if (this.isThrottling) return;

        this.isThrottling = true;
        setTimeout(() => {
            let rgnInfoOffset = this._elements.drawer.getBoundingClientRect().height * 0.9;
            let userPosition = getScrollPosition();
            if (this.isVisible && userPosition > rgnInfoOffset) {
                this.hide(false);
            } else if (!this.isVisible && userPosition < rgnInfoOffset) {
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
            if (!this._elements.map.hasAttribute("data") || this._elements.map.data == "" || this.currentCountry.regionGroups == null) {
                return;
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