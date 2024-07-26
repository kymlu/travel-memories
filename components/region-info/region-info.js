import { addRemoveTransparent, getBilingualText, setBilingualAttribute } from "../../js/utils";

export default class RegionInfo extends HTMLElement {
    constructor() {
        this.isVisible = false;
		this.isThrottling = false;
        this.elements = {
            background: document.getElementById("rgn-info-bg"),
            areasTitle: document.getElementById("areas-title"),
            dates: document.getElementById("rgn-dates"),
            descriptionEnglish: document.getElementById("rgn-desc-eng"),
            descriptionJapanese: document.getElementById("rgn-desc-jp"),
            name: document.getElementById("rgn-name"),
            descriptionTitle: document.getElementById("description-title"),
            areasList: document.getElementById("rgn-areas"),
        }
    }

    handleNewCountry(countryId) {
        const svgObj = document.getElementById("country-map-mini");
        svgObj.data = `assets/img/country/${countryId}.svg`;
    }

    setNewRegionInfo(currentCountry, regionList, areaList, isSingleRegionSelected) {
        this.isVisible = true;

        if (isSingleRegionSelected) {
            addRemoveNoDisplay(this.elements.dates, false);

            setBilingualAttribute([
                [this.elements.areasTitle, "Areas", "所"],
                [this.elements.dates, currentRegion.datesEnglish, currentRegion.datesJapanese],
                [this.elements.name, currentRegion.englishName, currentRegion.japaneseName],
                [this.elements.descriptionTitle, "About", currentCountry.officialRegionNameJapanese + "について"]
            ], "innerHTML");

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
            addRemoveNoDisplay(this.elements.dates, true);

            setBilingualAttribute([
                [this.elements.areasTitle, currentCountry.officialRegionNameEnglish + "s", currentCountry.officialRegionNameJapanese],
                [this.elements.name, currentCountry.englishName, currentCountry.japaneseName],
                [this.elements.descriptionTitle, "About", "国について"]], "innerHTML");

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

    // Region info
    show(isForced) {
        isRegionInfoVisible = true;
        addRemoveTransparent(this.elements.background, false);
        document.getElementById(this.elements.background).style.visibility = "visible";
        if (isForced) {
            if (document.body.scrollTop < this.getBoundingClientRect().height) {
                scrollToTop(true);
            } else {
                this.style.position = "sticky";
                this.style.top = document.getElementsByTagName("header").getBoundingClientRect().height; // TODO: ??
            }
        }
    }

    hide(isForced) {
        isRegionInfoVisible = false;
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
            document.getElementById(this.elements.background).style.visibility = "hidden";
            this.style.position = "relative";
            this.style.top = "0";
        }, DEFAULT_TIMEOUT);
    }

    handleScroll() {
        if (isThrottling) return;

        isThrottling = true;

        setTimeout(() => {
            let rgnInfoOffset = [this].getBoundingClientRect().height / 2;
            if (isRegionInfoVisible && document.body.scrollTop > rgnInfoOffset) {
                isRegionInfoVisible = false;
                hide(false);
            } else if (!isRegionInfoVisible && document.body.scrollTop < rgnInfoOffset) {
                isRegionInfoVisible = true;
                show(false);
            }
            isThrottling = false;
        }, 250);
    }

    toggleVisibility(isVisible) {
        if (this.isVisible == isVisible) {
            return;
        }

        if (isVisible == undefined) {
            isVisible = !isRegionInfoVisible;
        }

        if (isVisible) {
            this.show(true);
        } else {
            this.hide(true);
        }
    }

    filterMiniMap(currentCountry, currentRegion) {
        const svgObj = document.getElementById("country-map-mini");
        addRemoveTransparent([svgObj], true);
        const svgDoc = svgObj.contentDocument;
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