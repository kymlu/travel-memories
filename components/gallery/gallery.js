import FilterPopup from '../popup/filter-popup/filter-popup.js'
import { getBilingualText, scrollToTop, flipArrow, addRemoveNoDisplay,sortImgs, addRemoveTransparent } from '../../js/utility.js';
import { SCROLL_THRESHOLD, TAGS, DEFAULT_TIMEOUT  } from '../../js/constants.js'
import TextPolaroid from '../polaroid/txt-polaroid/txt-polaroid.js';
import ImagePolaroid from '../polaroid/img-polaroid/img-polaroid.js';
import * as Fullscreen from '../fullscreen/fullscreen.js'

export var filterPopup = null;
var appColor = null;
var isFilterVisible = false;
var isSingleRegion = false;
var isNewCountry = true;
var isNewRegionDropdown = true;
var isNewRegionFilter = true;
var isLeft = true;
var imageLoadIndex = 0;
var previousRegion = null;
var isToTopVisible = false;
var isRegionInfoVisible = false;
export var imgList = null;
export var visibleImgs = [];
var rgnsList = null;
var areaList = null;
var tagList = null;
var cameraList = null;
var throttleRegionInfo = false;
var countryInfo = null;
var blankPolaroidFunction = null;

export function setNewCountry(newCountry, newColour){
	isNewCountry = true;
	countryInfo = newCountry;
	appColor = newColour;
	imgList = [];
	rgnsList = [];
	areaList = [];
}

export function toggleFloatingButton() {
	const toTop = getBilingualText("Go to top", "トップに移動する");
	let btn = document.getElementById("to-top-btn");
	if (document.body.scrollTop > SCROLL_THRESHOLD) {
		if (!isToTopVisible) {
			flipArrow([btn], true);
			addRemoveNoDisplay([btn], false);
			addRemoveTransparent([btn], false);
			btn.title = toTop;
			isToTopVisible = true;
		}
	} else if (document.body.scrollTop <= SCROLL_THRESHOLD) {
		if (isToTopVisible) {
			flipArrow([btn], true);
			addRemoveTransparent([btn], true);
			setTimeout(() => { addRemoveNoDisplay([btn], true); }, DEFAULT_TIMEOUT)
			isToTopVisible = false;
		}
	}
}

