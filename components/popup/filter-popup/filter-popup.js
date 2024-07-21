"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_popup_ts_1 = require("../base-popup/base-popup.ts");
var utility_ts_1 = require("../../../js/utility.ts");
var FilterPopup = /** @class */ (function (_super) {
    __extends(FilterPopup, _super);
    function FilterPopup() {
        var _this = _super.call(this) || this;
        _this.allRegions = [];
        _this.selectedRegions = [];
        _this.allAreas = [];
        _this.selectedAreas = [];
        _this.allTags = [];
        _this.selectedTags = [];
        _this.allCameras = [];
        _this.selectedCameras = [];
        _this.filterOptionButton = document.createElement("button");
        _this.filterOptionButton.classList.add("filter-opt");
        fetch("components/popup/filter-popup/filter-popup.html")
            .then(function (response) { return response.text(); })
            .then(function (html) {
            _this.innerHTML = html;
        });
        return _this;
    }
    FilterPopup.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
    };
    FilterPopup.prototype.setupPopup = function () {
        _super.prototype.setupPopup.call(this);
        [
            ["filter-title", "Filters", "フィルター"],
            ["filter-fav-title", "Favourites", "お気に入り"],
            ["filter-kw-title", "Keyword", "キーワード"],
            ["filter-tags-title", "Tags", "タグ"],
            ["filter-camera-title", "Camera", "カメラ"],
            ["filter-areas-title", "Areas", "場所"],
            ["filter-clear-btn", "Clear", "クリアする"],
            ["filter-submit-btn", "Save", "保存する"]
        ].forEach(function (element) {
            document.getElementById(element[0]).innerHTML = (0, utility_ts_1.getBilingualText)(element[1], element[2]);
        });
        document.getElementById("filter-fav-label").childNodes[0].textContent = (0, utility_ts_1.getBilingualText)("Filter favourites", "お気に入りだけを表示する");
        [
            ["filter-regions-header", function () { this.toggleFilterGroup("regions", undefined); }],
            ["filter-areas-header", function () { this.toggleFilterGroup("areas", undefined); }],
            ["filter-tags-header", function () { this.toggleFilterGroup("tags", undefined); }],
            ["filter-camera-header", function () { this.toggleFilterGroup("camera", undefined); }],
            ["filter-clear-btn", this.clearFilters],
            ["filter-submit-btn", this.submitFilters],
            ["filter-kw-clear-btn", function () { this.clearKeyword(); }]
        ].forEach(function (element) {
            document.getElementById(element[0]).addEventListener("click", element[1]);
        });
        document.getElementById("filter-kw-input").addEventListener("input", this.checkEmptyKeywordInput);
    };
    FilterPopup.prototype.closePopup = function (forceClose) {
        _super.prototype.closePopup.call(this, forceClose);
        var filterClosedEvent = new CustomEvent('filter-popup-closed');
        this.dispatchEvent(filterClosedEvent);
    };
    FilterPopup.prototype.checkEmptyKeywordInput = function () {
        setTimeout(function () {
            if (document.getElementById("filter-kw-input").value == "") {
                (0, utility_ts_1.addRemoveNoDisplay)("filter-kw-clear-btn", true);
            }
            else if (document.getElementById("filter-kw-clear-btn").classList.contains("no-display")) {
                (0, utility_ts_1.addRemoveNoDisplay)("filter-kw-clear-btn", false);
            }
        }, 10);
    };
    FilterPopup.prototype.clearKeyword = function () {
        document.getElementById("filter-kw-input").value = "";
        this.checkEmptyKeywordInput();
    };
    FilterPopup.prototype.clearFilters = function () {
        document.getElementById("filter-kw-input").checked = false;
        this.clearKeyword();
        this.selectedRegions = [];
        this.selectedAreas = [];
        this.selectedTags = [];
        this.selectedCameras = [];
        document.getElementById("filters").querySelectorAll(".active").forEach(function (element) {
            element.classList.remove("active");
        });
    };
    FilterPopup.prototype.regenerateFilters = function (isSingleRegion, regions, areas, tags, cameras, regionNameEn, regionNameJp) {
        this.clearFilters();
        document.getElementById("filter-regions-title").innerHTML = (0, utility_ts_1.getBilingualText)(regionNameEn, regionNameJp);
        this.allRegions = regions.sort(utility_ts_1.sortByEnglishName);
        this.selectedRegions = [];
        this.allAreas = areas.sort(utility_ts_1.sortByEnglishName);
        this.selectedAreas = [];
        this.allTags = tags.sort(utility_ts_1.sortByEnglishName);
        this.selectedTags = [];
        this.allCameras = cameras.sort(function (a, b) {
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
            (0, utility_ts_1.addRemoveNoDisplay)("filter-regions", true);
            (0, utility_ts_1.addRemoveNoDisplay)("filter-areas", false);
            var filterAreas = document.getElementById("filter-areas-list");
            this.createFilterSection(filterAreas, this.allAreas, this.toggleArea, "areas");
        }
        else {
            (0, utility_ts_1.addRemoveNoDisplay)("filter-regions", false);
            (0, utility_ts_1.addRemoveNoDisplay)("filter-areas", true);
            var filterRegions = document.getElementById("filter-regions-list");
            this.createFilterSection(filterRegions, this.allRegions, this.toggleRegion, "regions");
        }
        var filterTags = document.getElementById("filter-tags-list");
        this.createFilterSection(filterTags, this.allTags, this.toggleTag, "tags");
        var filterCameras = document.getElementById("filter-camera-list");
        this.createFilterSection(filterCameras, this.allCameras, this.toggleCamera, "camera");
    };
    FilterPopup.prototype.createFilterSection = function (htmlList, allList, toggleFunction, sectionName) {
        var _this = this;
        htmlList.replaceChildren();
        allList.forEach(function (item) {
            if (item) {
                var newButton_1 = _this.filterOptionButton.cloneNode();
                if (typeof (item) == "string") {
                    newButton_1.innerHTML = item;
                    newButton_1.addEventListener("click", function () {
                        toggleFunction(item);
                        newButton_1.classList.toggle("active");
                    });
                }
                else {
                    newButton_1.innerHTML = (0, utility_ts_1.getBilingualText)(item.english_name, item.japanese_name);
                    newButton_1.addEventListener("click", function () {
                        toggleFunction(item.id);
                        newButton_1.classList.toggle("active");
                    });
                }
                htmlList.appendChild(newButton_1);
            }
        });
        if (allList.length > 10) {
            this.toggleFilterGroup(sectionName, false);
        }
        else {
            this.toggleFilterGroup(sectionName, true);
        }
    };
    FilterPopup.prototype.toggleFilterGroup = function (group, showGrp) {
        var headerBtn = document.getElementById("filter-".concat(group, "-header")).querySelector("button");
        if (showGrp == undefined) {
            (0, utility_ts_1.flipArrow)(headerBtn, undefined);
            document.getElementById("filter-".concat(group, "-list")).classList.toggle("no-display");
        }
        else if (showGrp) {
            (0, utility_ts_1.flipArrow)(headerBtn, true);
            (0, utility_ts_1.addRemoveNoDisplay)("filter-".concat(group, "-list"), false);
        }
        else {
            (0, utility_ts_1.flipArrow)(headerBtn, false);
            (0, utility_ts_1.addRemoveNoDisplay)("filter-".concat(group, "-list"), true);
        }
    };
    FilterPopup.prototype.toggleFilter = function (id, array) {
        if (array.includes(id)) {
            array.splice(array.indexOf(id), 1);
        }
        else {
            array.push(id);
        }
    };
    FilterPopup.prototype.toggleRegion = function (item) {
        this.toggleFilter(item, this.selectedRegions);
    };
    FilterPopup.prototype.toggleArea = function (item) {
        this.toggleFilter(item, this.selectedAreas);
    };
    FilterPopup.prototype.toggleTag = function (item) {
        this.toggleFilter(item, this.selectedTags);
    };
    FilterPopup.prototype.toggleCamera = function (item) {
        this.toggleFilter(item, this.selectedCameras);
    };
    FilterPopup.prototype.submitFilters = function () {
        var filterSubmitEvent = new CustomEvent('filter-popup-submitted', {
            detail: {
                isOnlyFavs: document.getElementById("filter-fav-input").checked,
                keyword: document.getElementById("filter-kw-input").value,
                selectedRegions: this.selectedRegions,
                selectedAreas: this.selectedAreas,
                selectedTags: this.selectedTags,
                selectedCameras: this.selectedCameras
            }
        });
        self.dispatchEvent(filterSubmitEvent);
        this.closePopup(true);
    };
    return FilterPopup;
}(base_popup_ts_1.default));
exports.default = FilterPopup;
window.customElements.define("filter-popup", FilterPopup);
function connectedCallback() {
    throw new Error("Function not implemented.");
}
//# sourceMappingURL=filter-popup.js.map