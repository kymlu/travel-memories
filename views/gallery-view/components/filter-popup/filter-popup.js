/// IMPORTS
import BasePopup from "../../../../components/popup/base-popup/base-popup.js"
import { CUSTOM_EVENT_TYPES, ATTRIBUTES, SORT_TYPES } from "../../../../js/constants.js";
import {
    toggleClass, toggleNoDisplay, getBilingualText, 
    flipArrow, sortBynameEn, addClickListeners, 
    setBilingualProperty, fetchInnerHtml,
} from '../../../../js/utils.js';

/**
 * The Filter Popup object.
 * @extends BasePopup
 */
export default class FilterPopup extends BasePopup {
    constructor() {
        super();

        this.currentSort = SORT_TYPES.chronological.id;
        this.selectedSort = null;
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
                setBilingualProperty([
                    [this.queryById("filter-title"), "Filters", "フィルター"],
                    [this.queryById("sorting-title"), "Sort By", "並べ替え"],
                    [this.queryById("filter-fav-title"), "Favourites", "お気に入り"],
                    [this.queryById("filter-kw-title"), "Keyword", "キーワード"],
                    [this.queryById("filter-tags-title"), "Tags", "タグ"],
                    [this.queryById("filter-camera-title"), "Camera", "カメラ"],
                    [this.queryById("filter-areas-title"), "Areas", "場所"],
                    [this.queryById("filter-clear-btn"), "Clear", "クリアする"],
                    [this.queryById("filter-submit-btn"), "Apply", "適用する"]
                ], ATTRIBUTES.INNERTEXT);

                this.queryById("filter-fav-label").childNodes[0].textContent = getBilingualText("Filter favourites", "お気に入りだけを表示する");

                this.initializeSortingButtons();
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
            });
    }

    initializeSortingButtons() {
        this.createFilterSection(
            this.queryById("sort-options-list"), 
            [SORT_TYPES.chronological, SORT_TYPES.random], 
            this.toggleSortingMethod.bind(this),
            null, true, false);
    }

    refreshSortingButtons() {
        [SORT_TYPES.chronological.id, SORT_TYPES.random.id].forEach(sortType => {
            toggleClass([this.queryById(sortType)], "active", this.selectedSort == sortType);
        })
    }

    /**
     * 
     * @param {string} htmlListId 
     * @param {string[]} selectedList
     * @param {boolean} isString 
     */
    refreshFilterButtons(htmlListId, selectedList) {
        Array.from(this.queryById(htmlListId).querySelectorAll("button")).forEach(button => {
            if (selectedList.some(item => item == button.dataset.value)) {
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
            this.selectedSort = this.currentSort;
            this.refreshSortingButtons();

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
            this.currentSort = this.selectedSort;
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
        this.currentSort = SORT_TYPES.chronological.id;

        Array.from(this.queryById("sort-options-list").childNodes).forEach(button => {
            toggleClass([button], "active", this.currentSort == button.dataset.value);
        });

        if (isSingleRegion) {
            toggleNoDisplay([this.queryById("filter-regions")], true);
            toggleNoDisplay([this.queryById("filter-areas")], false);
            let filterAreas = this.queryById("filter-areas-list");
            this.createFilterSection(filterAreas, this.allAreas, this.toggleArea.bind(this), "areas", false, true);
        } else {
            toggleNoDisplay([this.queryById("filter-regions")], false);
            toggleNoDisplay([this.queryById("filter-areas")], true);
            let filterRegions = this.queryById("filter-regions-list");
            this.createFilterSection(filterRegions, this.allRegions, this.toggleRegion.bind(this), "regions", false, true);
        }

        let filterTags = this.queryById("filter-tags-list");
        this.createFilterSection(filterTags, this.allTags, this.toggleTag.bind(this), "tags", false, true);

        let filterCameras = this.queryById("filter-camera-list");
        this.createFilterSection(filterCameras, this.allCameras, this.toggleCamera.bind(this), "camera", false, true);
    }

    /**
     * Create the section for the appropriate filter type.
     * @param {HTMLElement} htmlList 
     * @param {string[] | HTMLElement[]} allList - the list of strings or objects to include in the filter group.
     * @param {Function} toggleFunction - the function for toggling show/hide for the filter group.
     * @param {string} sectionName - the name of the section.
     */
    createFilterSection(htmlList, allList, toggleFunction, sectionName, isAddId, isMultiselect) {
        htmlList.replaceChildren();
        allList.forEach(item => {
            if (item) {
                let newButton = this.filterOptionButton.cloneNode(true);

                let id = ""; 
                if (typeof (item) == "string") {
                    id = item;
                    newButton.innerText = item;
                } else {
                    id = item.id;
                    newButton.innerText = getBilingualText(item.nameEn, item.nameJp);
                }

                if (isAddId && item.id) {
                    newButton.id = id;
                }
                newButton.dataset.value = id;
                newButton.addEventListener("click", () => {
                    toggleFunction(id);
                    if(isMultiselect){
                        newButton.classList.toggle("active");
                    }
                });

                // add icon
                if (item.faClass != undefined) {
                    let tagIcon = document.createElement("i");
                    tagIcon.classList.add("fa", item.faClass);
                    newButton.prepend(tagIcon);
                }
                htmlList.appendChild(newButton);
            }
        });

        // if too many items, collapse the group by default
        if (sectionName) {
            if (allList.length > 10) {
                this.toggleFilterGroup(sectionName, false);
            } else {
                this.toggleFilterGroup(sectionName, true);
            }
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
        flipArrow(headerButton, expandGroup);
        toggleNoDisplay([filterTagList], expandGroup == undefined ? undefined : !expandGroup);
    }

    toggleSortingMethod(item) {
        if (this.selectedSort != item) {
            this.selectedSort = item;
            Array.from(this.queryById("sort-options-list").childNodes).forEach(button => {
                toggleClass([button], "active", button.dataset.value == item);
            });
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
                toggleNoDisplay([this._elements.keywordClearBtn], true);
            } else if (this._elements.keywordClearBtn.classList.contains("no-display")) {
                toggleNoDisplay([this._elements.keywordClearBtn], false);
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
        this.selectedSort = SORT_TYPES.chronological.id;
        this.selectedRegions = [];
        this.selectedAreas = [];
        this.selectedTags = [];
        this.selectedCameras = [];
        toggleClass(this.shadowRoot.querySelectorAll(".active"), "active", false);
        this.queryById(SORT_TYPES.chronological.id).classList.add("active");
    }

    /**
     * Submits the new filter parameters to the gallery.
     */
    submitFilters() {
        const filterSubmitEvent = new CustomEvent(CUSTOM_EVENT_TYPES.FILTER_POPUP_SUBMITTED, {
            detail: {
                sort: this.selectedSort,
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