export function setNewRegion(regionData, isSingleRegionSelected) {
	isSingleRegion = isSingleRegionSelected;

	if (!isNewCountry && isSingleRegion) {
		document.getElementById(rgnsList[0].id + "-dropdown").classList.remove("active");
	}

	isNewCountry = false;
	isNewRegionDropdown = true;
	isNewRegionFilter = true;
	isRegionInfoVisible = true;

	if (isSingleRegion) {
		let newRegion = regionData[0];
		document.getElementById(newRegion.id + "-dropdown").classList.add("active");
		imgList = newRegion.image_list;
		rgnsList = [newRegion];
		areaList = newRegion.areas;
		addRemoveNoDisplay("rgn-info-dates", false);
		document.getElementById("areas-title").innerHTML = getBilingualText("Areas", "所");
		document.getElementById("rgn-dates").innerHTML = getBilingualText(newRegion.dates_english, newRegion.dates_japanese);
		document.getElementById("rgn-desc-eng").innerHTML = newRegion.description_english;
		document.getElementById("rgn-desc-jp").innerHTML = newRegion.description_japanese;
		document.getElementById("rgn-name").innerHTML = getBilingualText(newRegion.english_name, newRegion.japanese_name);
		document.getElementById("description-title").innerHTML = getBilingualText("About", countryInfo.official_region_name_japanese + "について");
		document.getElementById("rgn-areas").innerHTML = areaList.map(area => {
			return getBilingualText(area.english_name, area.japanese_name);
		}).sort().join(" | ");
	} else {
		imgList = regionData.flatMap(rgn => {
			return rgn.image_list.map(img => ({
				...img, rgn: {
					"id": rgn.id,
					"english_name": rgn.english_name,
					"japanese_name": rgn.japanese_name
				}
			}));
		}).sort(sortImgs);
		
		rgnsList = regionData.map(rgn => {
			return {
				"id": rgn.id,
				"english_name": rgn.english_name,
				"japanese_name": rgn.japanese_name
			}
		});

		areaList = regionData.flatMap(rgn => rgn.areas);

		document.getElementById("rgn-areas").innerHTML = rgnsList.map(area => {
			return getBilingualText(area.english_name, area.japanese_name);
		}).sort().join(" | ");

		addRemoveNoDisplay("rgn-info-dates", true);
		document.getElementById("areas-title").innerHTML = getBilingualText(countryInfo.official_region_name_english + "s", countryInfo.official_region_name_japanese);
		document.getElementById("rgn-desc-eng").innerHTML = countryInfo.description_english;
		document.getElementById("rgn-desc-jp").innerHTML = countryInfo.description_japanese;
		document.getElementById("rgn-name").innerHTML = getBilingualText(countryInfo.english_name, countryInfo.japanese_name);
		document.getElementById("description-title").innerHTML = getBilingualText("About", "国について");
	}

	let tempTags = new Set(imgList.flatMap(x => { return x.tags }));
	tagList = TAGS.filter(x => tempTags.has(x.id));
	cameraList = [...new Set(imgList.map(x => x.camera_model))];

	filterPopup.refreshFilters(
		isSingleRegion,
		rgnsList,
		areaList,
		tagList,
		cameraList,
		countryInfo.official_region_name_english,
		countryInfo.official_region_name_japanese
	);

	editMiniMap();

	flipArrow("rgn-name-arrow", false);
	visibleImgs = [];
	createGallery();
}

