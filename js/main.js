/*
	Project Name: Travel Memories
	Author: Katie Lu
	Note: will try converting to TypeScript later
*/

/// IMPORTS
import * as Gallery from '../components/gallery/gallery.js';
import * as Fullscreen from '../components/fullscreen/fullscreen.js';
import InfoPopup from '../components/popup/info-popup/info-popup.js'
import { DEFAULT_TIMEOUT } from './constants.js'
import * as Loader from '../components/loader/loader.js';
import {
	getBilingualText, isPortraitMode, scrollToTop, addRemoveClass,
	sortImgs, addRemoveNoDisplay, addRemoveTransparent
} from '../../js/utils.js';
import { getAppColor, isCountrySelected, setAppColor, setCurrentCountry } from './globals.js';

/// VARIABLES
// Loading
let isLoading = true;

// Data
let allCountries = null;
let currentCountry = null;
let countryTitle = null;

// Booleans
let infoPopup = null;
let isPopupVisible = false;
let isGalleryVisible = false;

// Gestures
let initialYHandle = null;
let isHandleGrabbed = false;
let grabbedHandleId = null;

/// FUNCTIONS
/**
 * Determines appropriate behaviour when user releases a handle on screen.
 * @link https://stackoverflow.com/questions/53192433/how-to-detect-swipe-in-javascript
 * @param {TouchEvent} e - the touch event.
 */
function endHandleDrag(e) {
	if (isPortraitMode()) {
		if (isHandleGrabbed && grabbedHandleId) {
			isHandleGrabbed = false;
			let currentY = e.changedTouches[0].clientY;
			if (currentY > initialYHandle) {
				if (grabbedHandleId == "pic-info-handle") {
					Fullscreen.hidePicInfo();
				} else {
					Gallery.showRegionInfo(true);
				}
			} else if (currentY < initialYHandle) {
				if (grabbedHandleId == "rgn-info-handle") {
					Gallery.hideRegionInfo(true);
				}
			}
			initialYHandle = null;
			grabbedHandleId = null;
		}
	}
}

/**** Map ****/
/** Colours the map according to which regions have been visited. */
function colourMap() {
	if (document.getElementById("country-map").data == "") return;

	const svgObj = document.getElementById("country-map");
	const svgDoc = svgObj.contentDocument;
	const rgnList = currentCountry.regionGroups.flatMap(rgnGrp => rgnGrp.regions);

	rgnList.forEach(rgn => {
		const rgnImg = svgDoc.getElementById(`${rgn.id}-img`);
		if (rgn.visited) {
			// CSS won't work on document objects
			let imgTitle = document.createElementNS("http://www.w3.org/2000/svg", "title");
			imgTitle.innerHTML = getBilingualText(`See images from ${rgn.englishName}`, `${rgn.japaneseName}の写真を表示する`);
			rgnImg.appendChild(imgTitle);
			rgnImg.setAttribute("fill", getAppColor());
			rgnImg.setAttribute("stroke", "none");
			rgnImg.setAttribute("cursor", "pointer");
			rgnImg.setAttribute("transition", "opacity 0.3 ease-in-out");
			rgnImg.addEventListener("click", function () {
				selectRegion(rgn.id);
				document.getElementById("main-title").innerHTML = getBilingualText(rgn.englishName, rgn.japaneseName);
			});

			rgnImg.addEventListener("mouseover", () => {
				rgnImg.setAttribute("opacity", "50%");
				document.getElementById("main-title").innerHTML = getBilingualText(rgn.englishName, rgn.japaneseName);
			});

			rgnImg.addEventListener("mouseout", () => {
				rgnImg.setAttribute("opacity", "100%");
				document.getElementById("main-title").innerHTML = countryTitle;
			});
		} else {
			rgnImg.setAttribute("fill", "lightgrey");
		}
	});
}

/** Sets the appropriate map on the map screen. */
function createMap() {
	const svgObj = document.getElementById("country-map");
	svgObj.data = `assets/img/country/${currentCountry.id}.svg`;
}

/**** Site Info Popup ****/
/** Opens the site info popup. */
function openInfoPopup() {
	isPopupVisible = true;
	infoPopup.openPopup();
}

/** Closes the site info popup. */
function closeInfoPopup() {
	document.querySelector("info-popup").closePopup(true);
}

/**** Show and hide pages ****/
/** Opens the map page. */
function goToMapPage() {
	document.getElementById("main-title").innerHTML = countryTitle;
	stopLoading();
	scrollToTop(false);
	addRemoveTransparent("map-page", false);
}

/** Opens the gallery page. */
function goToGalleryPage() {
	isGalleryVisible = true;
	Gallery.openGallery();
}

/** Leaves the gallery page to return to the map. */
function leaveGalleryPage() {
	startLoading();
	isGalleryVisible = false;
		Gallery.closeGallery();
	setTimeout(() => {
			goToMapPage();
			}, 200);
	}

