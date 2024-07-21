import BasePopup from "../base-popup/base-popup.ts"
import { getBilingualText, sortByEnglishName, flipArrow, addRemoveNoDisplay } from '../../../js/utility.ts';

export default class FilterPopup extends BasePopup {
    allRegions: Region[] = [];
    selectedRegions: Region[] = [];
    allAreas: BaseObject[] = [];
    selectedAreas: BaseObject[] = [];
    allTags: BaseObject[] = [];
    selectedTags: BaseObject[] = [];
    allCameras: string[] = [];
    selectedCameras: string[] = [];
    filterOptionButton: HTMLElement;

    constructor() {
        super();

        this.filterOptionButton = document.createElement("button");
        this.filterOptionButton.classList.add("filter-opt");

        fetch("components/popup/filter-popup/filter-popup.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            })
    }

    connectedCallback() {
        super.connectedCallback();
    }

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
            document.getElementById(element[0])!.innerHTML = getBilingualText(element[1], element[2]);
        });
        document.getElementById("filter-fav-label")!.childNodes[0].textContent = getBilingualText("Filter favourites", "お気に入りだけを表示する");

        ([
            ["filter-regions-header", function () { this.toggleFilterGroup("regions", undefined); }],
            ["filter-areas-header", function () { this.toggleFilterGroup("areas", undefined); }],
            ["filter-tags-header", function () { this.toggleFilterGroup("tags", undefined); }],
            ["filter-camera-header", function () { this.toggleFilterGroup("camera", undefined); }],
            ["filter-clear-btn", this.clearFilters],
            ["filter-submit-btn", this.submitFilters],
            ["filter-kw-clear-btn", function () { this.clearKeyword(); }]
        ] as any[]).forEach(element => {
            document.getElementById(element[0])!.addEventListener("click", element[1]);
        });
        document.getElementById("filter-kw-input")!.addEventListener("input", this.checkEmptyKeywordInput);
    }

    closePopup(forceClose) {
        super.closePopup(forceClose);

        const filterClosedEvent = new CustomEvent('filter-popup-closed');
        this.dispatchEvent(filterClosedEvent);
    }

    checkEmptyKeywordInput() {
        setTimeout(() => {
            if ((document.getElementById("filter-kw-input") as HTMLInputElement).value == "") {
                addRemoveNoDisplay("filter-kw-clear-btn", true);
            } else if (document.getElementById("filter-kw-clear-btn")!.classList.contains("no-display")) {
                addRemoveNoDisplay("filter-kw-clear-btn", false);
            }
        }, 10);
    }

    clearKeyword() {
        (document.getElementById("filter-kw-input") as HTMLInputElement).value = "";
        this.checkEmptyKeywordInput();
    }

    clearFilters() {
        (document.getElementById("filter-kw-input") as HTMLInputElement).checked = false;
        this.clearKeyword();
        this.selectedRegions = [];
        this.selectedAreas = [];
        this.selectedTags = [];
        this.selectedCameras = [];
        document.getElementById("filters")!.querySelectorAll(".active").forEach(element => {
            element.classList.remove("active");
        });
    }

    regenerateFilters(isSingleRegion, regions,
        areas, tags, cameras, regionNameEn, regionNameJp) {
        this.clearFilters();
        document.getElementById("filter-regions-title")!.innerHTML = getBilingualText(regionNameEn, regionNameJp);
        this.allRegions = regions.sort(sortByEnglishName);
        this.selectedRegions = [];
        this.allAreas = areas.sort(sortByEnglishName);
        this.selectedAreas = [];
        this.allTags = tags.sort(sortByEnglishName);
        this.selectedTags = [];
        this.allCameras = cameras.sort((a, b) => {
            if (a.toLowerCase() < b.toLowerCase()) {
                return -1;
            }
            if (a.toLowerCase() > b.toLowerCase()) {
                return 1;
            }
            return 0;
        });
        this.selectedCameras = [];

        if (isSingleRegion) {
            addRemoveNoDisplay("filter-regions", true);
            addRemoveNoDisplay("filter-areas", false);
            let filterAreas = document.getElementById("filter-areas-list")!;
            this.createFilterSection(filterAreas, this.allAreas, this.toggleArea, "areas");
        } else {
            addRemoveNoDisplay("filter-regions", false);
            addRemoveNoDisplay("filter-areas", true);
            let filterRegions = document.getElementById("filter-regions-list")!;
            this.createFilterSection(filterRegions, this.allRegions, this.toggleRegion, "regions");
        }

        let filterTags = document.getElementById("filter-tags-list")!;
        this.createFilterSection(filterTags, this.allTags, this.toggleTag, "tags");

        let filterCameras = document.getElementById("filter-camera-list")!;
        this.createFilterSection(filterCameras, this.allCameras, this.toggleCamera, "camera");
    }

    createFilterSection(htmlList, allList, toggleFunction, sectionName) {
        htmlList.replaceChildren();
        allList.forEach(item => {
            if (item) {
                let newButton = this.filterOptionButton.cloneNode() as HTMLElement;
                if (typeof (item) == "string") {
                    newButton.innerHTML = item;
                    newButton.addEventListener("click", () => {
                        toggleFunction(item);
                        newButton.classList.toggle("active");
                    });
                } else {
                    newButton.innerHTML = getBilingualText(item.english_name, item.japanese_name);
                    newButton.addEventListener("click", () => {
                        toggleFunction(item.id);
                        newButton.classList.toggle("active");
                    });
                }
                htmlList.appendChild(newButton);
            }
        });

        if (allList.length > 10) {
            this.toggleFilterGroup(sectionName, false);
        } else {
            this.toggleFilterGroup(sectionName, true);
        }
    }

    toggleFilterGroup(group, showGrp) {
        let headerBtn = document.getElementById(`filter-${group}-header`)!.querySelector("button")!;
        if (showGrp == undefined) {
            flipArrow(headerBtn, undefined);
            document.getElementById(`filter-${group}-list`)!.classList.toggle("no-display");
        } else if (showGrp) {
            flipArrow(headerBtn, true);
            addRemoveNoDisplay(`filter-${group}-list`, false);
        } else {
            flipArrow(headerBtn, false);
            addRemoveNoDisplay(`filter-${group}-list`, true);
        }
    }

    toggleFilter(id, array) {
        if (array.includes(id)) {
            array.splice(array.indexOf(id), 1);
        } else {
            array.push(id);
        }
    }

    toggleRegion(item) {
        this.toggleFilter(item, this.selectedRegions);
    }

    toggleArea(item) {
        this.toggleFilter(item, this.selectedAreas);
    }

    toggleTag(item) {
        this.toggleFilter(item, this.selectedTags);
    }

    toggleCamera(item) {
        this.toggleFilter(item, this.selectedCameras);
    }

    submitFilters() {
        const filterSubmitEvent = new CustomEvent('filter-popup-submitted', {
            detail: {
                isOnlyFavs: (document.getElementById("filter-fav-input") as HTMLInputElement).checked,
                keyword: (document.getElementById("filter-kw-input") as HTMLInputElement).value,
                selectedRegions: this.selectedRegions,
                selectedAreas: this.selectedAreas,
                selectedTags: this.selectedTags,
                selectedCameras: this.selectedCameras
            }
        });

        self.dispatchEvent(filterSubmitEvent);
        this.closePopup(true);
    }
}

window.customElements.define("filter-popup", FilterPopup);

function connectedCallback() {
    throw new Error("Function not implemented.");
}
