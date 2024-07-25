/// IMPORTS
import FilterPopup from '../../components/popup/filter-popup/filter-popup.js'
import {
	addRemoveNoDisplay, addRemoveTransparent, flipArrow, getBilingualText,
	getImageAddress, isPortraitMode, scrollToTop, sortImgs, startHandleDrag
} from '../../js/utils.js';
import { CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT, PAGE_NAMES, SCROLL_THRESHOLD, TAGS } from '../../js/constants.js'
import TextPolaroid from '../../components/polaroid/txt-polaroid/txt-polaroid.js';
import ImagePolaroid from '../../components/polaroid/img-polaroid/img-polaroid.js';
import { openFullscreen } from '../../components/fullscreen/fullscreen.js';
import { getCurrentCountry, getAppColor, isGalleryPage, setCurrentPage } from '../../js/globals.js';
import * as Loader from '../../components/loader/loader.js';
import { selectRegion } from '../map-page/map-page.js';

// TODO: restrict the loader to the gallery area instead of removing the top bar too
// TODO: ensure the loader stops only after the mini map has no display removed
/// VARIABLES
// filter
let filterPopup = new FilterPopup();
let isFilterVisible = false;

// region info
let isRegionInfoVisible = false;
let currentRegion = null;
let isNewCountry = true;
let isNewRegionDropdown = true;
let previousRegion = null;
let currentCountry = null;

let isToTopVisible = false;
let throttleRegionInfo = false;

// image loading
var allImages = null;
export var visibleImages = [];
let isLoadingImages = false;
let imageLoadIndex = 0;
let currentPolaroidCount = 0;
let isImageAngledLeft = true;
let imageLoadLimit = 10;

const noPicturesText = getBilingualText("No pictures available (yet)", "写真は(まだ)ありません");

/// FUNCTIONS
/**
 * Initialize the gallery page.
 */
