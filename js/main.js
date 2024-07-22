/*
	Project Name: Travel Memories
	Author: Katie Lu
	Note: will try converting to TypeScript later
*/

/// IMPORTS
import * as Gallery from '../components/gallery/gallery.js';
import * as Fullscreen from '../components/fullscreen/fullscreen.js';
import InfoPopup from '../components/popup/info-popup/info-popup.js'
import { DEFAULT_TIMEOUT, SCROLL_THRESHOLD } from './constants.js'
import { startLoader, hideLoader, stopLoader } from '../components/loader/loader.js';
import {
	getBilingualText, isPortraitMode, scrollToTop, addRemoveClass,
	sortImgs, addRemoveNoDisplay, addRemoveTransparent
} from '../../js/utils.js';
import { getAppColor, isCountrySelected, setAppColor, setCurrentCountry } from './globals.js';

/// VARIABLES
let root = document.querySelector(':root');

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
 * Initializes the touch event for elements on screen with handles.
 * @param {TouchEvent} e - the touch element.
 * @param {string} handleId - the id of the handle element.
 */
function startHandleDrag(e, handleId) {
	if (isPortraitMode()) {
		isHandleGrabbed = true;
		grabbedHandleId = handleId
		initialYHandle = e.touches[0].clientY;
	}
}

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
				//hoveredRegion = rgn.englishName;
				document.getElementById("main-title").innerHTML = getBilingualText(rgn.englishName, rgn.japaneseName);
			});

			rgnImg.addEventListener("mouseout", () => {
				rgnImg.setAttribute("opacity", "100%");
				//hoveredRegion = "";
				document.getElementById("main-title").innerHTML = countryTitle;
			});
		} else {
			rgnImg.setAttribute("fill", "lightgrey");
		}
	});
}

function createMap() {
	const svgObj = document.getElementById("country-map");
	svgObj.data = `assets/img/country/${currentCountry.id}.svg`;
}

/**** Site Info Popup ****/
function openInfoPopup() {
	isPopupVisible = true;
	infoPopup.openPopup();
}

function closeInfoPopup() {
	document.querySelector("info-popup").closePopup(true);
}

/**** Show and hide pages ****/
function openMapPage() {
	stopLoading();
	scrollToTop(false);
	addRemoveTransparent("map-page", false);
	addRemoveNoDisplay("to-top-btn", false);
	Gallery.toggleFloatingButton();
}

function changeGalleryVisibility(isVisible) {
	Gallery.closeRegionDropdown();
	scrollToTop(false);
	if (isVisible == undefined) {
		isGalleryVisible = !isGalleryVisible;
	} else {
		isGalleryVisible = isVisible;
	}

	if (isGalleryVisible) {
		document.getElementById("btn-grp-left").classList.add("btn-grp-left");
		document.getElementById("btn-grp-right").classList.add("btn-grp-right");
		document.getElementById("top-bar").style.position = "sticky";
		document.getElementById("top-bar").style.backgroundColor = "white";
		addRemoveNoDisplay(["map-page", "to-top-btn", "globe-btn"], true);
		addRemoveNoDisplay(["gallery", "map-btn", "info-btn", "rgn-title-btn", "rgn-info", "rgn-info-drawer"], false);
		if (Gallery.allImages.length > 0) {
			addRemoveNoDisplay("filter-btn", false);
		}
		document.getElementById("rgn-info-bg").style.visibility = "visible";
		addRemoveTransparent("to-top-btn", true);
		if (isPortraitMode()) {
			document.getElementById("dates-title").scrollIntoView({ block: isPortraitMode() ? "end" : "start" });
		}
	} else {
		document.getElementById("btn-grp-left").classList.remove("btn-grp-left");
		document.getElementById("btn-grp-right").classList.remove("btn-grp-right");
		document.getElementById("top-bar").style.position = "fixed";
		document.getElementById("top-bar").style.backgroundColor = "transparent";
		addRemoveNoDisplay(["map-page", "to-top-btn", "globe-btn"], false);
		addRemoveNoDisplay(["gallery", "filter-btn", "map-btn", "info-btn", "rgn-title-btn", "rgn-info", "rgn-info-drawer"], true);
		document.getElementById("rgn-info-bg").style.visibility = "hidden";
		addRemoveTransparent("to-top-btn", false);
	}
	addRemoveTransparent("rgn-info-bg", false);

	if (!isGalleryVisible) {
		startLoading();
		setTimeout(() => {
			createMap();
			setTimeout(() => {
				openMapPage();
			}, 200);
		}, 50);
	}
}

