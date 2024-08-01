/// IMPORTS
import FilterPopup from '../../components/popup/filter-popup/filter-popup.js'
import {
	addClickListeners, addRemoveNoDisplay, addRemoveTransparent, flipArrow, getBilingualText,
	getImageAddress, isPortraitMode, scrollToTop, setBilingualProperty, sortImgs
} from '../../js/utils.js';
import {
	CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT, SCROLL_THRESHOLD, TAGS,
	ATTRIBUTES
} from '../../js/constants.js'
import TextPolaroid from '../../components/polaroid/txt-polaroid/txt-polaroid.js';
import ImagePolaroid from '../../components/polaroid/img-polaroid/img-polaroid.js';
import Fullscreen from '../../components/fullscreen/fullscreen.js';
import { getCurrentCountry, isGalleryView, onSelectNewRegion, startHandleDrag } from '../../js/globals.js';
import RegionDropdown from '../../components/region-dropdown/region-dropdown.js';
import RegionInfo from '../../components/region-info/region-info.js';
import Loader from '../../components/loader/loader.js';
import CustomHeader from '../../components/header/header.js';

/** The Gallery View. */
export default class GalleryView extends HTMLElement {
	#elements;
	constructor(innerHTML, fullscreenElement, headerElement) {
		super();
		this.innerHTML = innerHTML;

		// TODO: restrict the loader to the gallery area instead of removing the top bar too
		// TODO: ensure the loader stops only after the mini map has no display removed
		/// VARIABLES
		// filter
		/** @type {FilterPopup} */
		this.filterPopup = new FilterPopup();
		/** @type {RegionDropdown} */
		this.regionDropdown = new RegionDropdown(headerElement);
		/** @type {RegionInfo} */
		this.regionInfo = new RegionInfo(headerElement);
		/** @type {Fullscreen} */
		this.fullscreen = fullscreenElement; //new Fullscreen();
		/** @type {CustomHeader} */
		this.header = headerElement;
		/** @type {Loader} */
		this.loader = null;

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

		this.#elements = {};

		this.noPicturesText = getBilingualText("No pictures available (yet)", "写真は(まだ)ありません");
	}

