/// IMPORTS
import BaseElement from '../../js/base-element.js';
import {
	CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT, SCROLL_THRESHOLD, TAGS
} from '../../js/constants.js'
import { isGalleryView, onSelectNewRegion } from '../../js/globals.js';
import {
	addClickListeners, addRemoveClass, addRemoveNoDisplay, addRemoveTransparent,
	fetchInnerHtml, getBilingualText, getImageAddress, getScrollPosition, scrollToTop, sortImgs
} from '../../js/utils.js';
import CustomHeader from '../../components/header/header.js';
import RegionInfo from './components/drawer/region-info/region-info.js';
import FilterPopup from './components/filter-popup/filter-popup.js'
import Fullscreen from './components/fullscreen/fullscreen.js';
import ImagePolaroid from './components/polaroid/img-polaroid/img-polaroid.js';
import TextPolaroid from './components/polaroid/txt-polaroid/txt-polaroid.js';
import RegionDropdown from './components/region-dropdown/region-dropdown.js';

/** The Gallery View. */
export default class GalleryView extends BaseElement {
	constructor() {
		super();
		/// VARIABLES
		// filter
		/** @type {CustomHeader} */
		this.header = null;
		document.addEventListener(CUSTOM_EVENT_TYPES.HEADER_SET,
			(event) => {
				this.header = event.detail.header;
			});
		document.addEventListener(CUSTOM_EVENT_TYPES.HEADER_UPDATED,
			() => { this.#adjustPosition(); });

		// region info
		this.currentRegion = null;
		this.isNewCountry = true;
		this.previousRegion = null;
		this.currentCountry = null;

		this.isToTopVisible = false;

		// image loading
		this.allImages = null;
		this.visibleImages = [];
		this.isLoadingImages = false;
		this.imageLoadIndex = 0;
		this.currentPolaroidCount = 0;
		this.isImageAngledLeft = true;
		this.imageLoadLimit = 10;
		/** @type RegionDropdown */
		this.regionDropdown = null;
		/** @type RegionInfo */
		this.regionInfo = null;
		/** @type FilterPopup */
		this.filterPopup = null;
		/** @type Fullscreen */
		this.fullscreen = null;

		this.noPicturesText = getBilingualText("No pictures available (yet)", "写真は(まだ)ありません");

		document.addEventListener(CUSTOM_EVENT_TYPES.NEW_COUNTRY_SELECTED,
			(event) => { this.handleNewCountry(event.detail.country) });
	}

	connectedCallback() {
		fetchInnerHtml("views/gallery-view/gallery-view.html", this, true)
			.then(() => {
				setTimeout(() => {
					this._elements = {
						view: this.queryById("gallery-view"),
						gallery: this.queryById("gallery"),
						toTopButton: this.queryById("to-top-btn"),
					}

					this.regionDropdown = this.shadowRoot.querySelector("region-dropdown");
					this.regionInfo = this.shadowRoot.querySelector("region-info");
					this.fullscreen = this.shadowRoot.querySelector("fullscreen-component");
					this.filterPopup = this.shadowRoot.querySelector("filter-popup");

					this.classList.add("opacity-transition");

					window.onscroll = () => {
						if (isGalleryView()) {
							this.onScrollFunction();
						}
					};

					window.addEventListener("resize", () => {
						if (isGalleryView()) {
							this.#adjustPosition();
						}
					});

					let changeFilterQueryButton = document.createElement("button");
					changeFilterQueryButton.classList.add("action-btn");
					changeFilterQueryButton.innerHTML = getBilingualText("Change filters", "フィルターを変更する");

					this.filterPopup.addEventListener(CUSTOM_EVENT_TYPES.FILTER_POPUP_SUBMITTED, event => {
						this.filterImages(event.detail.isOnlyFavs,
							event.detail.keyword,
							event.detail.selectedRegions,
							event.detail.selectedAreas,
							event.detail.selectedTags,
							event.detail.selectedCameras);

						scrollToTop(true);
						this._elements.gallery.replaceChildren();
						this.previousRegion = null;
						if (this.visibleImages.length == 0) {
							this._elements.gallery.innerHTML = this.noPicturesText;
							this._elements.gallery.appendChild(changeFilterQueryButton);
							addRemoveClass([this._elements.gallery], "flex-column", true);
						} else {
							addRemoveClass([this._elements.gallery], "flex-column", false);
							this.imageLoadIndex = 0;
							this.currentPolaroidCount = 0;
							this.loadImages();
						}
					});

					setTimeout(() => {
						addClickListeners([
							[this._elements.toTopButton, scrollToTop],
							[changeFilterQueryButton, this.filterPopup.open.bind(this.filterPopup, null)]
						]);

						this._elements.toTopButton.title = getBilingualText("Go to top", "トップに移動する");
						addRemoveNoDisplay([this], true);
					}, 50);

				}, 50);
			});
	}

	/** Open the gallery page */
	show() {
		this.regionDropdown.close();
		this.regionInfo.show(false);
		scrollToTop(false);
		addRemoveTransparent([this._elements.view], false);
	}

	/** Close the gallery page */
	hide() {
		this.regionDropdown.close();
		this.regionInfo.hide(false);
		scrollToTop(false);
		document.body.style.overflowY = "hidden";
		addRemoveTransparent([this._elements.view], true);
		setTimeout(() => {
			addRemoveNoDisplay([this], true);
			document.body.style.overflowY = "auto";
		}, DEFAULT_TIMEOUT);
	}

	// regenerating data
	/** Reset some country-dependant variables. */
	handleNewCountry(newCountry) {
		this.isNewCountry = true;
		this.currentCountry = newCountry;
		this.allImages = [];
		this.visibleImages = [];
	}

	/** Set values based on a new user-selected region.
	 * @param {any[]} regionData - the new region's data
	 * @param {boolean} isSingleRegionSelected
	 */
	setNewRegion(regionData, isSingleRegionSelected, isNewGallery) {
		scrollToTop(false);
		addRemoveNoDisplay([this], false);
		addRemoveTransparent([this._elements.view], true);
		setTimeout(() => {
			this.regionDropdown.changeSelectedRegion(
				!this.isNewCountry ? this.currentRegion?.id : null,
				isSingleRegionSelected ? regionData[0]?.id : null);

			this.currentRegion = isSingleRegionSelected ? regionData[0] : null;

			this.isNewCountry = false;

			let regionsList = [];
			let areaList = [];

			if (isSingleRegionSelected) {
				regionsList = [this.currentRegion];
				areaList = this.currentRegion.areas;
				this.header.setRegionTitle(this.currentRegion.englishName, this.currentRegion.japaneseName);
			} else {
				regionsList = regionData.map(rgn => {
					return {
						"id": rgn.id,
						"englishName": rgn.englishName,
						"japaneseName": rgn.japaneseName
					}
				});

				areaList = regionData.flatMap(rgn => rgn.areas);
				this.header.setRegionTitle(this.currentCountry.englishName, this.currentCountry.japaneseName);
			}

			this.regionInfo.setNewRegionInfo(regionsList, areaList, isSingleRegionSelected, isNewGallery);

			// get all images
			this.allImages = regionData.flatMap(rgn => {
				return rgn.imageList.map(img => {
					let area = areaList.find(area => area.id == img.area);
					return ({
						...img,
						isVisible: true,
						region: {
							"id": rgn.id,
							"englishName": rgn.englishName,
							"japaneseName": rgn.japaneseName
						},
						area: {
							"id": area.id,
							"englishName": area.englishName,
							"japaneseName": area.japaneseName
						}
					})
				});
			}).sort(sortImgs);

			this.visibleImages = [...this.allImages];

			// set filters
			let tempTags = new Set(this.allImages.flatMap(x => { return x.tags }));
			let tagList = TAGS.filter(x => tempTags.has(x.id));
			let cameraList = [...new Set(this.allImages.map(x => x.cameraModel))];
			this.filterPopup.regenerateFilters(
				this.currentRegion != null,
				regionsList,
				areaList,
				tagList,
				cameraList,
				this.currentCountry.officialRegionNameEnglish,
				this.currentCountry.officialRegionNameJapanese
			);

			this.header.toggleFilterIndicator(false);
			this.header.flipRegionNameArrow(false);

			// clear existing gallery
			this._elements.gallery.replaceChildren();
			this.isImageAngledLeft = false;
			this.imageLoadIndex = 0;
			this.currentPolaroidCount = 0;
			this.previousRegion = null;

			// add pictures
			if (this.allImages.length > 0) {
				this.loadImages();
			} else {
				this._elements.gallery.innerHTML = this.noPicturesText;
			}
		}, 0);
	}

	loadImages() {
		this.isLoadingImages = true;
		// dynamically load next set of images
		for (let i = 0; this.imageLoadIndex < this.visibleImages.length && i < this.imageLoadLimit; i++, this.currentPolaroidCount++) {
			let img = this.visibleImages[this.imageLoadIndex];
			if (this.currentRegion == null && (this.previousRegion == null || this.previousRegion != img.region.id)) {
				// text separator polaroid
				this.previousRegion = img.region.id;
				let blankPol = this.createPolaroidBlank(img.region, this.isImageAngledLeft);
				this.isImageAngledLeft = !this.isImageAngledLeft;
				this._elements.gallery.appendChild(blankPol);
			} else {
				// image polaroid
				let pol = this.createPolaroidImg(img, this.isImageAngledLeft);
				this.isImageAngledLeft = !this.isImageAngledLeft;
				this._elements.gallery.appendChild(pol);
				this.imageLoadIndex++;
			}

			// set the limit to something different if the size of the screen changed
			if (i == 0) {
				let imgsPerScreen = Math.max(Math.floor(this._elements.gallery.getBoundingClientRect().width / 275) * (Math.floor(window.innerHeight / 350)), 5);
				// fill the remainder if the number of images does not fill the screen
				this.imageLoadLimit = imgsPerScreen * 2 + (imgsPerScreen - (this.currentPolaroidCount % imgsPerScreen / 2));
			}
		}
		this.isLoadingImages = false;
	}

	// polaroids
	createPolaroidImg(img, isImageAngledLeft) {
		let newPolaroid = new ImagePolaroid(
			isImageAngledLeft,
			getImageAddress(this.currentCountry.id, img.region.id, img.fileName),
			img.isFavourite ?? false,
			img.date,
			img.offset,
			img.descriptionEnglish ?? "",
			img.descriptionJapanese ?? ""
		);

		// listeners
		newPolaroid.addEventListener("click", () => { this.fullscreen.open(this.visibleImages, img, this.currentCountry.id); });

		return newPolaroid;
	}

	createPolaroidBlank(rgn, isImageAngledLeft) {
		let newPolaroid = new TextPolaroid(
			isImageAngledLeft,
			rgn.englishName,
			rgn.japaneseName
		);

		newPolaroid.addEventListener("click", () => { onSelectNewRegion(rgn.id, null, false) });

		return newPolaroid;
	}

	// image filtering
	/** Shows the filter popup. */
	showFilter() {
		this.filterPopup.open();
	}

	/** Check whether the text contains the keyword. */
	doesTextIncludeKeyword(text, keywordSearchTerm) {
		return text && text.toLowerCase().includes(keywordSearchTerm.toLowerCase());
	}

	/**
	 * @param {any} img 
	 * @param {boolean} isOnlyFavs 
	 * @param {string} keywordSearchTerm 
	 * @param {string[]} selectedRegions 
	 * @param {string[]} selectedAreas 
	 * @param {string[]} selectedTags 
	 * @param {string[]} selectedCameras 
	 * @returns a value indicating whether the image should be visible based on the filters.
	 */
	includeImage(img,
		isOnlyFavs,
		keywordSearchTerm,
		selectedRegions,
		selectedAreas,
		selectedTags,
		selectedCameras) {
		let region = img.region;
		let area = img.area;
		let tagsWithKeyword = TAGS.filter(tag => img.tags.includes(tag.id) &&
			(this.doesTextIncludeKeyword(tag.englishName, keywordSearchTerm) ||
				this.doesTextIncludeKeyword(tag.japaneseName, keywordSearchTerm)));
		let keywordsToSearch = [
			img.descriptionEnglish,
			img.descriptionJapanese,
			img.locationEnglish,
			img.locationJapanese,
			region?.englishName,
			region?.japaneseName,
			area?.englishName,
			area?.japaneseName,
			img.cameraModel
		].filter(Boolean);

		return (!isOnlyFavs || img.isFavourite) &&
			(keywordSearchTerm == "" ||
				tagsWithKeyword.length > 0 ||
				keywordsToSearch.some(keyword => this.doesTextIncludeKeyword(keyword, keywordSearchTerm))) &&
			(selectedRegions.length == 0 || selectedRegions.includes(region.id)) &&
			(selectedAreas.length == 0 || selectedAreas.includes(area.id)) &&
			(selectedTags.length == 0 || selectedTags.filter(value => img.tags.includes(value)).length > 0) &&
			(selectedCameras.length == 0 || selectedCameras.includes(img.cameraModel));
	}

	/**
	 * @param {boolean} isOnlyFavs 
	 * @param {string} keyword 
	 * @param {string[]} selectedRegions 
	 * @param {string[]} selectedAreas 
	 * @param {string[]} selectedTags 
	 * @param {string[]} selectedCameras 
	 */
	filterImages(isOnlyFavs,
		keyword,
		selectedRegions,
		selectedAreas,
		selectedTags,
		selectedCameras) {
		this.visibleImages = this.allImages.filter(img => this.includeImage(img,
			isOnlyFavs,
			keyword,
			selectedRegions,
			selectedAreas,
			selectedTags,
			selectedCameras));
		this.header.toggleFilterIndicator(this.allImages.length != this.visibleImages.length);
	}

	// scrolling behaviours
	onScrollFunction() {
		this.toggleFloatingButton();
		this.regionInfo.handleScroll();

		if (!this.isLoadingImages && this.imageLoadIndex < this.visibleImages.length &&
			(window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 200) {
			this.loadImages();
		}
	}

	#adjustPosition() {
		if (this._elements.view && this._elements.view.style) {
			this._elements.view.style.marginTop = `${this.header?.getHeight()}px`;
		}
	}

	// other elements
	toggleFloatingButton() {
		if (getScrollPosition() > SCROLL_THRESHOLD && !this.isToTopVisible) {
			addRemoveNoDisplay([this._elements.toTopButton], false);
			addRemoveTransparent([this._elements.toTopButton], false);
			this.isToTopVisible = true;
		} else if (getScrollPosition() <= SCROLL_THRESHOLD && this.isToTopVisible) {
			addRemoveTransparent([this._elements.toTopButton], true);
			setTimeout(() => { addRemoveNoDisplay([this._elements.toTopButton], true); }, DEFAULT_TIMEOUT)
			this.isToTopVisible = false;
		}
	}

	toggleRegionDropdown() {
		this.regionDropdown.toggleVisibility();
	}

	toggleRegionInfo(isVisible) {
		this.regionInfo.toggleVisibility(isVisible);
	}
}

window.customElements.define("gallery-view", GalleryView);