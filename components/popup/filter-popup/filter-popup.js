/// IMPORTS
import BasePopup from "../base-popup/base-popup.js"
import {
    addRemoveNoDisplay, getBilingualText, flipArrow, sortByEnglishName,
    addClickListeners,
    setBilingualAttribute
} from '../../../js/utils.js';
import { CUSTOM_EVENT_TYPES } from "../../../js/constants.js";

/**
 * The Filter Popup object.
 * @extends BasePopup
 */
export default class FilterPopup extends BasePopup {
    constructor() {
        super();
        self = this;

        /** @type {boolean} */
        this.currentFavourites = false;
        /** @type {string} */
        this.currentKeyword = "";
        /** @type {any[]} */
        this.allRegions = [];
        /** @type {any[]} */
        this.currentRegions = [];
        /** @type {any[]} */
        this.selectedRegions = [];
        /** @type {any[]} */
        this.allAreas = [];
        /** @type {any[]} */
        this.currentAreas = [];
        /** @type {any[]} */
        this.selectedAreas = [];
        /** @type {any[]} */
        this.allTags = [];
        /** @type {any[]} */
        this.currentTags = [];
        /** @type {any[]} */
        this.selectedTags = [];
        /** @type {string[]} */
        this.allCameras = [];
        /** @type {string[]} */
        this.currentCameras = [];
        /** @type {string[]} */
        this.selectedCameras = [];

        /** @type {HTMLButtonElement} */
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
    initializePopup() {
        super.initializePopup();
        setBilingualAttribute([
            ["filter-title", "Filters", "フィルター"],
            ["filter-fav-title", "Favourites", "お気に入り"],
            ["filter-kw-title", "Keyword", "キーワード"],
            ["filter-tags-title", "Tags", "タグ"],
            ["filter-camera-title", "Camera", "カメラ"],
            ["filter-areas-title", "Areas", "場所"],
            ["filter-clear-btn", "Clear", "クリアする"],
            ["filter-submit-btn", "Apply", "適用する"]
        ], "innerHTML");
        document.getElementById("filter-fav-label").childNodes[0].textContent = getBilingualText("Filter favourites", "お気に入りだけを表示する");
        setBilingualAttribute([
            ["filter-kw-clear-btn", "Clear keyword", "キーワードをクリアする"]
        ], "title");

        addClickListeners([
            ["filter-regions-header", function () { self.toggleFilterGroup("regions", undefined); }],
            ["filter-areas-header", function () { self.toggleFilterGroup("areas", undefined); }],
            ["filter-tags-header", function () { self.toggleFilterGroup("tags", undefined); }],
            ["filter-camera-header", function () { self.toggleFilterGroup("camera", undefined); }],
            ["filter-clear-btn", this.clearFilters],
            ["filter-submit-btn", this.submitFilters],
            ["filter-kw-clear-btn", function () { self.clearKeyword(); }]
        ]);
        document.getElementById("filter-kw-input").addEventListener("input", function () { self.checkEmptyKeywordInput(); });
    }

    /**
     * 
     * @param {string} htmlListId 
     * @param {string[]} selectedList
     * @param {boolean} isString 
     */
    refreshFilterButtons(htmlListId, selectedList) {
        Array.from(document.getElementById(htmlListId).querySelectorAll("button")).forEach(button => {
            if (selectedList.some(item => item.replace(" ", "") == button.id)) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
    }

    /**
     * @inheritdoc
     * @param {boolean} [isSubmit=false] 
     */
    closePopup(forceClose, isSubmit = false) {
        // if the user changed their mind on the filters,
        // reset the filters to their states before the popup was opened.
        if (!isSubmit) {
            document.getElementById("filter-fav-input").checked = self.currentFavourites;
            document.getElementById("filter-kw-input").value = self.currentKeyword;
            self.checkEmptyKeywordInput();

            self.selectedRegions = [...self.currentRegions];
            self.selectedAreas = [...self.currentAreas];
            self.selectedTags = [...self.currentTags];
            self.selectedCameras = [...self.currentCameras];
            this.refreshFilterButtons("filter-regions-list", self.selectedRegions);
            this.refreshFilterButtons("filter-areas-list", self.selectedAreas);
            this.refreshFilterButtons("filter-camera-list", self.selectedCameras);
            this.refreshFilterButtons("filter-tags-list", self.selectedTags);
        } else {
            // save current state
            self.currentFavourites = document.getElementById("filter-fav-input").checked;
            self.currentKeyword = document.getElementById("filter-kw-input").value;
            self.currentRegions = [...self.selectedRegions];
            self.currentAreas = [...self.selectedAreas];
            self.currentTags = [...self.selectedTags];
            self.currentCameras = [...self.selectedCameras];
        }

        super.closePopup(forceClose);
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
        self.currentRegions = [];
        self.selectedRegions = [];
        self.allAreas = areas.sort(sortByEnglishName);
        self.currentAreas = [];
        self.selectedAreas = [];
        self.allTags = tags.sort(sortByEnglishName);
        self.selectedTags = [];
        self.currentTags = [];
        self.allCameras = cameras.sort((a, b) => {
            if (a.toLowerCase() < b.toLowerCase()) {
                return -1;
            }
            if (a.toLowerCase() > b.toLowerCase()) {
                return 1;
            }
            return 0;
        });
        self.currentCameras = [];
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
                let newButton = this.filterOptionButton.cloneNode(true);
                if (typeof (item) == "string") {
                    newButton.innerHTML = item;
                    newButton.id = item.replace(" ", "");
                    newButton.addEventListener("click", () => {
                        toggleFunction(item);
                        newButton.classList.toggle("active");
                    });
                } else {
                    newButton.innerHTML = getBilingualText(item.englishName, item.japaneseName);
                    newButton.id = item.id;
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
            flipArrow(headerButton, true);
            addRemoveNoDisplay(`filter-${groupName}-list`, false);
        } else {
            // collapse
            flipArrow(headerButton, false);
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
        const filterSubmitEvent = new CustomEvent(CUSTOM_EVENT_TYPES.FILTER_POPUP_SUBMITTED, {
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
        self.closePopup(true, true);
    }
}

window.customElements.define("filter-popup", FilterPopup);