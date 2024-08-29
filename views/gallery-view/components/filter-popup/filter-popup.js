/// IMPORTS
import BasePopup from "../../../../components/popup/base-popup/base-popup.js"
import { CUSTOM_EVENT_TYPES, ATTRIBUTES } from "../../../../js/constants.js";
import {
    addRemoveNoDisplay, getBilingualText, flipArrow, sortBynameEn,
    addClickListeners, setBilingualProperty, fetchInnerHtml
} from '../../../../js/utils.js';

/**
 * The Filter Popup object.
 * @extends BasePopup
 */
export default class FilterPopup extends BasePopup {
    constructor() {
        super();

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
        this.filterOptionButton.classList.add("base-tag", "filter-option");
    }

    /**
     * @inheritdoc
    */
    connectedCallback() {
        fetchInnerHtml("views/gallery-view/components/filter-popup/filter-popup.html", this, true)
            .then(() => {
                super.connectedCallback();
                this._elements = {
                    favourite: this.queryById("filter-fav-input"),
                    keyword: this.queryById("filter-kw-input"),
                    keywordClearBtn: this.queryById("filter-kw-clear-btn")
                }
                setTimeout(() => {
                    setBilingualProperty([
                        [this.queryById("filter-title"), "Filters", "フィルター"],
                        [this.queryById("filter-fav-title"), "Favourites", "お気に入り"],
                        [this.queryById("filter-kw-title"), "Keyword", "キーワード"],
                        [this.queryById("filter-tags-title"), "Tags", "タグ"],
                        [this.queryById("filter-camera-title"), "Camera", "カメラ"],
                        [this.queryById("filter-areas-title"), "Areas", "場所"],
                        [this.queryById("filter-clear-btn"), "Clear", "クリアする"],
                        [this.queryById("filter-submit-btn"), "Apply", "適用する"]
                    ], ATTRIBUTES.INNERTEXT);

                    this.queryById("filter-fav-label").childNodes[0].textContent = getBilingualText("Filter favourites", "お気に入りだけを表示する");

                    setBilingualProperty([
                        [this._elements.keywordClearBtn, "Clear keyword", "キーワードをクリアする"],
                    ], ATTRIBUTES.TITLE);

                    addClickListeners([
                        [this.queryById("filter-regions-header"), this.toggleFilterGroup.bind(this, "regions", undefined)],
                        [this.queryById("filter-areas-header"), this.toggleFilterGroup.bind(this, "areas", undefined)],
                        [this.queryById("filter-tags-header"), this.toggleFilterGroup.bind(this, "tags", undefined)],
                        [this.queryById("filter-camera-header"), this.toggleFilterGroup.bind(this, "camera", undefined)],
                        [this.queryById("filter-clear-btn"), this.clearFilters.bind(this)],
                        [this.queryById("filter-submit-btn"), this.submitFilters.bind(this)],
                        [this._elements.keywordClearBtn, this.clearKeyword.bind(this)]
                    ]);
                    this._elements.keyword.addEventListener("input", this.checkEmptyKeywordInput.bind(this));
                }, 0);
            });
    }

