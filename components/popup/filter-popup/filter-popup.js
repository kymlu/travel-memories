/// IMPORTS
import BasePopup from "../base-popup/base-popup.js"
import { getBilingualText, sortByEnglishName, flipArrow, addRemoveNoDisplay } from '../../../js/utils.js';

/**
 * The Filter Popup object.
 * @extends BasePopup
 */
export default class FilterPopup extends BasePopup {
    constructor() {
        super();
        self = this;

        this.allRegions = [];
        this.selectedRegions = [];
        this.allAreas = [];
        this.selectedAreas = [];
        this.allTags = [];
        this.selectedTags = [];
        this.allCameras = [];
        this.selectedCameras = [];

        this.filterOptionButton = document.createElement("button");
        this.filterOptionButton.classList.add("filter-opt");

        // Get component html
        fetch("components/popup/filter-popup/filter-popup.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            })
    }

    /**
     * @inheritdoc
     */
    setupPopup() {
        super.setupPopup();
        [
            ["filter-title", "Filters", "フィルター"],
            ["filter-fav-title", "Favourites", "お気に入り"],
            ["filter-kw-title", "Keyword", "キーワード"],
            ["filter-tags-title", "Tags", "タグ"],
            ["filter-camera-title", "Camera", "カメラ"],
            ["filter-areas-title", "Areas", "場所"],
            ["filter-clear-btn", "Clear", "クリアする"],
            ["filter-submit-btn", "Save", "保存する"]
        ].forEach(element => {
            document.getElementById(element[0]).innerHTML = getBilingualText(element[1], element[2]);
        });
        document.getElementById("filter-fav-label").childNodes[0].textContent = getBilingualText("Filter favourites", "お気に入りだけを表示する");

        [
            ["filter-regions-header", function () { self.toggleFilterGroup("regions", undefined); }],
            ["filter-areas-header", function () { self.toggleFilterGroup("areas", undefined); }],
            ["filter-tags-header", function () { self.toggleFilterGroup("tags", undefined); }],
            ["filter-camera-header", function () { self.toggleFilterGroup("camera", undefined); }],
            ["filter-clear-btn", this.clearFilters],
            ["filter-submit-btn", this.submitFilters],
            ["filter-kw-clear-btn", function () { self.clearKeyword(); }]
        ].forEach(element => {
            document.getElementById(element[0]).addEventListener("click", element[1]);
        });
        document.getElementById("filter-kw-input").addEventListener("input", function () { self.checkEmptyKeywordInput(); });
    }

    /**
     * @inheritdoc
     */
    closePopup(forceClose) {
        super.closePopup(forceClose);

        const filterClosedEvent = new CustomEvent('filter-popup-closed');
        this.dispatchEvent(filterClosedEvent);
    }

    /**
     * 
     * @param {boolean} isSingleRegion 
     * @param {*} regions 
     * @param {*} areas 
     * @param {*} tags 
     * @param {string[]} cameras 
     * @param {string} regionNameEn 
     * @param {string} regionNameJp 
     */
    regenerateFilters(isSingleRegion, regions,
        areas, tags, cameras, regionNameEn, regionNameJp) {
        this.clearFilters();
        document.getElementById("filter-regions-title").innerHTML = getBilingualText(regionNameEn, regionNameJp);
        self.allRegions = regions.sort(sortByEnglishName);
        self.selectedRegions = [];
        self.allAreas = areas.sort(sortByEnglishName);
        self.selectedAreas = [];
        self.allTags = tags.sort(sortByEnglishName);
        self.selectedTags = [];
        self.allCameras = cameras.sort((a, b) => {
            if (a.toLowerCase() < b.toLowerCase()) {
                return -1;
            }
            if (a.toLowerCase() > b.toLowerCase()) {
                return 1;
            }
            return 0;
        });
        self.selectedCameras = [];

        if (isSingleRegion) {
            addRemoveNoDisplay("filter-regions", true);
            addRemoveNoDisplay("filter-areas", false);
            let filterAreas = document.getElementById("filter-areas-list");
            this.createFilterSection(filterAreas, self.allAreas, this.toggleArea, "areas");
        } else {
            addRemoveNoDisplay("filter-regions", false);
            addRemoveNoDisplay("filter-areas", true);
            let filterRegions = document.getElementById("filter-regions-list");
            this.createFilterSection(filterRegions, self.allRegions, this.toggleRegion, "regions");
        }

        let filterTags = document.getElementById("filter-tags-list");
        this.createFilterSection(filterTags, self.allTags, this.toggleTag, "tags");

        let filterCameras = document.getElementById("filter-camera-list");
        this.createFilterSection(filterCameras, self.allCameras, this.toggleCamera, "camera");
    }

    /**
     * Create the section for the appropriate filter type.
     * @param {HTMLElement} htmlList 
     * @param {string[] | HTMLElement[]} allList - the list of strings or objects to include in the filter group.
     * @param {Function} toggleFunction - the function for toggling show/hide for the filter group.
     * @param {string} sectionName - the name of the section.
     */
    createFilterSection(htmlList, allList, toggleFunction, sectionName) {
        htmlList.replaceChildren();
        allList.forEach(item => {
            if (item) {
                let newButton = this.filterOptionButton.cloneNode();
                if (typeof (item) == "string") {
                    newButton.innerHTML = item;
                    newButton.addEventListener("click", () => {
                        toggleFunction(item);
                        newButton.classList.toggle("active");
                    });
                } else {
                    newButton.innerHTML = getBilingualText(item.englishName, item.japaneseName);
                    newButton.addEventListener("click", () => {
                        toggleFunction(item.id);
                        newButton.classList.toggle("active");
                    });
                }
                htmlList.appendChild(newButton);
            }
        });

        // if too many items, collapse the group by default
        if (allList.length > 10) {
            self.toggleFilterGroup(sectionName, false);
        } else {
            self.toggleFilterGroup(sectionName, true);
        }
    }

    /**
     * Toggles the filter group specified by the filter type.
     * @param {string} groupName
     * @param {boolean | undefined} expandGroup - ```True``` if the group should be expanded, 
     * ```False``` if not, ```undefined``` to toggle expand/collapse.
     */
    toggleFilterGroup(groupName, expandGroup) {
        let headerButton = document.getElementById(`filter-${groupName}-header`).querySelector("button");
        if (expandGroup == undefined) {
            // toggle
            flipArrow(headerButton);
            document.getElementById(`filter-${groupName}-list`).classList.toggle("no-display");
        } else if (expandGroup) {
            // expand
            flipArrow([headerButton], true);
            addRemoveNoDisplay(`filter-${groupName}-list`, false);
        } else {
            // collapse
            flipArrow([headerButton], false);
            addRemoveNoDisplay(`filter-${groupName}-list`, true);
        }
    }

    /**
     * Toggles the button for the filter item of the specified id.
     * @param {string} id
     * @param {*} array
     */
    toggleFilter(id, array) {
        if (array.includes(id)) {
            array.splice(array.indexOf(id), 1);
        } else {
            array.push(id);
        }
    }

    /**
     * Toggles the filter button for the selected region.
     * @param {string} id 
     */
    toggleRegion(id) {
        self.toggleFilter(id, self.selectedRegions);
    }

    /**
     * Toggles the filter button for the selected area.
     * @param {string} id 
     */
    toggleArea(id) {
        self.toggleFilter(id, self.selectedAreas);
    }

    /**
     * Toggles the filter button for the selected tag.
     * @param {string} id 
     */
    toggleTag(id) {
        self.toggleFilter(id, self.selectedTags);
    }

    /**
     * Toggles the filter button for the selected camera.
     * @param {string} item 
     */
    toggleCamera(item) {
        self.toggleFilter(item, self.selectedCameras);
    }

    checkEmptyKeywordInput() {
        setTimeout(() => {
            if (document.getElementById("filter-kw-input").value == "") {
                addRemoveNoDisplay("filter-kw-clear-btn", true);
            } else if (document.getElementById("filter-kw-clear-btn").classList.contains("no-display")) {
                addRemoveNoDisplay("filter-kw-clear-btn", false);
            }
        }, 10);
    }

    clearKeyword() {
        document.getElementById("filter-kw-input").value = "";
        self.checkEmptyKeywordInput();
    }

    /** Clears all the currently selected filters. */
    clearFilters() {
        document.getElementById("filter-fav-input").checked = false;
        self.clearKeyword();
        self.selectedRegions = [];
        self.selectedAreas = [];
        self.selectedTags = [];
        self.selectedCameras = [];
        document.getElementById("filters").querySelectorAll(".active").forEach(element => {
            element.classList.remove("active");
        });
    }

    /**
     * Submits the new filter parameters to the gallery.
     */
    submitFilters() {
        const filterSubmitEvent = new CustomEvent('filter-popup-submitted', {
            detail: {
                isOnlyFavs: document.getElementById("filter-fav-input").checked,
                keyword: document.getElementById("filter-kw-input").value,
                selectedRegions: self.selectedRegions,
                selectedAreas: self.selectedAreas,
                selectedTags: self.selectedTags,
                selectedCameras: self.selectedCameras
            }
        });

        self.dispatchEvent(filterSubmitEvent);
        self.closePopup(true);
    }
}

window.customElements.define("filter-popup", FilterPopup);