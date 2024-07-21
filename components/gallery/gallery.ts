import FilterPopup from '../popup/filter-popup/filter-popup.ts'
import {
	getBilingualText, scrollToTop, flipArrow, addRemoveNoDisplay,
	sortImgs, addRemoveTransparent, getImageAddress
} from '../../js/utility.ts';
import { SCROLL_THRESHOLD, TAGS, DEFAULT_TIMEOUT } from '../../js/constants.ts'
import TextPolaroid from '../polaroid/txt-polaroid/txt-polaroid.ts';
import ImagePolaroid from '../polaroid/img-polaroid/img-polaroid.ts';
import * as Fullscreen from '../fullscreen/fullscreen.ts'

//// VARIABLES
// filter
export var filterPopup: FilterPopup;
var isFilterVisible: boolean = false;

var appColor: string;
var currentCountry: Country;

// region info
var isRegionInfoVisible: boolean = false;
var currentRegion: Region;
var isNewCountry: boolean = true;
var isNewRegionDropdown: boolean = true;
var previousRegion: string = "";

var isToTopVisible: boolean = false;
var throttleRegionInfo: boolean = false;

// image loading
export var allImages: Image[] = [];
export var visibleImages: Image[] = [];
var isLoadingImages: boolean = false;
var imageLoadIndex: number = 0;
var isImageAngledLeft: boolean = true;
var blankPolaroidFunction: Function;
var imageLoadLimit: number = 10;

const noPicturesText: string = getBilingualText("No pictures available (yet)", "写真は(まだ)ありません");

//// FUNCTIONS
// initialization
export function initializeGallery(blankPolaroidFn) {
	filterPopup = new FilterPopup();
	filterPopup.addEventListener("filter-popup-closed", () => {
		isFilterVisible = false;
	});

	filterPopup.addEventListener("filter-popup-submitted", event => {
		// TODO: check
		filterImages((event as FilterEvent).filterParams);

		scrollToTop(true);
		document.getElementById("gallery")!.replaceChildren();
		if (visibleImages.length == 0) {
			// let temp = document.createElement("div");
			// temp.id = "none";
			// temp.style.margin = "-125px";
			// temp.innerHTML = noPicturesText;
			document.getElementById("gallery")!.innerHTML = noPicturesText;
		} else {
			imageLoadIndex = 0;
			loadImages();
		}
	});

	document.body.appendChild(filterPopup);
	blankPolaroidFunction = blankPolaroidFn;
}

// regenerating data
export function setNewCountry(newCountry, newColour) {
	isNewCountry = true;
	currentCountry = newCountry;
	appColor = newColour;
	allImages = [];
}

export function setNewRegion(regionData, isSingleRegionSelected) {
	if (!isNewCountry && currentRegion != null) {
		document.getElementById(currentRegion.id + "-dropdown")!.classList.remove("active");
	}
	currentRegion = isSingleRegionSelected ? regionData[0] : null;

	isNewCountry = false;
	isNewRegionDropdown = true;
	isRegionInfoVisible = true;

	let regionsList: Region[] = [];
	let areaList: BaseObject[] = [];

	if (isSingleRegionSelected) {
		document.getElementById(currentRegion.id + "-dropdown")!.classList.add("active");
		regionsList = [currentRegion];
		areaList = currentRegion.areas;
		addRemoveNoDisplay("rgn-info-dates", false);
		document.getElementById("areas-title")!.innerHTML = getBilingualText("Areas", "所");
		document.getElementById("rgn-dates")!.innerHTML = getBilingualText(currentRegion.dates_english, currentRegion.dates_japanese);
		document.getElementById("rgn-desc-eng")!.innerHTML = currentRegion.description_english;
		document.getElementById("rgn-desc-jp")!.innerHTML = currentRegion.description_japanese;
		document.getElementById("rgn-name")!.innerHTML = getBilingualText(currentRegion.english_name, currentRegion.japanese_name);
		document.getElementById("description-title")!.innerHTML = getBilingualText("About", currentCountry.official_region_name_japanese + "について");
		document.getElementById("rgn-areas")!.innerHTML = areaList.map(area => {
			return getBilingualText(area.english_name, area.japanese_name);
		}).sort().join(" | ");
	} else {
		regionsList = regionData.map(rgn => {
			return {
				"id": rgn.id,
				"english_name": rgn.english_name,
				"japanese_name": rgn.japanese_name
			}
		});

		areaList = regionData.flatMap(rgn => rgn.areas);

		document.getElementById("rgn-areas")!.innerHTML = regionsList.map(area => {
			return getBilingualText(area.english_name, area.japanese_name);
		}).sort().join(" | ");

		addRemoveNoDisplay("rgn-info-dates", true);
		document.getElementById("areas-title")!.innerHTML = getBilingualText(currentCountry.official_region_name_english + "s", currentCountry.official_region_name_japanese);
		document.getElementById("rgn-desc-eng")!.innerHTML = currentCountry.description_english;
		document.getElementById("rgn-desc-jp")!.innerHTML = currentCountry.description_japanese;
		document.getElementById("rgn-name")!.innerHTML = getBilingualText(currentCountry.english_name, currentCountry.japanese_name);
		document.getElementById("description-title")!.innerHTML = getBilingualText("About", "国について");
	}
	allImages = regionData.flatMap(rgn => {
		return rgn.image_list.map(img => {
			let area = areaList.find(area => area.id == img.area_id)!;
			return ({
				...img,
				isVisible: true,
				region: {
					"id": rgn.id,
					"english_name": rgn.english_name,
					"japanese_name": rgn.japanese_name
				},
				area: {
					"id": area.id,
					"english_name": area.english_name,
					"japanese_name": area.japanese_name
				}
			})
		});
	}).sort(sortImgs);

	visibleImages = [...allImages];

	let tempTags = new Set(allImages.flatMap(x => { return x.tags }));
	let tagList = TAGS.filter(x => tempTags.has(x.id));
	let cameraList = [...new Set(allImages.map(x => x.camera_model))];
	filterPopup.regenerateFilters(
		currentRegion != null,
		regionsList,
		areaList,
		tagList,
		cameraList,
		currentCountry.official_region_name_english,
		currentCountry.official_region_name_japanese
	);

	editMiniMap();

	flipArrow(document.getElementById("rgn-name-arrow")!, false);

	// clear existing gallery
	let gallery = document.getElementById("gallery")!;
	gallery.replaceChildren();
	isImageAngledLeft = false;
	imageLoadIndex = 0;
	previousRegion = "";

	// add pictures
	if (allImages.length > 0) {
		loadImages();
	} else {
		gallery.innerHTML = noPicturesText;
	}
}

