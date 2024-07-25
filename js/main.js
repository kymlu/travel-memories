/*
	Project Name: Travel Memories
	Author: Katie Lu
	Note: will try converting to TypeScript later
*/

/// IMPORTS
import * as GalleryPage from '../pages/gallery-page/gallery-page.js';
import * as Fullscreen from '../components/fullscreen/fullscreen.js';
import InfoPopup from '../components/popup/info-popup/info-popup.js'
import * as Loader from '../components/loader/loader.js';
import * as MapPage from '../pages/map-page/map-page.js'
import * as StartPage from '../pages/start-page/start-page.js'
import {
	getBilingualText, isPortraitMode, scrollToTop,
} from '../../js/utils.js';
import {
	isCountrySelected, isGalleryPage, setAllCountryData, setAppColor, setCurrentCountry
} from './globals.js';
import { initializeStartScreen, showStartScreen } from '../pages/start-page/start-page.js';
import { CUSTOM_EVENT_TYPES } from './constants.js';

/// VARIABLES
// Booleans
let infoPopup = null;
let isInfoPopupVisible = false;

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
					GalleryPage.showRegionInfo(true);
				}
			} else if (currentY < initialYHandle) {
				if (grabbedHandleId == "rgn-info-handle") {
					GalleryPage.hideRegionInfo(true);
				}
			}
			initialYHandle = null;
			grabbedHandleId = null;
		}
	}
}

/**** Site Info Popup ****/
/** Opens the site info popup. */
function openInfoPopup() {
	isInfoPopupVisible = true;
	infoPopup.openPopup();
}

/** Closes the site info popup. */
function closeInfoPopup() {
	document.querySelector("info-popup").closePopup(true);
}

/** Leaves the Gallery page to return to the map. */
function leaveGalleryPage() {
	//Loader.startLoader();
	GalleryPage.closeGallery();
	setTimeout(() => {
		MapPage.goToMapPage();
	}, 200);
}

/**** Data Loading/Setup ****/
function initializeSite() {
	Loader.initializeLoader();
	Loader.startLoader(fetchData);

	[
		["globe-btn", "Return to country picker", "国の選択へ戻る"],
		["map-btn", "Return to map", "地図に戻る"],
		["creator-btn", "About the site", "このサイトについて"]
	].forEach(([id, englishText, japaneseText]) => {
		document.getElementById(id).title = getBilingualText(englishText, japaneseText);
	});

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
		["creator-btn", openInfoPopup],
		["globe-btn", showStartScreen],
		["map-btn", leaveGalleryPage]
	].forEach(([id, callback]) => {
		document.getElementById(id).addEventListener("click", callback);
	});

	MapPage.initializeMapPage();
	GalleryPage.initializeGallery();
	Fullscreen.initializeFullscreen();

	document.addEventListener("touchend", endHandleDrag, false);

	// Key input detections
	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			if (isInfoPopupVisible) {
				closeInfoPopup(true);
			} else if (GalleryPage.getIsFilterVisible()) {
				GalleryPage.closeFilter();
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
	infoPopup.addEventListener(CUSTOM_EVENT_TYPES.INFO_POPUP_CLOSED, () => {
		isInfoPopupVisible = false;
	});

	// Back button detections
	window.addEventListener('popstate', (event) => {
		if (event.state.country) {
			if (isGalleryPage()) {
				leaveGalleryPage();
			} else {
				StartPage.selectCountry(event.state.country, event.state.countryColor, true);
			}
		} else if (event.state.rgn && isCountrySelected()) {
			MapPage.selectRegion(event.state.rgn, true);
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
			if (d == null) {
				throw new Error("No data");;
			} else {
				setAllCountryData(d);
			}
		}).catch(error => {
			showDataLoadError();
			hasError = true;
			console.error(error);
		}).then(() => {
			if (!hasError) {
				initializeStartScreen();
				Loader.stopLoader(showStartScreen)
			}
		});
}

/**** Main ****/
function main() {
	scrollToTop(false);
	initializeSite();
	fetchData();
}

main();