function changeMainColor(newColor) {
	root.style.setProperty('--main-color', getComputedStyle(root).getPropertyValue(newColor));
	let temp = getComputedStyle(root).getPropertyValue("--main-color").split(", ");
	setAppColor(`rgb(${temp[0]}, ${temp[1]}, ${temp[2]})`);
}

function selectRegion(regionId, isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({ rgn: regionId }, null, null);
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
		changeGalleryVisibility(true);
	}, DEFAULT_TIMEOUT);
}

function selectCountry(countryId, countryColor, isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({ country: countryId, countryColor: countryColor }, null, null);
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

	// TODO: modularize loader
	startLoading();

	addRemoveNoDisplay(["map-page", "btn-grp-left"], false);
	addRemoveClass("btn-grp-right", "justify-end", false);

	changeMainColor(countryColor);

	countryTitle = getBilingualText(currentCountry.englishName, currentCountry.japaneseName);
	document.getElementById("main-title").innerHTML = countryTitle;
	document.getElementById("main-title").title = getBilingualText(`See all images from ${currentCountry.englishName}`, `${currentCountry.japaneseName}の写真をすべて表示する`);
	document.getElementById("rgn-title-btn").title = getBilingualText(`Change ${currentCountry.officialRegionNameEnglish}`, `${currentCountry.officialRegionNameJapanese}を切り替える`);
	document.getElementById("info-btn").title = getBilingualText(`Toggle ${currentCountry.official_region_name} info`, `${currentCountry.officialRegionNameJapanese}の情報をトグル`);

	Gallery.resetGallery();
	Gallery.createRegionDropDown(selectRegion);
	setTimeout(() => {
		createMap();
	}, 50);
	setTimeout(() => {
		stopLoader(openMapPage);
	}, 1200);
}

/**** Data Loading/Setup ****/
function setupSite() {
	[["pic-info-btn", "See picture information", "写真の情報を見る"],
	["globe-btn", "Return to country picker", "国の選択へ戻る"],
	["map-btn", "Return to map", "地図に戻る"],
	["creator-btn", "About the site", "このサイトについて"],
	["filter-btn", "Filter Pictures", "写真をフィルターする"],
	["left-arrow", "Previous picture", "前の写真"],
	["right-arrow", "Next picture", "次の写真"],
	["search-eng", "Google in English", "英語でググる"],
	["search-jp", "Google in Japanese", "日本語でググる"]]
		.forEach(element => {
			document.getElementById(element[0]).title = getBilingualText(element[1], element[2]);
		});

	document.getElementById("dates-title").innerHTML = getBilingualText("Dates visited", "訪れた日付");

	Array.from(document.getElementsByClassName("close-btn")).forEach(element => {
		element.title = getBilingualText("Close", "閉じる");
	})

	Array.from(document.getElementsByClassName("loader-dot")).forEach(dot => {
		dot.addEventListener("animationend", function () {
			addRemoveNoDisplay([dot], true);
		});
	});

	document.addEventListener("contextmenu", function (e) {
		if (e.target.nodeName === "IMG") {
			e.preventDefault();
		}
	}, false);

	document.getElementById("load8").addEventListener("animationend", function () {
		addRemoveNoDisplay("loading-screen", true);
		isLoading = false;
	});

	// Button click detections
	document.getElementById("rgn-drop-down-bg").addEventListener("click", Gallery.closeRegionDropdown);
	document.getElementById("rgn-info-bg").addEventListener("click", function () { changeRegionInfoVisibility(false); });
	document.getElementById("to-top-btn").addEventListener("click", function () {
		if (document.body.scrollTop > SCROLL_THRESHOLD) {
			scrollToTop(true);
		} else {
			document.getElementById("main-title").scrollIntoView({
				behavior: 'smooth',
				block: "start"
			});
		}
	});
	document.getElementById("main-title").addEventListener("click", function () { selectRegion(); });
	document.getElementById("rgn-title-btn").addEventListener("click", Gallery.toggleRegionDropdown);
	document.getElementById("creator-btn").addEventListener("click", openInfoPopup);
	document.getElementById("globe-btn").addEventListener("click", showStartScreen);
	document.getElementById("map-btn").addEventListener("click", function () { changeGalleryVisibility(false); });
	document.getElementById("info-btn").addEventListener("click", function () { Gallery.changeRegionInfoVisibility(undefined); });

	document.getElementById("filter-btn").addEventListener("click", Gallery.showFilter);

	document.getElementById("fullscreen-bg").addEventListener("click", function () { Fullscreen.closeFullscreen(true) });
	document.getElementById("fullscreen-ctrl").addEventListener("click", function () { Fullscreen.closeFullscreen(true) });
	document.getElementById("left-arrow").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("fullscreen-pic").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("right-arrow").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("left-arrow").addEventListener("click", function () { Fullscreen.changeFullscreenPicture(false); });
	document.getElementById("right-arrow").addEventListener("click", function () { Fullscreen.changeFullscreenPicture(true); });
	document.getElementById("pic-info-bg").addEventListener("click", Fullscreen.hidePicInfo);
	document.getElementById("pic-info-drawer").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("pic-info-btn").addEventListener("click", function () { Fullscreen.changePicInfoVisibility(); });
	document.getElementById("pic-info-close-btn").addEventListener("click", Fullscreen.hidePicInfo);
	document.getElementById("search-eng").addEventListener("click", Fullscreen.searchEnglish);
	document.getElementById("search-jp").addEventListener("click", Fullscreen.searchJapanese);

	document.getElementById("country-map-mini").addEventListener("load", () => {
		Gallery.filterMiniMap();
		stopLoading();
	});
	document.getElementById("country-map").addEventListener("load", colourMap);
	document.getElementById("rgn-info-handle").addEventListener("touchstart", e => { startHandleDrag(e, "rgn-info-handle") }, false);
	document.getElementById("pic-info-handle").addEventListener("touchstart", e => { startHandleDrag(e, "pic-info-handle") }, false);
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
			if (event.key === "ArrowRight") {
				Fullscreen.changeFullscreenPicture(true);
			} else if (event.key == "ArrowLeft") {
				Fullscreen.changeFullscreenPicture(false);
			} else if (!isPicInfoVisible && event.key == "ArrowUp") {
				Fullscreen.showPicInfo();
			} else if (isPicInfoVisible && event.key == "ArrowDown") {
				Fullscreen.hidePicInfo();
			}
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

	// Swipe detections
	let swipeContainer = document.getElementById("fullscreen");
	swipeContainer.addEventListener("touchstart", Fullscreen.startFullscreenSwipe, false);
	swipeContainer.addEventListener("touchmove", Fullscreen.moveFullscreenSwipe, false);

	// currently remove because it will not work on Apple
	document.getElementById("pic-info-details").addEventListener("touchstart", (event) => {
		event.stopPropagation();
	});
	document.getElementById("pic-info-details").addEventListener("touchmove", (event) => {
		event.stopPropagation();
	});

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
				changeGalleryVisibility(false);
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
				showFirstStartScreen();
			}
		});
}

