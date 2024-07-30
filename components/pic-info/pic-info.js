import { ATTRIBUTES, LONG_DATETIME_FORMAT_EN, LONG_DATETIME_FORMAT_JP } from "../../js/constants.js";
import { startHandleDrag } from "../../js/globals.js";
import { addClickListeners, addRemoveNoDisplay, getBilingualText, getPictureDate, setBilingualAttribute } from "../../js/utils.js";

// TODO: check if self works

/** The Pic Info class. */
export default class PicInfo extends HTMLElement{
    constructor(){
        super();
        this.isVisible = false;
		this.searchTermEng = "";
		this.searchTermJp = "";
		this.favouriteTag = this.#createfavouriteTag();

        this.elements = {
            drawer: document.getElementById("pic-info-drawer"),
			dateEn: document.getElementById("fullscreen-eng-date"),
			dateJp: document.getElementById("fullscreen-jp-date"),
			cityEn: document.getElementById("fullscreen-eng-city"),
			cityJp: document.getElementById("fullscreen-jp-city"),
			captionEn: document.getElementById("fullscreen-eng-caption"),
			captionJp: document.getElementById("fullscreen-jp-caption"),
			camera: document.getElementById("camera-info"),
			lens: document.getElementById("lens-info"),
			technical: document.getElementById("technical-info"),
			tags: document.getElementById("img-tags")
		};

        setBilingualAttribute([
			["search-eng", "Google in English", "英語でググる"],
			["search-jp", "Google in Japanese", "日本語でググる"]
		], ATTRIBUTES.TITLE);

		addClickListeners([
			["pic-info-bg", this.hidePicInfo],
			["pic-info-drawer", (event) => { event.stopPropagation(); }],
			["pic-info-btn", this.togglePicInfo],
			["pic-info-close-btn", this.hidePicInfo],
			["search-eng", this.searchEnglish],
			["search-jp", this.searchJapanese]
		]);

		document.getElementById("pic-info-handle").addEventListener("touchstart", e => { startHandleDrag(e, "pic-info-handle") }, false);

		// currently remove because it will not work on Apple <- what is this lol
		document.getElementById("pic-info-details").addEventListener("touchstart", (event) => {
			event.stopPropagation();
		});
		document.getElementById("pic-info-details").addEventListener("touchmove", (event) => {
			event.stopPropagation();
		});
    }

	/** Show the pic info section. */
	showPicInfo() {
		this.isVisible = true;
		addRemoveNoDisplay([this], false);
		let drawer = this.elements.drawer;
		//TODO: transition on first portrait mode open
		addRemoveNoDisplay([drawer], false);
		setTimeout(() => {
			drawer.style.bottom = "0";
			drawer.style.marginRight = "0px";
		}, 20);
	}

	/** Hide the pic info section. */
	hidePicInfo() {
		this.isVisible = false;
		let drawer = this.elements.drawer;
		drawer.style.bottom = `-${drawer.getBoundingClientRect().height}px`;
		drawer.style.marginRight = `-${drawer.getBoundingClientRect().width}px`;
		setTimeout(() => {
			addRemoveNoDisplay([drawer], true);
			addRemoveNoDisplay([this], true);
		}, DEFAULT_TIMEOUT);
	}

	/** Show or hide pic info. */
	togglePicInfo(isShow) {
		if (isShow == undefined) {
			isShow = !this.isVisible;
		}

		if (isShow) {
			this.showPicInfo();
		} else {
			this.hidePicInfo();
		}
	}