function selectRegion(regionId, isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({ rgn: regionId }, "", null);
	}

	startLoading();
	if (regionId != undefined && regionId != null) {
		let newRegion = currentCountry.regionGroups.flatMap(x => x.regions).filter(rgn => rgn.id == regionId);
		Gallery.setNewRegion(newRegion, true);
	} else {
		let visitedRgns = currentCountry.regionGroups.flatMap(grp => grp.regions.filter(rgn => rgn.visited));
		Gallery.setNewRegion(visitedRgns, false);
	}

	setTimeout(() => {
		goToGalleryPage();
	}, DEFAULT_TIMEOUT);
}

function selectCountry(countryId, countryColor, isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({ country: countryId, countryColor: countryColor }, "", null);
	}

	currentCountry = allCountries.find(country => country.id == countryId);
	currentCountry.regionGroups.forEach(rgnGrp => {
		rgnGrp.regions.forEach(rgn => {
			if (rgn.imageList != null) {
				rgn.imageList.sort(sortImgs);
			}
		});
	});

	// don't need to save all the data
	// create a copy
	let tempCountry = JSON.parse(JSON.stringify(currentCountry));
	// remove images
	tempCountry.regionGroups.forEach(group => group.regions.forEach(region => {
		if (region.imageList) {
			region.imageList = [];
		}
	}));
	setCurrentCountry(tempCountry);

	startLoading();

	addRemoveNoDisplay(["map-page", "btn-grp-left"], false);
	addRemoveClass("btn-grp-right", "justify-end", false);

	setAppColor(countryColor);

	countryTitle = getBilingualText(currentCountry.englishName, currentCountry.japaneseName);
	[
		["main-title", `See all images from ${currentCountry.englishName}`, `${currentCountry.japaneseName}の写真をすべて表示する`],
		["rgn-title-btn", `Change ${currentCountry.officialRegionNameEnglish}`, `${currentCountry.officialRegionNameJapanese}を切り替える`],
		["info-btn", `Toggle ${currentCountry.officialRegionNameEnglish} info`, `${currentCountry.officialRegionNameJapanese}の情報をトグル`],
	].forEach(([id, englishText, japaneseText]) => {
		document.getElementById(id).title = getBilingualText(englishText, japaneseText);
	});
	
	Gallery.refreshCountry();
	Gallery.createRegionDropDown(selectRegion);
	setTimeout(() => {
		createMap();
	}, 50);
	setTimeout(() => {
		Loader.stopLoader(goToMapPage);
		isLoading = false;
	}, 1200);
}

/**** Data Loading/Setup ****/
function setupSite() {
	Loader.setupLoader();
	Loader.startLoader();

	[
		["pic-info-btn", "See picture information", "写真の情報を見る"],
		["globe-btn", "Return to country picker", "国の選択へ戻る"],
		["map-btn", "Return to map", "地図に戻る"],
		["creator-btn", "About the site", "このサイトについて"]
	].forEach(([id, englishText, japaneseText]) => {
		document.getElementById(id).title = getBilingualText(englishText, japaneseText);
	});

	document.getElementById("dates-title").innerHTML = getBilingualText("Dates visited", "訪れた日付");

	Array.from(document.getElementsByClassName("close-btn")).forEach(element => {
		element.title = getBilingualText("Close", "閉じる");
	})

	document.addEventListener("contextmenu", function (e) {
		if (e.target.nodeName === "IMG") {
			e.preventDefault();
		}
	}, false);

	// Button click detections
	[
		["main-title", function () { selectRegion(null); }],
		["rgn-title-btn", Gallery.toggleRegionDropdown],
		["creator-btn", openInfoPopup],
		["globe-btn", showStartScreen],
		["map-btn", leaveGalleryPage]
	].forEach(([id, callback]) => {
		document.getElementById(id).addEventListener("click", callback);
	});

	document.getElementById("country-map").addEventListener("load", colourMap);

	document.addEventListener("touchend", endHandleDrag, false);

	// Key input detections
	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			if (isPopupVisible) {
				closeInfoPopup(true);
			} else if (Gallery.getIsFilterVisible()) {
				Gallery.closeFilter();
			} else if (Fullscreen.getIsFullscreen()) {
				Fullscreen.closeFullscreen(true);
			}
		}

		if (Fullscreen.getIsFullscreen()) {
			Fullscreen.handleKeyEvent(event);
		}
	});

	// Popups
	infoPopup = new InfoPopup();
	document.body.appendChild(infoPopup);
	infoPopup.addEventListener("info-popup-closed", () => {
		isPopupVisible = false;
	});
	Gallery.initializeGallery((regionId) => {
		selectRegion(regionId);
	});
	Fullscreen.initializeFullscreen();

	// Scroll detections
	window.onscroll = function () {
		if (isGalleryVisible && !isLoading) {
			Gallery.onScrollFunction();
		}
	};

	// Back button detections
	window.addEventListener('popstate', (event) => {
		if (event.state.country) {
			if (isGalleryVisible) {
				leaveGalleryPage();
			} else {
				selectCountry(event.state.country, event.state.countryColor, true);
			}
		} else if (event.state.rgn && isCountrySelected()) {
			selectRegion(event.state.rgn, true);
		} else {
			showStartScreen(true);
		}
	});
}

