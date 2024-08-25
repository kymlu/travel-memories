import {
	ATTRIBUTES, DEFAULT_TIMEOUT, JAPAN, LONG_DATETIME_FORMAT_EN, LONG_DATETIME_FORMAT_JP, TAIWAN, TAGS
} from "../../../../../../js/constants.js";
import {
	addClickListeners, addRemoveNoDisplay, getBilingualText,
	getPictureDate, setBilingualProperty, sortByEnglishName
} from "../../../../../../js/utils.js";
import { fetchInnerHtml } from "../../../../../js/utils.js";
import BaseDrawer from "../base-drawer/base-drawer.js";

/** The Pic Info class. */
export default class PicInfo extends BaseDrawer {
	constructor() {
		super();
		this.isVisible = true;
		this.searchTermEng = "";
		this.searchTermJp = "";
		this.favouriteTag = this.#createfavouriteTag();
		this.isMoving = false;
	}

	connectedCallback() {
		fetchInnerHtml("views/gallery-view/components/drawer/pic-info/pic-info.html", this, true)
			.then(() => {
				super.connectedCallback();
				this._elements = {
					drawer: this.queryById("pic-info-drawer"),
					dateEn: this.queryById("fullscreen-eng-date"),
					dateJp: this.queryById("fullscreen-jp-date"),
					cityEn: this.queryById("fullscreen-eng-city"),
					cityJp: this.queryById("fullscreen-jp-city"),
					captionEn: this.queryById("fullscreen-eng-caption"),
					captionJp: this.queryById("fullscreen-jp-caption"),
					camera: this.queryById("camera-info"),
					lens: this.queryById("lens-info"),
					technical: this.queryById("technical-info"),
					tags: this.queryById("img-tags")
				};
				setTimeout(() => {
					setBilingualProperty([
						[this.queryById("search-eng"), "Google in English", "英語でググる"],
						[this.queryById("search-jp"), "Google in Japanese", "日本語でググる"],
						[this.queryByClassName("close-btn"), "Close", "閉じる"]
					], ATTRIBUTES.TITLE);

					addClickListeners([
						[this.queryById("pic-info-bg"), this.hide.bind(this)],
						[this.queryById("pic-info-drawer"), (event) => { event.stopPropagation(); }],
						[this.queryById("pic-info-close-btn"), this.hide.bind(this)],
						[this.queryById("search-eng"), this.searchEnglish.bind(this)],
						[this.queryById("search-jp"), this.searchJapanese.bind(this)]
					]);

					// currently remove because it will not work on Apple <- what is this lol
					this.queryById("pic-info-details").addEventListener("touchstart", (event) => {
						event.stopPropagation();
					});

					this.queryById("pic-info-details").addEventListener("touchmove", (event) => {
						event.stopPropagation();
					});

					TAGS.sort(sortByEnglishName).forEach(tag => {
						let tagElement = document.createElement("div");
						tagElement.classList.add("base-tag", "img-tag");
						let tagIcon = document.createElement("i");
						tagIcon.classList.add("fa", tag.faClass);
						let tagText = document.createElement("span");
						tagText.innerHTML = getBilingualText(tag.englishName, tag.japaneseName);
						tagElement.appendChild(tagIcon);
						tagElement.appendChild(tagText);
						tagElement.dataset.tagId = tag.id;
						this._elements.tags.appendChild(tagElement);
					});
					this._elements.tags.appendChild(this.#createfavouriteTag());
				}, 50);
			});
	}

	dragDownFunction() {
		super.dragDownFunction();
		this.hide();
	}

	/** Show the pic info section. */
	show() {
		if (this.isMoving || this.isVisible) return;
		this.isMoving = true;
		this.isVisible = true;
		addRemoveNoDisplay([this], false);
		let drawer = this._elements.drawer;
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
	hide(isNewFullscreenInstance) {
		if (this.isMoving || !this.isVisible) return;

		this.isMoving = true;
		this.isVisible = false;
		let drawer = this._elements.drawer;
		drawer.style.bottom = `-${drawer.getBoundingClientRect().height}px`;
		drawer.style.marginRight = `-${drawer.getBoundingClientRect().width}px`;
		setTimeout(() => {
			addRemoveNoDisplay([drawer], true);
			addRemoveNoDisplay([this], true);
			this.isMoving = false;
		}, isNewFullscreenInstance ? 0 : DEFAULT_TIMEOUT);
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
		this.queryById("pic-info-details").scrollTo({ top: 0, behaviour: "instant" });
		// get dates
		if (this.currentPic.date) {
			let date = getPictureDate(new Date(this.currentPic.date), this.currentPic.offset);
			try {
				this._elements.dateEn.innerHTML = LONG_DATETIME_FORMAT_EN.format(date);
				this._elements.dateJp.innerHTML = LONG_DATETIME_FORMAT_JP.format(date);
			} catch (error) {
				console.error(error);
			}
		} else {
			this._elements.dateEn.innerHTML = "Unknown date";
			this._elements.dateJp.innerHTML = "不明な日付";
		}
		let area = this.currentPic.area;

		// English text for searching
		this.searchTermEng = this.#getEnglishLocation(countryId) + (area.englishName ?? "");
		this._elements.cityEn.innerHTML = this.searchTermEng;

		// Japanese text for searching
		this.searchTermJp = (area.japaneseName ?? area.englishName ?? "") + this.#getJapaneseLocation(countryId);
		this._elements.cityJp.innerHTML = this.searchTermJp;

		// image description
		this.editDetail(this.currentPic.descriptionEnglish, this._elements.captionEn);
		this.editDetail(this.currentPic.descriptionJapanese, this._elements.captionJp);
		// image exif info
		this.editDetail(this.currentPic.cameraModel, this._elements.camera);
		this.editDetail(this.currentPic.lens, this._elements.lens);

		this._elements.technical.replaceChildren();
		let technicalCount = 0;
		if (this.currentPic.fStop) {
			let tempElement = document.createElement("span");
			tempElement.innerHTML = `\u0192/${this.currentPic.fStop}`;
			this._elements.technical.appendChild(tempElement);
			technicalCount++;
		}
		if (this.currentPic.shutterSpeed) {
			let tempElement = document.createElement("span");
			tempElement.innerHTML = this.currentPic.shutterSpeed;
			this._elements.technical.appendChild(tempElement);
			technicalCount++;
		}
		if (this.currentPic.iso) {
			let tempElement = document.createElement("span");
			tempElement.innerHTML = `iso ${this.currentPic.iso}`;
			this._elements.technical.appendChild(tempElement);
			technicalCount++;
		}
		if (technicalCount == 0) {
			addRemoveNoDisplay([this._elements.technical], true);
		} else {
			addRemoveNoDisplay([this._elements.technical], false);
		}

		// show/hide appropriate tags
		let allTags = Array.from(this._elements.tags.children);
		allTags.forEach(tag => {
			if (tag.dataset.tagId == undefined) {
				addRemoveNoDisplay([tag], !this.currentPic.isFavourite);
			} else {
				addRemoveNoDisplay([tag], !this.currentPic.tags.includes(tag.dataset.tagId));
			}
		});
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
		tempElement.classList.add("base-tag", "img-tag");
		tempElement.innerHTML = getBilingualText("Favourite", "お気に入り");
		let tempStar = document.createElement("i");
		tempStar.classList.add("fa", "fa-star");
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