	connectedCallback() {
		setTimeout(() => {
			this.#elements = {
				gallery: this.querySelector("#gallery"),
				toTopButton: this.querySelector("#to-top-btn")
			}

			this.classList.add("opacity-transition");

			window.onscroll = (function () {
				if (isGalleryView() && this.loader == null) {
					this.onScrollFunction();
				}
			}).bind(this);

			this.filterPopup.addEventListener(CUSTOM_EVENT_TYPES.FILTER_POPUP_SUBMITTED, event => {
				filterImages(event.detail.isOnlyFavs,
					event.detail.keyword,
					event.detail.selectedRegions,
					event.detail.selectedAreas,
					event.detail.selectedTags,
					event.detail.selectedCameras);

				scrollToTop(true);
				document.getElementById("gallery").replaceChildren();
				if (visibleImages.length == 0) {
					document.getElementById("gallery").innerHTML = noPicturesText;
				} else {
					imageLoadIndex = 0;
					currentPolaroidCount = 0;
					loadImages();
				}
			});

			this.appendChild(this.filterPopup);

			setTimeout(() => {
				addRemoveTransparent([this.regionInfo, this.regionDropdown], true);
				this.insertBefore(this.regionInfo, this.#elements.gallery);
				this.appendChild(this.regionDropdown);

				setBilingualProperty([
					["dates-title", "Dates visited", "訪れた日付"]
				], ATTRIBUTES.INNERHTML);

				addClickListeners([
					[this.#elements.toTopButton, this.scrollToTop]
				]);

				document.getElementById("to-top-btn").title = getBilingualText("Go to top", "トップに移動する");
			}, 50);

		}, 50);
	}

	/** Open the gallery page */
	show() {
		this.regionDropdown.close();
		scrollToTop(false);
		this.regionInfo.show(false);
		addRemoveTransparent([this.#elements.gallery, this.#elements.toTopButton], false);
		addRemoveNoDisplay([this.#elements.gallery], false);
		document.getElementById("rgn-info-bg").classList.remove("visibility-hidden");
		addRemoveTransparent([this.#elements.toTopButton], false);
		if (isPortraitMode()) {
			document.getElementById("dates-title").scrollIntoView({ block: isPortraitMode() ? "end" : "start" });
		}
		addRemoveTransparent("rgn-info-bg", false);
	}

	/** Close the gallery page */
	hide() {
		this.regionDropdown.close();
		scrollToTop(false);
		addRemoveTransparent([this.#elements.gallery, this.#elements.toTopButton], true);
		setTimeout(() => {
			addRemoveNoDisplay([this.#elements.gallery, this.#elements.toTopButton], true);
		}, DEFAULT_TIMEOUT);
		this.regionInfo.hide(false);
		document.getElementById("rgn-info-bg").classList.add("visibility-hidden");
		addRemoveTransparent("rgn-info-bg", false);
	}

	// regenerating data
	/** Reset some country-dependant variables. */
	handleNewCountry() {
		this.isNewCountry = true;
		this.allImages = [];
		this.visibleImages = [];
		this.currentCountry = getCurrentCountry();
		this.regionDropdown.handleNewCountry();
		this.regionInfo.handleNewCountry(this.currentCountry.id);
		// region info
	}

	/** Set values based on a new user-selected region.
	 * @param {any[]} regionData - the new region's data
	 * @param {boolean} isSingleRegionSelected
	 */
	setNewRegion(regionData, isSingleRegionSelected) {
		this.regionDropdown.changeSelectedRegion(
			!this.isNewCountry ? this.currentRegion : null,
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

		this.regionInfo.setNewRegionInfo(this.currentCountry, regionsList, areaList, isSingleRegionSelected);

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

		setTimeout(() => {
			this.regionInfo.filterMiniMap(this.currentCountry, this.currentRegion);
		}, 1000);

		this.header.flipRegionNameArrow(false);

		// clear existing gallery
		this.#elements.gallery.replaceChildren();
		this.isImageAngledLeft = false;
		this.imageLoadIndex = 0;
		this.currentPolaroidCount = 0;
		this.previousRegion = null;

		// add pictures
		if (this.allImages.length > 0) {
			this.loadImages();
		} else {
			this.#elements.gallery.innerHTML = this.noPicturesText;
		}
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
				this.#elements.gallery.appendChild(blankPol);
			} else {
				// image polaroid
				let pol = this.createPolaroidImg(img, this.isImageAngledLeft);
				this.isImageAngledLeft = !this.isImageAngledLeft;
				this.#elements.gallery.appendChild(pol);
				this.imageLoadIndex++;
			}

			// set the limit to something different if the size of the screen changed
			if (i == 0) {
				let imgsPerScreen = Math.max(Math.floor(window.innerWidth / 265) * Math.floor(window.innerHeight / 325), 5);
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

		newPolaroid.addEventListener("click", () => { onSelectNewRegion(rgn.id) });

		return newPolaroid;
	}

	// scrolling behaviours
	onScrollFunction() {
		this.toggleFloatingButton();
		this.regionInfo.handleScroll();

		if (!this.isLoadingImages && this.imageLoadIndex < this.visibleImages.length &&
			(window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 100) {
			this.loadImages();
		}
	}

	toggleFloatingButton() {
		if (document.body.scrollTop > SCROLL_THRESHOLD && !this.isToTopVisible) {
			addRemoveNoDisplay([this.#elements.toTopButton], false);
			addRemoveTransparent([this.#elements.toTopButton], false);
			this.isToTopVisible = true;
		} else if (document.body.scrollTop <= SCROLL_THRESHOLD && this.isToTopVisible) {
			addRemoveTransparent([this.#elements.toTopButton], true);
			setTimeout(() => { addRemoveNoDisplay([this.#elements.toTopButton], true); }, DEFAULT_TIMEOUT)
			this.isToTopVisible = false;
		}
	}

	toggleRegionDropdown() {
		this.regionDropdown.toggleVisibility();
	}

	toggleRegionInfo(isVisible) {
		this.regionInfo.toggleVisibility(isVisible);
	}

	// image filtering
	/** Shows the filter popup. */
	showFilter() {
		this.filterPopup.open();
	}

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
			(doesTextIncludeKeyword(tag.englishName, keywordSearchTerm) ||
				doesTextIncludeKeyword(tag.japaneseName, keywordSearchTerm)));
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
				keywordsToSearch.some(keyword => doesTextIncludeKeyword(keyword, keywordSearchTerm))) &&
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
		toggleFilterIndicator(this.allImages.length != this.visibleImages.length);
	}
}

window.customElements.define("gallery-view", GalleryView);