    /** Sets the picture information. */
	setPicInfo(newPicture) {
		// get dates
		if (newPicture.date) {
			let date = getPictureDate(new Date(newPicture.date), newPicture.offset);
			this.elements.dateEn.innerHTML = LONG_DATETIME_FORMAT_EN.format(date);
			this.elements.dateJp.innerHTML = LONG_DATETIME_FORMAT_JP.format(date);
		} else {
			this.elements.dateEn.innerHTML = "Unknown date";
			this.elements.dateJp.innerHTML = "不明な日付";
		}
		let area = newPicture.area;

		// English text for searching
		this.searchTermEng = this.#getEnglishLocation() + (area.englishName ?? "");
		this.elements.cityEn.innerHTML = this.searchTermEng;

		// Japanese text for searching
		this.searchTermJp = (area.japaneseName ?? area.englishName ?? "") + this.#getJapaneseLocation();
		this.elements.cityJp.innerHTML = this.searchTermJp;

		// image description
        this.editDetail(newPicture.descriptionEnglish, this.elements.captionEn);
        this.editDetail(newPicture.descriptionJapanese, this.elements.captionJp);
		// image exif info
        this.editDetail(newPicture.cameraModel, this.elements.camera);
        this.editDetail(newPicture.lens, this.elements.lens);

		this.elements.technical.replaceChildren();
        let technicalCount = 0;
		if (newPicture.fStop) {
			let tempElement = document.createElement("div");
			tempElement.innerHTML = `\u0192/${newPicture.fStop}`;
			this.elements.technical.appendChild(tempElement);
            technicalCount++;
		}
		if (newPicture.shutterSpeed) {
			let tempElement = document.createElement("div");
			tempElement.innerHTML = currentPic.shutterSpeed;
			this.elements.technical.appendChild(tempElement);
            technicalCount++;
		}
		if (newPicture.iso) {
			let tempElement = document.createElement("div");
			tempElement.innerHTML = `iso ${currentPic.iso}`;
			this.elements.technical.appendChild(tempElement);
            technicalCount++;
		}
		if (technicalCount == 0) {
			addRemoveNoDisplay([this.elements.technical], true);
		} else {
			addRemoveNoDisplay([this.elements.technical], false);
		}

		// add tags
		this.elements.tags.replaceChildren();
		newPicture.tags.map(x => { return TAGS.find(function (t) { return t.id == x }) })
			.sort(sortByEnglishName)
			.forEach(tag => {
				tempElement = document.createElement("div");
				tempElement.classList.add("img-tag");
				tempElement.innerHTML = getBilingualText(tag.englishName, tag.japaneseName);
				this.elements.tags.appendChild(tempElement);
			});

		if (newPicture.isFavourite) {
			this.elements.tags.appendChild(this.favouriteTag);
		}
	}

    /**
     * Adds the text to the section, or hides the section if the detail is not found.
     * @param {string} detail - the text to display
     * @param {HTMLElement} element - the element to place the detail into.
     */
    editDetail(detail, element){
        if (detail) {
			addRemoveNoDisplay([element], false);
			element.innerHTML = detail;
		} else {
			addRemoveNoDisplay([element], true);
		}
    }

	/** Searches the English search term. */
	searchEnglish() {
		this.#search(searchTermEng);
	}

	/** Searches the Japanese search term. */
	searchJapanese() {
		this.#search(searchTermJp)
	}

    /** Creates the favourite tag. */
    #createfavouriteTag(){
        let tempElement = document.createElement("div");
		tempElement.classList.add("img-tag");
		tempElement.innerHTML = getBilingualText("Favourited", "お気に入り");
		let tempStar = document.createElement("span");
		tempStar.classList.add("in-btn-icon");
		tempStar.style.marginRight = "5px";
		tempStar.innerHTML = "&#xf005";
		tempElement.prepend(tempStar);
        return tempElement;
    }
	
    /** 
	 * Open a new window to Google a search term.
	 * @param {string} searchTerm  */
	#search(searchTerm) {
		window.open(`https://www.google.com/search?q=${searchTerm}`);
	}

	/** Gets the appropriate location text for the English section. */
	#getEnglishLocation() {
		let retVal = "";
		if (this.currentPic.locationEnglish) {
			retVal = `${this.currentPic.locationEnglish}, `;
		} else if (currentCountryId === JAPAN && this.currentPic.locationJapanese) {
			retVal = `${this.currentPic.locationJapanese}, `;
		} else if (currentCountryId === TAIWAN && this.currentPic.locationChinese) {
			retVal = `${this.currentPic.locationChinese}, `;
		}
		return retVal;
	}

	/** Gets the appropriate location text for the Japanese section. */
	#getJapaneseLocation() {
		let retVal = "";
		if (this.currentPic.locationJapanese) {
			retVal = `${this.currentPic.locationJapanese}, `;
		} else if (currentCountryId === TAIWAN && this.currentPic.locationChinese) {
			retVal = `${this.currentPic.locationChinese}, `;
		} else if (this.currentPic.locationEnglish) {
			retVal = `${this.currentPic.locationEnglish}, `;
		}
		return retVal;
	}
}

customElements.define("pic-info", PicInfo);