function loadImages() {
	isLoadingImages = true;
	let gallery = document.getElementById("gallery")!;
	// TODO: have a loader at the bottom
	// dynamically load next set of images
	for (let i = 0; imageLoadIndex < visibleImages.length && i < imageLoadLimit; i++, imageLoadIndex++) {
		let img = visibleImages[imageLoadIndex];
		if (currentRegion == null && (previousRegion == null || previousRegion != img.region.id)) {
			previousRegion = img.region.id;
			let blankPol = createPolaroidBlank(img.region, isImageAngledLeft);
			isImageAngledLeft = !isImageAngledLeft;
			gallery.appendChild(blankPol);
		}

		let pol = createPolaroidImg(img, isImageAngledLeft);
		isImageAngledLeft = !isImageAngledLeft;
		gallery.appendChild(pol);

		// set the limit to something different if the size of the screen changed
		if (i == 0) {
			imageLoadLimit = Math.max(Math.floor(window.innerWidth / 255) *
				Math.floor(window.innerHeight / 315) * 2, 10);
		}
	}
	isLoadingImages = false;
}

// polaroids
function createPolaroidImg(img, isImageAngledLeft) {
	let newPolaroid = new ImagePolaroid(
		isImageAngledLeft,
		getImageAddress(currentCountry.id, img.region.id, img.file_name),
		img.is_favourite ?? false,
		img.date,
		img.offset,
		img.description_english ?? "",
		img.description_japanese ?? ""
	);

	// listeners
	newPolaroid.addEventListener("click", () => { Fullscreen.openFullscreen(img, currentCountry.id); });

	return newPolaroid;
}

function createPolaroidBlank(rgn, isImageAngledLeft) {
	let newPolaroid = new TextPolaroid(
		isImageAngledLeft,
		getBilingualText(rgn.english_name, rgn.japanese_name),
		rgn.Id,
		currentCountry.official_region_name_english
	);

	newPolaroid.addEventListener("click", () => { blankPolaroidFunction(rgn.id) });

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

export function toggleFloatingButton() {
	const toTop = getBilingualText("Go to top", "トップに移動する");
	let btn = document.getElementById("to-top-btn")!;
	if (document.body.scrollTop > SCROLL_THRESHOLD) {
		if (!isToTopVisible) {
			flipArrow(btn, true);
			addRemoveNoDisplay([btn], false);
			addRemoveTransparent([btn], false);
			btn.title = toTop;
			isToTopVisible = true;
		}
	} else if (document.body.scrollTop <= SCROLL_THRESHOLD) {
		if (isToTopVisible) {
			flipArrow(btn, true);
			addRemoveTransparent([btn], true);
			setTimeout(() => { addRemoveNoDisplay([btn], true); }, DEFAULT_TIMEOUT)
			isToTopVisible = false;
		}
	}
}

// Region info
export function showRegionInfo(isForced) {
	isRegionInfoVisible = true;
	addRemoveTransparent("rgn-info-bg", false);
	document.getElementById("rgn-info-bg")!.style.visibility = "visible";
	if (isForced) {
		var regionInfoElement = document.getElementById("rgn-info")!;
		if (document.body.scrollTop < regionInfoElement.getBoundingClientRect().height) {
			scrollToTop(true);
		} else {
			regionInfoElement.style.position = "sticky";
			regionInfoElement.style.top = document.getElementById("top-bar")!.getBoundingClientRect().height.toString();
		}
	}
}

export function hideRegionInfo(isForced) {
	isRegionInfoVisible = false;
	if (isForced) {
		let rgnInfoOffset = document.getElementById("rgn-info")!.getBoundingClientRect().height;
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
		document.getElementById("rgn-info-bg")!.style.visibility = "hidden";
		document.getElementById("rgn-info")!.style.position = "relative";
		document.getElementById("rgn-info")!.style.top = "0";
	}, DEFAULT_TIMEOUT);
}

