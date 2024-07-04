class FilterPopup extends BasePopup {
    allRegions = [];
    selectedRegions = [];
    allAreas = [];
    selectedAreas = [];
    allTags = [];
    selectedTags = [];
    allCameras = [];
    selectedCameras = [];
    
    constructor() {
        super();
        self = this;

        this.filterOptionButton = document.createElement("button");
        this.filterOptionButton.classList.add("filter-opt");

        fetch("components/popup/filter-popup/filter-popup.html")
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
            })

        // fetch("components/popup/filter-popup/filter-popup.css")
        //     .then(response => response.text())
        //     .then(css => {
        //         const style = document.createElement("style");
        //         style.textContent = css;
        //         this.appendChild(style);
        //     });
    }

    connectedCallback() {
        super.connectedCallback();
    }

    closePopup(forceClose) {
        super.closePopup(forceClose);

        const filterClosedEvent = new CustomEvent('filter-popup-closed');
        this.dispatchEvent(filterClosedEvent);
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
            ["filter-kw-clear-btn", function(){self.clearKeyword();}]
        ].forEach(element => {
            document.getElementById(element[0]).addEventListener("click", element[1]);
        });
        document.getElementById("filter-kw-input").addEventListener("input", function(){self.checkEmptyKeywordInput();});
    }

    refreshFilters(isSingleRegion, regions,
        areas, tags, cameras, regionNameEn, regionNameJp) {
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
            self.toggleFilterGroup(sectionName, false);
        } else {
            self.toggleFilterGroup(sectionName, true);
        }
    }

    toggleFilterGroup(group, showGrp) {
        let headerBtn = document.getElementById("filter-" + group + "-header").querySelector("button");
        if (showGrp == undefined) {
            flipArrow(headerBtn);
            document.getElementById("filter-" + group + "-list").classList.toggle("no-display");
        } else if (showGrp) {
            flipArrow([headerBtn], true);
            addRemoveNoDisplay("filter-" + group + "-list", false);
        } else {
            flipArrow([headerBtn], false);
            addRemoveNoDisplay("filter-" + group + "-list", true);
        }
    }

    toggleFilter(id, array) {
        if (array.includes(id)) {
            array.splice(array.indexOf(id), 1);
        } else {
            array.push(id);
        }
    }

    toggleRegion(item){
        self.toggleFilter(item, self.selectedRegions);
    }

    toggleArea(item){
        self.toggleFilter(item, self.selectedAreas);
    }

    toggleTag(item){
        self.toggleFilter(item, self.selectedTags);
    }

    toggleCamera(item){
        self.toggleFilter(item, self.selectedCameras);
    }

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