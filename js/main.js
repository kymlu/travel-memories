/*
	Project Name: Travel Memories
	Author: Katie Lu
	Note: will try converting to TypeScript later
*/

/// IMPORTS
import InfoPopup from '../components/popup/info-popup/info-popup.js'
import Loader from '../components/loader/loader.js';
import * as MapView from '../views/map-view/map-view.js'
import * as StartView from '../views/start-view/start-view.js'
import {
	endHandleDrag,
	goToMapView,
	goToStartView,
	isCountrySelected, isGalleryView, setAllCountryData,
	setSiteContents,
} from './globals.js';
import {
	getBilingualText, scrollToTop,
} from './utils.js';

/// VARIABLES
// Booleans
/** @type {Loader} */
let loader = null;

function fetchHtml(fileName, type) {
	let retVal = null;
	fetch(fileName)
		.then(response => retVal = response.text())
		.catch(error => {
			console.error(`Error loading ${type}.`, error);
		});

	return retVal;
}

/**** Data Loading/Setup ****/
function initializeSite() {
	loader = new Loader(fetchData);
	document.appendChild(loader);
	loader.startLoader();

	// Popups
	let infoPopup = new InfoPopup();
	document.body.appendChild(infoPopup);

	Promise.all([
		fetchHtml("../components/header/header.html", "header"),
		fetchHtml("../views/start-view/start-view.html", "start view"),
		fetchHtml("../views/map-view/map-view.html", "map view"),
		fetchHtml("../views/gallery-view/gallery-view.html", "gallery view"),
		fetchHtml("../components/fullscreen/fullscreen.html", "fullscreen"),
	]).then(([headerComponent, startView, mapView, galleryView, fullscreen]) => {
		const headerElement = document.getElementById("header");
		headerElement.innerHTML = headerComponent;
		setSiteContents(headerElement, infoPopup, startView, mapView, galleryView, fullscreen);
	});

	// TODO: put this in each class?
	Array.from(document.getElementsByClassName("close-btn")).forEach(element => {
		element.title = getBilingualText("Close", "閉じる");
	});

	document.addEventListener("contextmenu", function (e) {
		if (e.target.nodeName === "IMG") {
			e.preventDefault();
		}
	}, false);

	document.addEventListener("touchend", endHandleDrag, false);

	// Back button detections // TODO
	// window.addEventListener('popstate', (event) => {
	// 	if (event.state.country) {
	// 		if (isGalleryView()) {
	// 			goToMapView();
	// 		} else {
	// 			StartView.selectCountry(event.state.country, event.state.countryColor, true);
	// 		}
	// 	} else if (event.state.rgn && isCountrySelected()) {
	// 		MapView.selectRegion(event.state.rgn, true);
	// 	} else {
	// 		goToStartView(true);
	// 	}
	// });
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
				throw new Error("No data");
			} else {
				setAllCountryData(d);
			}
		}).catch(error => {
			loader.showDataLoadError();
			hasError = true;
			console.error("Error loading data.", error);
		}).then(() => {
			if (!hasError) {
				loader.stopLoader(goToStartView);
			}
		});
}

document.addEventListener("DOMContentLoaded", () => {
	scrollToTop(false);
	initializeSite();
	fetchData();
});