function scrollRegionInfo() {
	if (throttleRegionInfo) return;

	throttleRegionInfo = true;

	setTimeout(() => {
		let rgnInfoOffset = document.getElementById("rgn-info")!.getBoundingClientRect().height / 2;
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

export function changeRegionInfoVisibility(isVisible) {
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

export function filterMiniMap() {
	// get the selected official region only
	const svgObj = (document.getElementById("country-map-mini") as HTMLObjectElement);
	const svgDoc = svgObj.contentDocument!;
	const regionList = currentCountry.region_groups.flatMap(rgnGrp => rgnGrp.regions);

	try {
		regionList.forEach(rgn => {
			const rgnImg = svgDoc.getElementById(`${rgn.id}-img`)!;
			if (currentRegion == null) {
				if (rgn.visited) {
					rgnImg.setAttribute("fill", appColor);
				} else {
					rgnImg.setAttribute("fill", "lightgrey");
				}
				rgnImg.setAttribute("stroke", "none");
			} else if (rgn.id != currentRegion.id) {
				rgnImg.setAttribute("fill", "none");
				rgnImg.setAttribute("stroke", "none");
			} else {
				rgnImg.setAttribute("fill", appColor);
				rgnImg.setAttribute("stroke", "none");
			}
		});

		// show the map
		const countryImg = svgDoc.getElementById(currentCountry.id + "-img")!;
		if (currentRegion) {
			countryImg.setAttribute("viewBox", currentRegion.viewbox);
		}
	} catch (error) {
		console.error(error);
	} finally {
		setTimeout(() => {
			addRemoveTransparent([svgObj], false);
		}, DEFAULT_TIMEOUT / 2);
	}
}

function editMiniMap() {
	const svgObj = (document.getElementById("country-map-mini") as HTMLObjectElement);
	addRemoveTransparent([svgObj], true);
	setTimeout(() => {
		svgObj.data = `assets/img/country/${currentCountry.id}.svg`;
	}, 1000);
}

// image filtering
export function showFilter() {
	isFilterVisible = true;
	filterPopup.openPopup();
}

export function closeFilter() {
	filterPopup.closePopup(true);
}

export function getIsFilterVisible() {
	return isFilterVisible;
}

function doesTextIncludeKeyword(text, keywordSearchTerm) {
	return text && text.toLowerCase().includes(keywordSearchTerm.toLowerCase());
}

function includeImage(img: Image, filterParams: Filter) {
	let region = img.region;
	let area = img.area;
	let tagsWithKeyword = TAGS.filter(tag => img.tags?.includes(tag.id) &&
		(doesTextIncludeKeyword(tag.english_name, filterParams.keyword) ||
			doesTextIncludeKeyword(tag.japanese_name, filterParams.keyword)));
	let keywordsToSearch = [
		img.description_english,
		img.description_japanese,
		img.location_english,
		img.location_japanese,
		region?.english_name,
		region?.japanese_name,
		area?.english_name,
		area?.japanese_name,
		img.camera_model
	].filter(Boolean);

	return (!filterParams.isOnlyFavs || img.is_favourite) &&
		(filterParams.keyword == "" ||
			tagsWithKeyword.length > 0 ||
			keywordsToSearch.some(keyword => doesTextIncludeKeyword(keyword, filterParams.keyword))) &&
		(filterParams.selectedRegions.length == 0 || filterParams.selectedRegions.includes(region.id)) &&
		(filterParams.selectedAreas.length == 0 || filterParams.selectedAreas.includes(area?.id ?? "")) &&
		(filterParams.selectedTags.length == 0 || filterParams.selectedTags.filter(value => img.tags?.includes(value)).length > 0) &&
		(filterParams.selectedCameras.length == 0 || filterParams.selectedCameras.includes(img.camera_model ?? ""));
}

function filterImages(filterParams: Filter) {
	allImages.forEach(img => {
		img.isVisible = includeImage(img, filterParams);
	});
	visibleImages = allImages.filter(img => img.isVisible);
}

// region selection dropdown
export function toggleRegionDropdown() {
	document.getElementById("rgn-drop-down-container")!.classList.toggle("no-display");
	flipArrow(document.getElementById("rgn-name-arrow")!, undefined);
	if (isNewRegionDropdown && currentRegion) {
		isNewRegionDropdown = false;
		document.getElementById(`${currentRegion.id}-dropdown`)!.scrollIntoView({ behavior: "smooth", block: "center" });
	}
}

export function closeRegionDropdown() {
	addRemoveNoDisplay("rgn-drop-down-container", true);
	flipArrow(document.getElementById("rgn-name-arrow")!, false);
}