function retry() {
	addRemoveNoDisplay("error-btn", true);
	for (let i = 0; i <= LOAD_DOT_COUNT; i++) {
		document.getElementById(`load${i}`).style.animationPlayState = "running";
	}
	fetchData();
}

function showDataLoadError() {
	setTimeout(() => {
		addRemoveNoDisplay("error-btn", false);
		addRemoveTransparent("error-btn", false);
		for (let i = 0; i <= LOAD_DOT_COUNT; i++) {
			document.getElementById(`load${i}`).style.animationPlayState = "paused";
		}
	}, DEFAULT_TIMEOUT);
}

function startLoading() {
	isLoading = true;
	addRemoveTransparent(["top-bar", "map-page", "start-screen"], true);
	addRemoveNoDisplay("loading-screen", false);
	addRemoveTransparent("loading-screen", false);

	startLoader();

	setTimeout(() => {
		addRemoveNoDisplay("start-screen", true);
	}, DEFAULT_TIMEOUT);
}

function stopLoading(){
	addRemoveTransparent("top-bar", false);
	document.body.style.overflowY = "auto";
	hideLoader();
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
}

function showFirstStartScreen() {
	window.history.pushState({}, null, null);
	stopLoader(showStartScreen);
}

function showStartScreen(isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({}, null, null);
	}

	setCurrentCountry(null);
	scrollToTop(false);
	changeMainColor("--default-color");
	addRemoveTransparent("top-bar", false);
	addRemoveTransparent("map-page", true);
	addRemoveClass("btn-grp-right", "justify-end", true);
	addRemoveNoDisplay(["top-bar", "load-icon"], false);
	addRemoveNoDisplay(["btn-grp-left", "loading-screen", "to-top-btn", "map-page"], true);
	document.getElementById(`load${LOAD_DOT_COUNT}`).removeEventListener("animationend", showStartScreen);
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
