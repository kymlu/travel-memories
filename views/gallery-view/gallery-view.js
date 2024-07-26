/// IMPORTS
import FilterPopup from '../../components/popup/filter-popup/filter-popup.js'
import {
	addClickListeners, addRemoveNoDisplay, addRemoveTransparent, flipArrow, getBilingualText,
	getImageAddress, isPortraitMode, scrollToTop, setBilingualAttribute, sortImgs, startHandleDrag
} from '../../js/utils.js';
import {
	CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT, SCROLL_THRESHOLD, TAGS
} from '../../js/constants.js'
import TextPolaroid from '../../components/polaroid/txt-polaroid/txt-polaroid.js';
import ImagePolaroid from '../../components/polaroid/img-polaroid/img-polaroid.js';
import { openFullscreen } from '../../components/fullscreen/fullscreen.js';
import { getCurrentCountry, isGalleryView } from '../../js/globals.js';
import { selectRegion } from '../map-view/map-view.js';
import RegionDropDown from '../../components/region-dropdown/region-dropdown.js';
import RegionInfo from '../../components/region-info/region-info.js';

/** The Gallery View. */
export default class GalleryView extends HTMLElement {
	constructor(element) {
		super();
		this.innerHTML = element;

		// TODO: restrict the loader to the gallery area instead of removing the top bar too
		// TODO: ensure the loader stops only after the mini map has no display removed
		// TODO: make views classes
		/// VARIABLES
		// filter
		this.filterPopup = new FilterPopup();
		this.regionDropdown = new RegionDropDown();
		this.regionInfo = new RegionInfo();
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

		this.noPicturesText = getBilingualText("No pictures available (yet)", "写真は(まだ)ありません");
		this.initialize();
	}
	/// FUNCTIONS
	/**
	 * Initialize the gallery page.
	 */
	initialize() {
		setBilingualAttribute([
			["dates-title", "Dates visited", "訪れた日付"]
		], "innerHTML");

		addClickListeners([
			["rgn-drop-down-bg", this.closeRegionDropdown],
			["rgn-info-bg", this.changeRegionInfoVisibility],
			["to-top-btn", this.scrollToTop]
		]);

		window.onscroll = function () {
			if (isGalleryView() && this.loader == null) {
				this.onScrollFunction();
			}
		};

		document.getElementById("rgn-info-handle").addEventListener("touchstart", e => { startHandleDrag(e, "rgn-info-handle") }, false);

		filterPopup.addEventListener(CUSTOM_EVENT_TYPES.FILTER_POPUP_SUBMITTED, event => {
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

		document.body.appendChild(filterPopup);

		document.getElementById("to-top-btn").title = getBilingualText("Go to top", "トップに移動する");
	}

	/** Open the gallery page */
	show() {
		this.closeRegionDropdown();
		scrollToTop(false);
		addRemoveTransparent(["gallery, to-to-btn"], false);
		addRemoveNoDisplay(["gallery", "rgn-info", "rgn-info-drawer"], false);
		if (allImages.length > 0) {
			addRemoveNoDisplay("filter-btn", false);
		}
		document.getElementById("rgn-info-bg").style.visibility = "visible";
		addRemoveTransparent("to-top-btn", false);
		if (isPortraitMode()) {
			document.getElementById("dates-title").scrollIntoView({ block: isPortraitMode() ? "end" : "start" });
		}
		addRemoveTransparent("rgn-info-bg", false);
	}

	/** Close the gallery page */
	hide() {
		this.closeRegionDropdown();
		scrollToTop(false);
		addRemoveTransparent(["gallery", "to-top-btn"], true);
		setTimeout(() => {
			addRemoveNoDisplay(["gallery", "to-top-btn"], true);
		}, DEFAULT_TIMEOUT);
		addRemoveNoDisplay(["rgn-info", "rgn-info-drawer"], true);
		document.getElementById("rgn-info-bg").style.visibility = "hidden";
		addRemoveTransparent("rgn-info-bg", false);
	}

	// regenerating data
	/** Reset some country-dependant variables. */
	handleNewCountry() {
		isNewCountry = true;
		allImages = [];
		visibleImages = [];
		currentCountry = getCurrentCountry();
		this.regionDropdown.
			this.createRegionDropDown();
		// region info
	}

	/** Set values based on a new user-selected region.
	 * @param {any[]} regionData - the new region's data
	 * @param {boolean} isSingleRegionSelected
	 */
	setNewRegion(regionData, isSingleRegionSelected) {
		this.regionDropdown.changeSelectedRegion(
			!isNewCountry ? currentRegion : null,
			isSingleRegionSelected ? regionData[0]?.id : null);

		currentRegion = isSingleRegionSelected ? regionData[0] : null;

		isNewCountry = false;

		let regionsList = [];
		let areaList = [];

		if (isSingleRegionSelected) {
			regionsList = [currentRegion];
			areaList = currentRegion.areas;
		} else {
			regionsList = regionData.map(rgn => {
				return {
					"id": rgn.id,
					"englishName": rgn.englishName,
					"japaneseName": rgn.japaneseName
				}
			});

			areaList = regionData.flatMap(rgn => rgn.areas);
		}

		this.regionInfo.setNewRegionInfo(this.currentCountry, regionsList, areaList, isSingleRegionSelected);

		// get all images
		allImages = regionData.flatMap(rgn => {
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

		visibleImages = [...allImages];

		// set filters
		let tempTags = new Set(allImages.flatMap(x => { return x.tags }));
		let tagList = TAGS.filter(x => tempTags.has(x.id));
		let cameraList = [...new Set(allImages.map(x => x.cameraModel))];
		filterPopup.regenerateFilters(
			currentRegion != null,
			regionsList,
			areaList,
			tagList,
			cameraList,
			currentCountry.officialRegionNameEnglish,
			currentCountry.officialRegionNameJapanese
		);

		setTimeout(() => {
			filterMiniMap();
		}, 1000);

		flipArrow(document.getElementById("rgn-name-arrow"), false);

		// clear existing gallery
		let gallery = document.getElementById("gallery");
		gallery.replaceChildren();
		isImageAngledLeft = false;
		imageLoadIndex = 0;
		currentPolaroidCount = 0;
		previousRegion = null;

		// add pictures
		if (allImages.length > 0) {
			loadImages();
		} else {
			gallery.innerHTML = noPicturesText;
		}
	}

	loadImages() {
		isLoadingImages = true;
		let gallery = document.getElementById("gallery");
		// dynamically load next set of images
		for (let i = 0; imageLoadIndex < visibleImages.length && i < imageLoadLimit; i++, currentPolaroidCount++) {
			let img = visibleImages[imageLoadIndex];
			if (currentRegion == null && (previousRegion == null || previousRegion != img.region.id)) {
				// text separator polaroid
				previousRegion = img.region.id;
				let blankPol = createPolaroidBlank(img.region, isImageAngledLeft);
				isImageAngledLeft = !isImageAngledLeft;
				gallery.appendChild(blankPol);
			} else {
				// image polaroid
				let pol = createPolaroidImg(img, isImageAngledLeft);
				isImageAngledLeft = !isImageAngledLeft;
				gallery.appendChild(pol);
				imageLoadIndex++;
			}

			// set the limit to something different if the size of the screen changed
			if (i == 0) {
				let imgsPerScreen = Math.max(Math.floor(window.innerWidth / 265) * Math.floor(window.innerHeight / 325), 5);
				// fill the remainder if the number of images does not fill the screen
				imageLoadLimit = imgsPerScreen * 2 + (imgsPerScreen - (currentPolaroidCount % imgsPerScreen / 2));
			}
		}
		isLoadingImages = false;
	}

	// polaroids
	createPolaroidImg(img, isImageAngledLeft) {
		let newPolaroid = new ImagePolaroid(
			isImageAngledLeft,
			getImageAddress(currentCountry.id, img.region.id, img.fileName),
			img.isFavourite ?? false,
			img.date,
			img.offset,
			img.descriptionEnglish ?? "",
			img.descriptionJapanese ?? ""
		);

		// listeners
		newPolaroid.addEventListener("click", () => { openFullscreen(img, currentCountry.id); });

		return newPolaroid;
	}

	createPolaroidBlank(rgn, isImageAngledLeft) {
		let newPolaroid = new TextPolaroid(
			isImageAngledLeft,
			rgn.englishName,
			rgn.japaneseName
		);

		newPolaroid.addEventListener("click", () => { selectRegion(rgn.id) });

		return newPolaroid;
	}

	// scrolling behaviours
	onScrollFunction() {
		toggleFloatingButton();
		this.scrollRegionInfo();

		if (!isLoadingImages && imageLoadIndex < visibleImages.length &&
			(window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 100) {
			loadImages();
		}
	}

	toggleFloatingButton() {
		let btn = document.getElementById("to-top-btn");
		if (document.body.scrollTop > SCROLL_THRESHOLD && !isToTopVisible) {
			addRemoveNoDisplay([btn], false);
			addRemoveTransparent([btn], false);
			isToTopVisible = true;
		} else if (document.body.scrollTop <= SCROLL_THRESHOLD && isToTopVisible) {
			addRemoveTransparent([btn], true);
			setTimeout(() => { addRemoveNoDisplay([btn], true); }, DEFAULT_TIMEOUT)
			isToTopVisible = false;
		}
	}

	// image filtering
	/** Shows the filter popup. */
	showFilter() {
		filterPopup.openPopup();
	}

	/** Closes the filter popup. */
	closeFilter() {
		filterPopup.closePopup(true);
	}

	isFilterVisible() {
		return filterPopup.isPopupOpen();
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
		allImages.forEach(img => {
			img.isVisible = includeImage(img,
				isOnlyFavs,
				keyword,
				selectedRegions,
				selectedAreas,
				selectedTags,
				selectedCameras);
		});
		visibleImages = allImages.filter(img => img.isVisible);
		toggleFilterIndicator(allImages.length != visibleImages.length);
	}



	handleKeyEvent(event) {
		if (event.key == "Escape" && this.isFilterVisible()) {
			this.closeFilter();
		}
		switch (event.key) {
			case "ArrowRight":
				this.changeFullscreenPicture(true);
				break;
			case "ArrowLeft":
				this.changeFullscreenPicture(false);
				break;
			case "ArrowUp":
				if (!this.isPicInfoVisible) {
					this.showPicInfo();
				}
				break;
			case "ArrowDown":
				if (this.isPicInfoVisible) {
					this.hidePicInfo();
				}
			case "Escape":
				this.closeFullscreen();
				break;
			default:
				break;
		}
	}
}