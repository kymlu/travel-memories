import {
	ATTRIBUTES, DEFAULT_TIMEOUT, JAPAN, LONG_DATETIME_FORMAT_EN, LONG_DATETIME_FORMAT_JP, TAIWAN, TAGS
} from "../../js/constants.js";
import { startHandleDrag } from "../../js/globals.js";
import {
	addClickListeners, addRemoveNoDisplay, getBilingualText,
	getPictureDate, setBilingualProperty, sortByEnglishName
} from "../../js/utils.js";

/** The Pic Info class. */
export default class PicInfo extends HTMLElement {
	#elements;

	constructor() {
		super();
		this.isVisible = true;
		this.searchTermEng = "";
		this.searchTermJp = "";
		this.favouriteTag = this.#createfavouriteTag();
		this.isMoving = false;

		fetch("components/pic-info/pic-info.html")
			.then(response => response.text())
			.then(html => {
				this.innerHTML = html;
			})
			.catch(error => {
				console.error("Error loading fullscreen.", error);
			});
	}

	connectedCallback() {
		setTimeout(() => {
			this.#elements = {
				drawer: this.querySelector("#pic-info-drawer"),
				dateEn: this.querySelector("#fullscreen-eng-date"),
				dateJp: this.querySelector("#fullscreen-jp-date"),
				cityEn: this.querySelector("#fullscreen-eng-city"),
				cityJp: this.querySelector("#fullscreen-jp-city"),
				captionEn: this.querySelector("#fullscreen-eng-caption"),
				captionJp: this.querySelector("#fullscreen-jp-caption"),
				camera: this.querySelector("#camera-info"),
				lens: this.querySelector("#lens-info"),
				technical: this.querySelector("#technical-info"),
				tags: this.querySelector("#img-tags")
			};
			setTimeout(() => {
				setBilingualProperty([
					["search-eng", "Google in English", "英語でググる"],
					["search-jp", "Google in Japanese", "日本語でググる"]
				], ATTRIBUTES.TITLE);

				addClickListeners([
					["pic-info-bg", this.hide.bind(this)],
					["pic-info-drawer", (event) => { event.stopPropagation(); }],
					["pic-info-btn", this.toggleVisibility.bind(this, null)],
					["pic-info-close-btn", this.hide.bind(this)],
					["search-eng", this.searchEnglish.bind(this)],
					["search-jp", this.searchJapanese.bind(this)]
				]);

				this.querySelector("#pic-info-handle").addEventListener("touchstart", e => {
					startHandleDrag(e, "pic-info-handle");
				}, false);

				// currently remove because it will not work on Apple <- what is this lol
				this.querySelector("#pic-info-details").addEventListener("touchstart", (event) => {
					event.stopPropagation();
				});

				this.querySelector("#pic-info-details").addEventListener("touchmove", (event) => {
					event.stopPropagation();
				});
			}, 50);
		}, 50);
	}

	/** Show the pic info section. */
	show() {
		if (this.isMoving || this.isVisible) return;
		this.isMoving = true;
		this.isVisible = true;
		addRemoveNoDisplay([this], false);
		let drawer = this.#elements.drawer;
		//TODO: transition on first portrait mode open
		addRemoveNoDisplay([drawer], false);
		setTimeout(() => {
			drawer.style.bottom = "0";
			drawer.style.marginRight = "0px";
			setTimeout(() => {
				this.isMoving = false;
			}, DEFAULT_TIMEOUT);
		}, 20);
	}

	/** Hide the pic info section. */
	hide() {
		if (this.isMoving || !this.isVisible) return;

		this.isMoving = true;
		this.isVisible = false;
		let drawer = this.#elements.drawer;
		drawer.style.bottom = `-${drawer.getBoundingClientRect().height}px`;
		drawer.style.marginRight = `-${drawer.getBoundingClientRect().width}px`;
		setTimeout(() => {
			addRemoveNoDisplay([drawer], true);
			addRemoveNoDisplay([this], true);
			this.isMoving = false;
		}, DEFAULT_TIMEOUT);
	}

	/** Show or hide pic info. */
	toggleVisibility(isShow) {
		if (isShow == undefined) {
			isShow = !this.isVisible;
		}

		if (isShow) {
			this.show();
		} else {
			this.hide();
		}
	}

	/** Sets the picture information. */
	setPicInfo(newPicture, countryId) {
		this.currentPic = newPicture;
		this.querySelector("#pic-info-details").scrollTo({ top: 0, behaviour: "instant" });
		// get dates
		if (this.currentPic.date) {
			let date = getPictureDate(new Date(this.currentPic.date), this.currentPic.offset);
			try {
				this.#elements.dateEn.innerHTML = LONG_DATETIME_FORMAT_EN.format(date);
				this.#elements.dateJp.innerHTML = LONG_DATETIME_FORMAT_JP.format(date);
			} catch (error) {
				console.error(error);
			}
		} else {
			this.#elements.dateEn.innerHTML = "Unknown date";
			this.#elements.dateJp.innerHTML = "不明な日付";
		}
		let area = this.currentPic.area;

		// English text for searching
		this.searchTermEng = this.#getEnglishLocation(countryId) + (area.englishName ?? "");
		this.#elements.cityEn.innerHTML = this.searchTermEng;

		// Japanese text for searching
		this.searchTermJp = (area.japaneseName ?? area.englishName ?? "") + this.#getJapaneseLocation(countryId);
		this.#elements.cityJp.innerHTML = this.searchTermJp;

		// image description
		this.editDetail(this.currentPic.descriptionEnglish, this.#elements.captionEn);
		this.editDetail(this.currentPic.descriptionJapanese, this.#elements.captionJp);
		// image exif info
		this.editDetail(this.currentPic.cameraModel, this.#elements.camera);
		this.editDetail(this.currentPic.lens, this.#elements.lens);

		this.#elements.technical.replaceChildren();
		let technicalCount = 0;
		if (this.currentPic.fStop) {
			let tempElement = document.createElement("span");
			tempElement.innerHTML = `\u0192/${this.currentPic.fStop}`;
			this.#elements.technical.appendChild(tempElement);
			technicalCount++;
		}
		if (this.currentPic.shutterSpeed) {
			let tempElement = document.createElement("span");
			tempElement.innerHTML = this.currentPic.shutterSpeed;
			this.#elements.technical.appendChild(tempElement);
			technicalCount++;
		}
		if (this.currentPic.iso) {
			let tempElement = document.createElement("span");
			tempElement.innerHTML = `iso ${this.currentPic.iso}`;
			this.#elements.technical.appendChild(tempElement);
			technicalCount++;
		}
		if (technicalCount == 0) {
			addRemoveNoDisplay([this.#elements.technical], true);
		} else {
			addRemoveNoDisplay([this.#elements.technical], false);
		}

		// add tags
		this.#elements.tags.replaceChildren();
		this.currentPic.tags.map(x => { return TAGS.find(function (t) { return t.id == x }) })
			.sort(sortByEnglishName)
			.forEach(tag => {
				let tempElement = document.createElement("div");
				tempElement.classList.add("img-tag");
				tempElement.innerHTML = getBilingualText(tag.englishName, tag.japaneseName);
				this.#elements.tags.appendChild(tempElement);
			});

		if (this.currentPic.isFavourite) {
			this.#elements.tags.appendChild(this.favouriteTag);
		}
	}

	/**
	 * Adds the text to the section, or hides the section if the detail is not found.
	 * @param {string} detail - the text to display
	 * @param {HTMLElement} element - the element to place the detail into.
	 */
	editDetail(detail, element) {
		if (detail) {
			addRemoveNoDisplay([element], false);
			element.innerHTML = detail;
		} else {
			addRemoveNoDisplay([element], true);
		}
	}

	/** Searches the English search term. */
	searchEnglish() {
		this.#search(this.searchTermEng);
	}

	/** Searches the Japanese search term. */
	searchJapanese() {
		this.#search(this.searchTermJp)
	}

	/** Creates the favourite tag. */
	#createfavouriteTag() {
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
	#getEnglishLocation(countryId) {
		let location = null;
		if (this.currentPic.locationEnglish) {
			location = this.currentPic.locationEnglish;
		} else if (countryId === JAPAN && this.currentPic.locationJapanese) {
			location = this.currentPic.locationJapanese;
		} else if (countryId === TAIWAN && this.currentPic.locationChinese) {
			location = this.currentPic.locationChinese;
		}
		return location ? `${location}, ` : "";
	}

	/** Gets the appropriate location text for the Japanese section. */
	#getJapaneseLocation(countryId) {
		let location = null;
		if (this.currentPic.locationJapanese) {
			location = this.currentPic.locationJapanese;
		} else if (countryId === TAIWAN && this.currentPic.locationChinese) {
			location = this.currentPic.locationChinese;
		} else if (this.currentPic.locationEnglish) {
			location = this.currentPic.locationEnglish;
		}
		return location ? `　${location}` : "";
	}
}

customElements.define("pic-info", PicInfo);