export function filterMiniMap() {
	// get the selected official region only
	const svgObj = document.getElementById("country-map-mini");
	const svgDoc = svgObj.contentDocument;
	const regionList = countryInfo.region_groups.flatMap(rgnGrp => rgnGrp.regions);

	try {
		regionList.forEach(rgn => {
			const rgnImg = svgDoc.getElementById(rgn.id + "-img");
			if (!isSingleRegion) {
				if (rgn.visited) {
					rgnImg.setAttribute("fill", appColor);
				} else {
					rgnImg.setAttribute("fill", "lightgrey");
				}
				rgnImg.setAttribute("stroke", "none");
			} else if (rgn.id != rgnsList[0].id) {
				rgnImg.setAttribute("fill", "none");
				rgnImg.setAttribute("stroke", "none");
			} else {
				rgnImg.setAttribute("fill", appColor);
				rgnImg.setAttribute("stroke", "none");
			}
		});

		// show the map
		const countryImg = svgDoc.getElementById(countryInfo.id + "-img");
		if (isSingleRegion) {
			countryImg.setAttribute("viewBox", rgnsList[0].viewbox);
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
	const svgObj = document.getElementById("country-map-mini");
	addRemoveTransparent([svgObj], true);
	setTimeout(() => {
		svgObj.data = "assets/img/country/" + countryInfo.id + ".svg";
	}, 1000);
}

/**** Polaroids ****/
function createPolaroidImg(img, isLeft) {
	let newPolaroid = new ImagePolaroid(
		isLeft,
		img.link ?? "assets/img/" + countryInfo.id + "/" + (isSingleRegion ? rgnsList[0].id : img.rgn.id) + "/" + img.file_name,
		img.is_favourite ?? false,
		img.date,
		img.offset,
		img.description_english ?? "",
		img.description_japanese ?? ""
	);

	// listeners
	newPolaroid.addEventListener("click", () => { Fullscreen.openFullscreen(img, countryInfo.id); });

	return newPolaroid;
}

function createPolaroidBlank(rgn, isLeft) {
	let newPolaroid = new TextPolaroid(
		isLeft,
		getBilingualText(rgn.english_name, rgn.japanese_name),
		rgn.Id,
		countryInfo.official_region_name_english
	);

	newPolaroid.addEventListener("click", blankPolaroidFunction(rgn.id));

	return newPolaroid;
}

function addPics() {
	let gallery = document.getElementById("gallery");
	let maxImgLoad = 10; // TODO: determine how much based on screen size
	// if mobile, load 10?
	// TODO: have a loader
	let i = 0;
	while (imageLoadIndex < imgList.length && i < maxImgLoad) {
		let img = imgList[imageLoadIndex];
		if (!isSingleRegion && (previousRegion == null || previousRegion != img.rgn.id)) {
			previousRegion = img.rgn.id;
			let blankPol = createPolaroidBlank(img.rgn, isLeft);
			isLeft = !isLeft;
			gallery.appendChild(blankPol);
		}

		let pol = createPolaroidImg(img, isLeft);
		isLeft = !isLeft;
		gallery.appendChild(pol);

		if (i == 0) {
			maxImgLoad = Math.max(Math.floor(window.innerWidth / 255) *
				Math.floor(window.innerHeight / 315) * 2, 10);
		}

		i++;
		imageLoadIndex++;
	}
}

function createGallery() {
	// clear existing
	let gallery = document.getElementById("gallery");
	gallery.replaceChildren();
	isLeft = false;
	imageLoadIndex = 0;
	previousRegion = null;

	// add pictures
	if (imgList.length > 0) {
		addPics();
	} else {
		gallery.innerHTML = getBilingualText("No pictures available (yet)", "写真は（まだ）ありません");
	}
}

/**** Filtering ****/
export function initializeGallery(blankPolaroidFn) {
	filterPopup = new FilterPopup();
	filterPopup.addEventListener("filter-popup-closed", () => {
		isFilterVisible = false;
	});
	filterPopup.addEventListener("filter-popup-submitted", event => {
		filterImages(event.detail.isOnlyFavs,
			event.detail.keyword,
			event.detail.selectedRegions,
			event.detail.selectedAreas,
			event.detail.selectedTags,
			event.detail.selectedCameras);
	});
	document.body.appendChild(filterPopup);
	blankPolaroidFunction = blankPolaroidFn;
}

export function onScrollFunction(){
	toggleFloatingButton();
	scrollRegionInfo();

	if (imageLoadIndex < imgList.length && (window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
		addPics();
	}
}

/**** Official Region Info ****/
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

export function changeRegionInfoVisibility(isVisible, isForced) {
	if (isRegionInfoVisible == isVisible) {
		return;
	}

	if (isVisible == undefined) {
		isVisible = !isRegionInfoVisible;
	}

	if (isVisible) {
		showRegionInfo(isForced);
	} else {
		hideRegionInfo(isForced);
	}
}

export function showFilter() {
	isFilterVisible = true;
	filterPopup.openPopup();
}

function doesTextIncludeKeyword(text, keywordSearchTerm) {
	return text && text.toLowerCase().includes(keywordSearchTerm.toLowerCase());
}

function includeImage(img,
	isOnlyFavs,
	keywordSearchTerm,
	selectedRegions,
	selectedAreas,
	selectedTags,
	selectedCameras) {
	let region = isSingleRegion ? rgnsList[0] : rgnsList.find(x => x.id == img.rgn.id);
	let area = areaList.find(x => { return x.id == img.area; });
	let tagsWithKeyword = TAGS.filter(tag => img.tags.includes(tag.id) &&
		(doesTextIncludeKeyword(tag.english_name, keywordSearchTerm) ||
		doesTextIncludeKeyword(tag.japanese_name, keywordSearchTerm)));
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

	return (!isOnlyFavs || img.is_favourite) &&
		(keywordSearchTerm == "" ||
			keywordsToSearch.some(keyword => doesTextIncludeKeyword(keyword, keywordSearchTerm)) ||
			tagsWithKeyword.length > 0) &&
		(selectedRegions.length == 0 || selectedRegions.includes(region.id)) &&
		(selectedAreas.length == 0 || selectedAreas.includes(area.id)) &&
		(selectedTags.length == 0 || selectedTags.filter(value => img.tags.includes(value)).length > 0) &&
		(selectedCameras.length == 0 || selectedCameras.includes(img.camera_model));
}

function filterImages(isOnlyFavs,
	keyword,
	selectedRegions,
	selectedAreas,
	selectedTags,
	selectedCameras) {
	isLeft = false;
	visibleImgs = [];

	if (document.getElementById("none")) {
		document.getElementById("none").remove();
	}

	let allPolaroids = Array.from(document.querySelectorAll("img-polaroid, txt-polaroid"));

	let lastShownRegion = null;
	let previousRegion = null;
	let previousRegionCardInd = null;
	let regionCount = 0;

	let polInd = 0;
	let imgInd = 0;
	allPolaroids.forEach(pol => {
		if (pol.isBlank) { // if is a divider
			let currentRegion = pol.regionId;

			// If it is a new region
			if (currentRegion != previousRegion) {
				addRemoveNoDisplay([pol], false);
				if (regionCount == 0 && previousRegionCardInd != null) {
					// If the previous region has nothing, remove the previous card
					addRemoveNoDisplay([allPolaroids[previousRegionCardInd]], true);

					// If the one before that has something and is the same, remove the current card. 
					// Last shown card remains the same.
					if (lastShownRegion == currentRegion) addRemoveNoDisplay([pol], true);

				} else if (regionCount > 0 && previousRegionCardInd != null) {
					// If the previous region has something, that is the last shown card
					lastShownRegion = previousRegion;
					regionCount = 0;
				} else {
					// If the start of the gallery, ignore
					regionCount = 0;
				}

				// Set the current region and its position
				previousRegion = currentRegion;
				previousRegionCardInd = polInd;
			} else {
				addRemoveNoDisplay([pol], true);
			}
		} else if (includeImage(imgList[imgInd], isOnlyFavs,
			keyword,
			selectedRegions,
			selectedAreas,
			selectedTags,
			selectedCameras)) {
			addRemoveNoDisplay([pol], false);
			visibleImgs.push(imgInd);
			regionCount++;
			imgInd++;
		} else {
			addRemoveNoDisplay([pol], true);
			imgInd++;
		}

		polInd++;
	});

	if (previousRegionCardInd && regionCount == 0) addRemoveNoDisplay([allPolaroids[previousRegionCardInd]], true);

	allPolaroids.filter(pol => !pol.classList.contains("no-display"))
		.forEach(pol => {
			pol.setNewAngle(isLeft);
			isLeft = !isLeft;
		});

	if (visibleImgs.length == 0) {
		let temp = document.createElement("div");
		temp.id = "none";
		temp.style.margin = "-125px";
		temp.innerHTML = getBilingualText("No pictures available (yet)", "写真は(まだ)ありません");
		document.getElementById("gallery").appendChild(temp);
	}
}

/**** Official region selector dropdown ****/
export function toggleRgnDropdown() {
	document.getElementById("rgn-drop-down-container").classList.toggle("no-display");
	flipArrow(document.getElementById("rgn-name-arrow"));
	if (isNewRegionDropdown && isSingleRegion) {
		isNewRegionDropdown = false;
		document.getElementById(rgnsList[0].id + "-dropdown").scrollIntoView({ behavior: "smooth", block: "center" });
	}
}

export function closeRgnDropdown() {
	addRemoveNoDisplay("rgn-drop-down-container", true);
	flipArrow("rgn-name-arrow", false);
}

function showRgnDropdown() {
	addRemoveNoDisplay("rgn-drop-down-container", false);
	flipArrow("rgn-name-arrow", true);
}