    /**
     * 
     * @param {string} htmlListId 
     * @param {string[]} selectedList
     * @param {boolean} isString 
     */
    refreshFilterButtons(htmlListId, selectedList) {
        Array.from(this.queryById(htmlListId).querySelectorAll("button")).forEach(button => {
            if (selectedList.some(item => item.replace(" ", "") == button.id)) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
    }

    /**
     * @inheritdoc
     */
    open() {
        super.open(this.scrollToTop.bind(this));
    }

    /** Scrolls the filter list to top. */
    scrollToTop() {
        this.queryById("filters").scrollTo({ top: 0, behavior: "instant" });
    }

    /**
     * @inheritdoc
     * @param {boolean} [isSubmit=false] 
     */
    close(forceClose, isSubmit = false) {
        // if the user changed their mind on the filters,
        // reset the filters to their states before the popup was opened.
        if (!isSubmit) {
            this._elements.favourite.checked = this.currentFavourites;
            this._elements.keyword.value = this.currentKeyword;
            this.checkEmptyKeywordInput();

            this.selectedRegions = [...this.currentRegions];
            this.selectedAreas = [...this.currentAreas];
            this.selectedTags = [...this.currentTags];
            this.selectedCameras = [...this.currentCameras];
            this.refreshFilterButtons("filter-regions-list", this.selectedRegions);
            this.refreshFilterButtons("filter-areas-list", this.selectedAreas);
            this.refreshFilterButtons("filter-camera-list", this.selectedCameras);
            this.refreshFilterButtons("filter-tags-list", this.selectedTags);
        } else {
            // save current state
            this.currentFavourites = this._elements.favourite.checked;
            this.currentKeyword = this._elements.keyword.value;
            this.currentRegions = [...this.selectedRegions];
            this.currentAreas = [...this.selectedAreas];
            this.currentTags = [...this.selectedTags];
            this.currentCameras = [...this.selectedCameras];
        }

        super.close(forceClose);
    }

    /**
     * 
     * @param {boolean} isSingleRegion 
     * @param {*} regions 
     * @param {*} areas 
     * @param {*} tags 
     * @param {string[]} cameras 
     * @param {string} regionTypeEn 
     * @param {string} regionTypeJp 
     */
    regenerateFilters(isSingleRegion, regions,
        areas, tags, cameras, regionTypeEn, regionTypeJp) {
        this.previouslyOpened = false;
        this.clearFilters();
        this.queryById("filter-regions-title").innerText = getBilingualText(regionTypeEn, regionTypeJp);
        this.allRegions = regions.sort(sortBynameEn);
        this.currentRegions = [];
        this.allAreas = areas.sort(sortBynameEn);
        this.currentAreas = [];
        this.allTags = tags.sort(sortBynameEn);
        this.currentTags = [];
        this.allCameras = cameras.sort((a, b) => {
            if (a.toLowerCase() < b.toLowerCase()) {
                return -1;
            }
            if (a.toLowerCase() > b.toLowerCase()) {
                return 1;
            }
            return 0;
        });
        this.currentCameras = [];

        if (isSingleRegion) {
            addRemoveNoDisplay([this.queryById("filter-regions")], true);
            addRemoveNoDisplay([this.queryById("filter-areas")], false);
            let filterAreas = this.queryById("filter-areas-list");
            this.createFilterSection(filterAreas, this.allAreas, this.toggleArea.bind(this), "areas");
        } else {
            addRemoveNoDisplay([this.queryById("filter-regions")], false);
            addRemoveNoDisplay([this.queryById("filter-areas")], true);
            let filterRegions = this.queryById("filter-regions-list");
            this.createFilterSection(filterRegions, this.allRegions, this.toggleRegion.bind(this), "regions");
        }

        let filterTags = this.queryById("filter-tags-list");
        this.createFilterSection(filterTags, this.allTags, this.toggleTag.bind(this), "tags");

        let filterCameras = this.queryById("filter-camera-list");
        this.createFilterSection(filterCameras, this.allCameras, this.toggleCamera.bind(this), "camera");
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
                    newButton.innerText = item;
                    newButton.id = item.replace(" ", "");
                    newButton.addEventListener("click", () => {
                        toggleFunction(item);
                        newButton.classList.toggle("active");
                    });
                } else {
                    newButton.innerText = getBilingualText(item.nameEn, item.nameJp);
                    newButton.id = item.id;
                    newButton.addEventListener("click", () => {
                        toggleFunction(item.id);
                        newButton.classList.toggle("active");
                    });
                }
                if (item.faClass != undefined) {
                    let tagIcon = document.createElement("i");
                    tagIcon.classList.add("fa", item.faClass);
                    newButton.prepend(tagIcon);
                }
                htmlList.appendChild(newButton);
            }
        });

        // if too many items, collapse the group by default
        if (allList.length > 10) {
            this.toggleFilterGroup(sectionName, false);
        } else {
            this.toggleFilterGroup(sectionName, true);
        }
    }

    /**
     * Toggles the filter group specified by the filter type.
     * @param {string} groupName
     * @param {boolean | undefined} expandGroup - ```True``` if the group should be expanded, 
     * ```False``` if not, ```undefined``` to toggle expand/collapse.
     */
    toggleFilterGroup(groupName, expandGroup) {
        let headerButton = this.queryById(`filter-${groupName}-header`).querySelector("button");
        let filterTagList = this.queryById(`filter-${groupName}-list`);
        if (expandGroup == undefined) {
            // toggle
            flipArrow(headerButton);
            filterTagList.classList.toggle("no-display");
        } else if (expandGroup) {
            // expand
            flipArrow(headerButton, true);
            addRemoveNoDisplay([filterTagList], false);
        } else {
            // collapse
            flipArrow(headerButton, false);
            addRemoveNoDisplay([filterTagList], true);
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
        this.toggleFilter(id, this.selectedRegions);
    }

    /**
     * Toggles the filter button for the selected area.
     * @param {string} id 
     */
    toggleArea(id) {
        this.toggleFilter(id, this.selectedAreas);
    }

    /**
     * Toggles the filter button for the selected tag.
     * @param {string} id 
     */
    toggleTag(id) {
        this.toggleFilter(id, this.selectedTags);
    }

    /**
     * Toggles the filter button for the selected camera.
     * @param {string} item 
     */
    toggleCamera(item) {
        this.toggleFilter(item, this.selectedCameras);
    }

    checkEmptyKeywordInput() {
        setTimeout(() => {
            if (this._elements.keyword.value == "") {
                addRemoveNoDisplay([this._elements.keywordClearBtn], true);
            } else if (this._elements.keywordClearBtn.classList.contains("no-display")) {
                addRemoveNoDisplay([this._elements.keywordClearBtn], false);
            }
        }, 10);
    }

    clearKeyword() {
        this._elements.keyword.value = "";
        this.checkEmptyKeywordInput();
    }

    /** Clears all the currently selected filters. */
    clearFilters() {
        this._elements.favourite.checked = false;
        this.clearKeyword();
        this.selectedRegions = [];
        this.selectedAreas = [];
        this.selectedTags = [];
        this.selectedCameras = [];
        this.shadowRoot.querySelectorAll(".active").forEach(element => {
            element.classList.remove("active");
        });
    }

    /**
     * Submits the new filter parameters to the gallery.
     */
    submitFilters() {
        const filterSubmitEvent = new CustomEvent(CUSTOM_EVENT_TYPES.FILTER_POPUP_SUBMITTED, {
            detail: {
                isOnlyFavs: this._elements.favourite.checked,
                keyword: this._elements.keyword.value,
                selectedRegions: this.selectedRegions,
                selectedAreas: this.selectedAreas,
                selectedTags: this.selectedTags,
                selectedCameras: this.selectedCameras
            }
        });

        this.dispatchEvent(filterSubmitEvent);
        this.close(true, true);
    }
}

window.customElements.define("filter-popup", FilterPopup);