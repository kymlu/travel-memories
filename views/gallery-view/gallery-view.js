/// IMPORTS
import BaseElement from '../../js/base-element.js';
import {
	ATTRIBUTES, CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT,
	SCROLL_THRESHOLD, TAGS
} from '../../js/constants.js'
import { isGalleryView, onSelectNewRegion } from '../../js/globals.js';
import {
	addClickListeners, addRemoveClass, addRemoveNoDisplay,
	addRemoveTransparent, fetchInnerHtml, getBilingualText,
	getImageAddress, getScrollPosition, isPortraitMode,
	scrollToTop, setBilingualProperty, sortImgs
} from '../../js/utils.js';
import CustomHeader from '../../components/header/header.js';
import RegionInfo from './components/region-info/region-info.js';
import FilterPopup from './components/filter-popup/filter-popup.js'
import Fullscreen from '../fullscreen/fullscreen.js';
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
				this._elements = {
					view: this.queryById("container"),
					gallery: this.queryById("gallery"),
					toTopButton: this.queryById("to-top-btn"),
					pictureCount: this.queryById("picture-count"),
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
				changeFilterQueryButton.innerText = getBilingualText("Change filters", "フィルターを変更する");

				this.filterPopup.addEventListener(CUSTOM_EVENT_TYPES.FILTER_POPUP_SUBMITTED, event => {
					this.filterImages(event.detail.isOnlyFavs,
						event.detail.keyword,
						event.detail.selectedRegions,
						event.detail.selectedAreas,
						event.detail.selectedTags,
						event.detail.selectedCameras);

					this.regionInfo.show(false);
					scrollToTop(true);
					this._elements.gallery.replaceChildren();
					this.previousRegion = null;
					addRemoveNoDisplay([this._elements.pictureCount], true);
					if (this.visibleImages.length == 0) {
						this._elements.gallery.innerText = this.noPicturesText;
						this._elements.gallery.appendChild(changeFilterQueryButton);
						addRemoveClass([this._elements.gallery], "flex-column", true);
						addRemoveClass([this._elements.gallery], "space-on-top", true);
					} else {
						this.setImageCount();
						addRemoveClass([this._elements.gallery], "space-on-top", false);
						addRemoveClass([this._elements.gallery], "flex-column", false);
						this.imageLoadIndex = 0;
						this.currentPolaroidCount = 0;
						this.loadImages();
					}
				});

				addClickListeners([
					[this._elements.toTopButton, scrollToTop],
					[changeFilterQueryButton, this.filterPopup.open.bind(this.filterPopup, null)]
				]);

				this._elements.toTopButton.title = getBilingualText("Go to top", "トップに移動する");
				addRemoveNoDisplay([this], true);

			});
	}

	/** Open the gallery page */
	show() {
		this.regionDropdown.close();
		scrollToTop(false);
		addRemoveTransparent([this._elements.view], false);
		this.regionInfo.show(false);
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
		addRemoveNoDisplay([this._elements.pictureCount], true);
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
				this.header.setRegionTitle(this.currentRegion.nameEn, this.currentRegion.nameJp);
			} else {
				regionsList = regionData.map(rgn => {
					return {
						"id": rgn.id,
						"nameEn": rgn.nameEn,
						"nameJp": rgn.nameJp
					}
				});

				areaList = regionData.flatMap(rgn => rgn.areas);
				this.header.setRegionTitle(this.currentCountry.nameEn, this.currentCountry.nameJp);
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
							"nameEn": rgn.nameEn,
							"nameJp": rgn.nameJp
						},
						area: {
							"id": area.id,
							"nameEn": area.nameEn,
							"nameJp": area.nameJp
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
				this.currentCountry.regionTypeEn,
				this.currentCountry.regionTypeJp
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
				this.setImageCount();
				this.loadImages();
			} else {
				this._elements.gallery.innerText = this.noPicturesText;
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
		if (this.imageLoadIndex == this.visibleImages.length) {
			addRemoveNoDisplay([this._elements.pictureCount], false);
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
			img.descriptionEn ?? "",
			img.descriptionJp ?? ""
		);

		// listeners
		newPolaroid.addEventListener("click", () => { this.fullscreen.open(this.visibleImages, img, this.currentCountry.id); });

		return newPolaroid;
	}

	createPolaroidBlank(rgn, isImageAngledLeft) {
		let newPolaroid = new TextPolaroid(
			isImageAngledLeft,
			rgn.nameEn,
			rgn.nameJp
		);

		newPolaroid.addEventListener("click", () => { onSelectNewRegion(rgn.id, null, false) });

		return newPolaroid;
	}

	setImageCount() {
		let countText = this.visibleImages.length == this.allImages.length ?
			`${this.allImages.length}` :
			`${this.visibleImages.length}/${this.allImages.length}`;

		setBilingualProperty([
			[this._elements.pictureCount,
			`${countText} pictures`,
			`${countText} 枚`]
		], ATTRIBUTES.INNERTEXT);
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
			(this.doesTextIncludeKeyword(tag.nameEn, keywordSearchTerm) ||
				this.doesTextIncludeKeyword(tag.nameJp, keywordSearchTerm)));
		let keywordsToSearch = [
			img.descriptionEn,
			img.descriptionJp,
			img.locationEn,
			img.locationJp,
			region?.nameEn,
			region?.nameJp,
			area?.nameEn,
			area?.nameJp,
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
			(window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - (isPortraitMode() ? 200 : 400)) {
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