export function initializeGallery() {
	[
		["filter-btn", "Filter Pictures", "写真をフィルターする"]
	].forEach(([id, englishText, japaneseText]) => {
		document.getElementById(id).title = getBilingualText(englishText, japaneseText);
	});

	document.getElementById("dates-title").innerHTML = getBilingualText("Dates visited", "訪れた日付");

	// TODO: have a symbol to indicate filters were applied
	[
		["rgn-title-btn", toggleRegionDropdown],
		["rgn-drop-down-bg", closeRegionDropdown],
		["rgn-info-bg", changeRegionInfoVisibility],
		["to-top-btn", scrollToTop],
		["filter-btn", showFilter],
		["info-btn", changeRegionInfoVisibility]
	].forEach(([id, callback]) => {
		document.getElementById(id).addEventListener("click", callback);
	});

	window.onscroll = function () {
		if (isGalleryPage() && Loader.isPageLoading()) {
			onScrollFunction();
		}
	};

	document.getElementById("rgn-info-handle").addEventListener("touchstart", e => { startHandleDrag(e, "rgn-info-handle") }, false);

	filterPopup.addEventListener(CUSTOM_EVENT_TYPES.FILTER_POPUP_CLOSED, () => {
		isFilterVisible = false;
	});

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
export function openGallery() {
	closeRegionDropdown();
	scrollToTop(false);
	document.getElementById("btn-grp-left").classList.add("btn-grp-left");
	document.getElementById("btn-grp-right").classList.add("btn-grp-right");
	document.getElementById("top-bar").style.position = "sticky";
	document.getElementById("top-bar").style.backgroundColor = "white";
	addRemoveTransparent(["gallery, to-to-btn"]);
	addRemoveNoDisplay(["map-page", "globe-btn"], true);
	addRemoveNoDisplay(["gallery", "map-btn", "info-btn", "rgn-title-btn", "rgn-info", "rgn-info-drawer"], false);
	if (allImages.length > 0) {
		addRemoveNoDisplay("filter-btn", false);
	}
	document.getElementById("rgn-info-bg").style.visibility = "visible";
	addRemoveTransparent("to-top-btn", true);
	if (isPortraitMode()) {
		document.getElementById("dates-title").scrollIntoView({ block: isPortraitMode() ? "end" : "start" });
	}
	addRemoveTransparent("rgn-info-bg", false);
	Loader.hideLoader();
	setCurrentPage(PAGE_NAMES.GALLERY);
}

/** Close the gallery page */
export function closeGallery() {
	closeRegionDropdown();
	scrollToTop(false);
	document.getElementById("btn-grp-left").classList.remove("btn-grp-left");
	document.getElementById("btn-grp-right").classList.remove("btn-grp-right");
	document.getElementById("top-bar").style.position = "fixed";
	document.getElementById("top-bar").style.backgroundColor = "transparent";
	addRemoveTransparent(["gallery", "to-top-btn"], true);
	setTimeout(() => {
		addRemoveNoDisplay(["gallery", "to-top-btn"], true);
	}, DEFAULT_TIMEOUT);
	addRemoveNoDisplay(["map-page", "globe-btn"], false);
	addRemoveNoDisplay(["filter-btn", "map-btn", "info-btn", "rgn-title-btn", "rgn-info", "rgn-info-drawer"], true);
	document.getElementById("rgn-info-bg").style.visibility = "hidden";
	addRemoveTransparent("rgn-info-bg", false);
}

// regenerating data
/** Reset some country-dependant variables. */
export function handleNewCountry() {
	isNewCountry = true;
	allImages = [];
	visibleImages = [];
	currentCountry = getCurrentCountry();
	const svgObj = document.getElementById("country-map-mini");
	svgObj.data = `assets/img/country/${currentCountry.id}.svg`;

	[
		["rgn-title-btn", `Change ${currentCountry.officialRegionNameEnglish}`, `${currentCountry.officialRegionNameJapanese}を切り替える`],
		["info-btn", `Toggle ${currentCountry.officialRegionNameEnglish} info`, `${currentCountry.officialRegionNameJapanese}の情報をトグル`],
	].forEach(([id, englishText, japaneseText]) => {
		document.getElementById(id).title = getBilingualText(englishText, japaneseText);
	});
}

/** Set values based on a new user-selected region.
 * @param {any[]} regionData - the new region's data
 * @param {boolean} isSingleRegionSelected
 */
export function setNewRegion(regionData, isSingleRegionSelected) {
	if (!isNewCountry && currentRegion != null) {
		document.getElementById(currentRegion.id + "-dropdown").classList.remove("active");
	}
	currentRegion = isSingleRegionSelected ? regionData[0] : null;

	isNewCountry = false;
	isNewRegionDropdown = true;
	isRegionInfoVisible = true;

	let regionsList = [];
	let areaList = [];

	if (isSingleRegionSelected) {
		document.getElementById(currentRegion.id + "-dropdown").classList.add("active");
		regionsList = [currentRegion];
		areaList = currentRegion.areas;
		addRemoveNoDisplay("rgn-info-dates", false);
		[
			["areas-title", getBilingualText("Areas", "所")],
			["rgn-dates", getBilingualText(currentRegion.datesEnglish, currentRegion.datesJapanese)],
			["rgn-desc-eng", currentRegion.descriptionEnglish],
			["rgn-desc-jp", currentRegion.descriptionJapanese],
			["rgn-name", getBilingualText(currentRegion.englishName, currentRegion.japaneseName)],
			["description-title", getBilingualText("About", currentCountry.officialRegionNameJapanese + "について")],
			["rgn-areas", areaList.map(area => {
				return getBilingualText(area.englishName, area.japaneseName);
			}).sort().join(" | ")]
		].forEach(([id, text]) => {
			document.getElementById(id).innerHTML = text;
		});
	} else {
		regionsList = regionData.map(rgn => {
			return {
				"id": rgn.id,
				"englishName": rgn.englishName,
				"japaneseName": rgn.japaneseName
			}
		});

		areaList = regionData.flatMap(rgn => rgn.areas);

		document.getElementById("rgn-areas").innerHTML = regionsList.map(area => {
			return getBilingualText(area.englishName, area.japaneseName);
		}).sort().join(" | ");

		addRemoveNoDisplay("rgn-info-dates", true);
		document.getElementById("areas-title").innerHTML = getBilingualText(currentCountry.officialRegionNameEnglish + "s", currentCountry.officialRegionNameJapanese);
		document.getElementById("rgn-desc-eng").innerHTML = currentCountry.descriptionEnglish;
		document.getElementById("rgn-desc-jp").innerHTML = currentCountry.descriptionJapanese;
		document.getElementById("rgn-name").innerHTML = getBilingualText(currentCountry.englishName, currentCountry.japaneseName);
		document.getElementById("description-title").innerHTML = getBilingualText("About", "国について");
	}

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
	//hideLoader();
}

function loadImages() {
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
function createPolaroidImg(img, isImageAngledLeft) {
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

function createPolaroidBlank(rgn, isImageAngledLeft) {
	let newPolaroid = new TextPolaroid(
		isImageAngledLeft,
		rgn.englishName,
		rgn.japaneseName
	);

	newPolaroid.addEventListener("click", () => { selectRegion(rgn.id) });

	return newPolaroid;
}

// scrolling behaviours
export function onScrollFunction() {
	toggleFloatingButton();
	scrollRegionInfo();

	if (!isLoadingImages && imageLoadIndex < visibleImages.length &&
		(window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 100) {
		loadImages();
	}
}

function toggleFloatingButton() {
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

// Region info
export function showRegionInfo(isForced) {
	isRegionInfoVisible = true;
	addRemoveTransparent("rgn-info-bg", false);
	document.getElementById("rgn-info-bg").style.visibility = "visible";
	if (isForced) {
		if (document.body.scrollTop < document.getElementById("rgn-info").getBoundingClientRect().height) {
			scrollToTop(true);
		} else {
			document.getElementById("rgn-info").style.position = "sticky";
			document.getElementById("rgn-info").style.top = document.getElementById("top-bar").getBoundingClientRect().height;
		}
	}
}

export function hideRegionInfo(isForced) {
	isRegionInfoVisible = false;
	if (isForced) {
		let rgnInfoOffset = document.getElementById("rgn-info").getBoundingClientRect().height;
		if (document.body.scrollTop <= rgnInfoOffset) {
			window.scrollTo({
				top: rgnInfoOffset,
				left: 0,
				behavior: 'smooth'
			});
		}
	}
	addRemoveTransparent("rgn-info-bg", true);
	setTimeout(() => {
		document.getElementById("rgn-info-bg").style.visibility = "hidden";
		document.getElementById("rgn-info").style.position = "relative";
		document.getElementById("rgn-info").style.top = "0";
	}, DEFAULT_TIMEOUT);
}

function scrollRegionInfo() {
	if (throttleRegionInfo) return;

	throttleRegionInfo = true;

	setTimeout(() => {
		let rgnInfoOffset = document.getElementById("rgn-info").getBoundingClientRect().height / 2;
		if (isRegionInfoVisible && document.body.scrollTop > rgnInfoOffset) {
			isRegionInfoVisible = false;
			hideRegionInfo(false);
		} else if (!isRegionInfoVisible && document.body.scrollTop < rgnInfoOffset) {
			isRegionInfoVisible = true;
			showRegionInfo(false);
		}
		throttleRegionInfo = false;
	}, 250);
}

function changeRegionInfoVisibility(isVisible) {
	if (isRegionInfoVisible == isVisible) {
		return;
	}

	if (isVisible == undefined) {
		isVisible = !isRegionInfoVisible;
	}

	if (isVisible) {
		showRegionInfo(true);
	} else {
		hideRegionInfo(true);
	}
}

function filterMiniMap() {
	const svgObj = document.getElementById("country-map-mini");
	addRemoveTransparent([svgObj], true);
	const svgDoc = svgObj.contentDocument;
	const regionList = currentCountry.regionGroups.flatMap(grp => grp.regions);
	try {
		regionList.forEach(rgn => {
			const rgnImg = svgDoc.getElementById(`${rgn.id}-img`);
			if (rgnImg) {
				if (currentRegion == null) {
					if (rgn.visited) {
						rgnImg.setAttribute("fill", getAppColor());
					} else {
						rgnImg.setAttribute("fill", "lightgrey");
					}
					rgnImg.setAttribute("stroke", "none");
				} else if (rgn.id != currentRegion.id) {
					rgnImg.setAttribute("fill", "none");
					rgnImg.setAttribute("stroke", "none");
				} else {
					rgnImg.setAttribute("fill", getAppColor());
					rgnImg.setAttribute("stroke", "none");
				}
			}
		});

		// zoom into the specific region
		if (currentRegion) {
			const countryImg = svgDoc.getElementById(currentCountry.id + "-img");
			countryImg.setAttribute("viewBox", currentRegion.viewbox);
		}
	} catch (error) {
		console.error(error);
	} finally {
		// show map
		setTimeout(() => {
			addRemoveTransparent([svgObj], false);
		}, DEFAULT_TIMEOUT / 2);
	}
}

// image filtering
/** Shows the filter popup. */
export function showFilter() {
	isFilterVisible = true;
	filterPopup.openPopup();
}

/** Closes the filter popup. */
export function closeFilter() {
	filterPopup.closePopup(true);
}

export function getIsFilterVisible() {
	return isFilterVisible;
}

function doesTextIncludeKeyword(text, keywordSearchTerm) {
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
function includeImage(img,
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
		img.location_english,
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
function filterImages(isOnlyFavs,
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
	if (allImages.length == visibleImages.length) {
		addRemoveNoDisplay("filter-indicator", true);
	} else {
		addRemoveNoDisplay("filter-indicator", false);
	}
}

// region selection dropdown
/** 
 * Creates the region drop down list.
 */
export function createRegionDropDown() {
	// the dropdown object
	const dropDownList = document.getElementById("rgn-drop-down");
	dropDownList.replaceChildren();

	// region group text and regions
	let regionGroupTemplate = document.createElement("div");
	regionGroupTemplate.classList.add("rgn-grp-text", "regular-text");

	let regionTemplate = document.createElement("button");
	regionTemplate.classList.add("rgn-txt", "regular-text", "highlight-btn", "txt-btn");

	// Iterate each unofficial and official region, sort by visited/not visited
	currentCountry.regionGroups.filter(grp => grp.regions.filter(rgn => rgn.visited).length > 0).forEach(grp => {
		let regionGroupElement = regionGroupTemplate.cloneNode();

		if (currentCountry.showUnofficialRegions) {
			regionGroupElement.innerHTML = getBilingualText(grp.englishName, grp.japaneseName);
			regionGroupElement.id = `${grp.englishName}-dropdown`;
			dropDownList.appendChild(regionGroupElement);
		}

		grp.regions.filter(rgn => rgn.visited).forEach(rgn => {
			if (rgn.visited) {
				let regionButton = regionTemplate.cloneNode();
				regionButton.innerHTML = getBilingualText(rgn.englishName, rgn.japaneseName);
				regionButton.id = `${rgn.id}-dropdown`;
				regionButton.title = getBilingualText(`See images from ${rgn.englishName}`, `${rgn.japaneseName}の写真を表示する`);
				regionButton.classList.add("visited-rgn-text");
				regionButton.addEventListener("click", function () {
					selectRegion(rgn.id);
				}, false);
				dropDownList.appendChild(regionButton);
			}
		});
	});
}

function toggleRegionDropdown() {
	document.getElementById("rgn-drop-down-container").classList.toggle("no-display");
	flipArrow(document.getElementById("rgn-name-arrow"));
	if (isNewRegionDropdown && currentRegion) {
		isNewRegionDropdown = false;
		document.getElementById(`${currentRegion.id}-dropdown`).scrollIntoView({ behavior: "smooth", block: "center" });
	}
}

function closeRegionDropdown() {
	addRemoveNoDisplay("rgn-drop-down-container", true);
	flipArrow(document.getElementById("rgn-name-arrow"), false);
}