/**
 * Gets all the data for the site.
 */
function fetchData() {
	let hasError = false;

	fetch("js/data.json")
		.then(response => {
			return response.json();
		}).then(d => {
			allCountries = d;
		}).catch(error => {
			showDataLoadError();
			hasError = true;
			console.error(error);
		}).then(() => {
			if (!hasError && allCountries != null) {
				createStartScreen();
			}
		});
}

function retry() {
	Loader.retryLoader(fetchData);
}

function startLoading() {
	isLoading = true;
	addRemoveTransparent(["top-bar", "map-page", "start-screen"], true);

	Loader.startLoader();

	setTimeout(() => {
		addRemoveNoDisplay("start-screen", true);
	}, DEFAULT_TIMEOUT);
}

function stopLoading() {
	Loader.hideLoader();
	isLoading = false;
}

/**** Start Screen ****/
function highlightCountry(abbreviation, isHover) {
	addRemoveTransparent(`${abbreviation}-start-icon-c`, isHover);
	let icons = Array.from(document.getElementById(`${abbreviation}-start-icon`).getElementsByTagName("img"));
	addRemoveClass(icons, "animated", isHover);
}

function createStartScreen() {
	const btn = document.createElement("button");
	btn.classList.add("start-btn", "highlight-btn", "txt-btn");
	const text = document.createElement("div");
	text.classList.add("country-text");
	const icon = document.createElement("div");
	icon.classList.add("start-icon");
	const img = document.createElement("img");
	img.classList.add("start-icon", "img");

	document.getElementById("start-screen").replaceChildren();

	allCountries.forEach(country => {
		const abb = country.abbreviation;

		let newBtn = btn.cloneNode();
		newBtn.id = `start-btn-${abb}`;
		newBtn.title = getBilingualText(`See ${country.englishName}`, `${country.japaneseName}へ`);
		newBtn.classList.add(abb);
		newBtn.addEventListener("click", function () {
			selectCountry(country.id, `--${abb}-color`);
		});

		let engTxt = text.cloneNode();
		engTxt.innerHTML = country.englishName;

		let jpTxt = text.cloneNode();
		jpTxt.innerHTML = country.japaneseName;

		let iconn = icon.cloneNode();
		iconn.id = `${abb}-start-icon`;

		let imgWhite = img.cloneNode();
		imgWhite.id = `${abb}-start-icon-w`;
		imgWhite.src = `assets/icons/${country.symbol}_white.svg`;

		let imgColor = img.cloneNode();
		imgColor.id = `${abb}-start-icon-c`;
		imgColor.src = `assets/icons/${country.symbol}.svg`;
		imgColor.classList.add("opacity-transition");

		newBtn.addEventListener("mouseover", function () {
			highlightCountry(abb, true);
		});
		newBtn.addEventListener("touchstart", function () {
			highlightCountry(abb, true);
		});
		newBtn.addEventListener("mouseout", function () {
			highlightCountry(abb, false);
		});
		newBtn.addEventListener("touchend", function () {
			highlightCountry(abb, false);
		});

		newBtn.appendChild(engTxt);
		newBtn.appendChild(iconn);
		newBtn.appendChild(jpTxt);
		iconn.appendChild(imgWhite);
		iconn.appendChild(imgColor);

		document.getElementById("start-screen").appendChild(newBtn);
	});

	window.history.pushState({}, "", null);
	Loader.stopLoader(showStartScreen);
	isLoading = false;
}

function showStartScreen(isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({}, "", null);
	}

	setCurrentCountry(null);
	scrollToTop(false);
	setAppColor("--default-color");
	addRemoveTransparent("top-bar", false);
	addRemoveTransparent("map-page", true);
	addRemoveClass("btn-grp-right", "justify-end", true);
	addRemoveNoDisplay(["top-bar"], false);
	addRemoveNoDisplay(["btn-grp-left", "map-page"], true);
	addRemoveNoDisplay("start-screen", false);
	document.getElementById("start-screen").scrollTo({
		top: 0,
		left: 0,
		behavior: "instant"
	});
	setTimeout(() => {
		addRemoveTransparent("start-screen", false);
	}, 10);
}

/**** Main ****/
function main() {
	scrollToTop(false);
	setupSite();
	fetchData();
}

main();
