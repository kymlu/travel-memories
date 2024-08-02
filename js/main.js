/*
	Project Name: Travel Memories
	Author: Katie Lu
	Note: will try converting to TypeScript later
*/

/// IMPORTS
import { CUSTOM_EVENT_TYPES } from './constants.js';
import Fullscreen from '../components/fullscreen/fullscreen.js';
import Loader from '../components/loader/loader.js';
import {
	endHandleDrag,
	goToStartView,
	setAllCountryData,
	setSiteContents,
} from './globals.js';
import {
	scrollToTop,
} from './utils.js';
import ImagePolaroid from '../components/polaroid/img-polaroid/img-polaroid.js';
import TextPolaroid from '../components/polaroid/txt-polaroid/txt-polaroid.js';
import InfoPopup from '../components/popup/info-popup/info-popup.js'
import GalleryView from '../views/gallery-view/gallery-view.js';
import MapView from '../views/map-view/map-view.js';

/// VARIABLES
// Booleans
/** @type {Loader} */
let loader = null;

async function fetchHtml(fileName, type) {
	try {
		const response = await fetch(fileName);
		const html = await response.text();
		return html;
	} catch (error) {
		console.error(`Error loading ${type}.`, error);
	}
}

/**** Data Loading/Setup ****/
function initializeSite() {
	loader = new Loader();
	document.body.append(loader);

	// Popups
	let infoPopup = new InfoPopup();
	document.body.appendChild(infoPopup);

	Promise.all([
		fetchHtml("views/map-view/map-view.html", MapView.name),
		fetchHtml("views/gallery-view/gallery-view.html", GalleryView.name),
		fetchHtml("components/fullscreen/fullscreen.html", Fullscreen.name),
		fetchHtml("components/polaroid/img-polaroid/img-polaroid.html", ImagePolaroid.name),
		fetchHtml("components/polaroid/txt-polaroid/txt-polaroid.html", TextPolaroid.name),
	]).then(([mapView, galleryView, fullscreen, imgPolaroid, txtPolaroid]) => {
		setSiteContents(infoPopup, mapView, galleryView, fullscreen, imgPolaroid, txtPolaroid);
	});

	// // TODO: put this in each class?
	// Array.from(document.getElementsByClassName("close-btn")).forEach(element => {
	// 	element.title = getBilingualText("Close", "閉じる");
	// });

	// document.addEventListener("contextmenu", function (e) {
	// 	if (e.target.nodeName === "IMG") {
	// 		e.preventDefault();
	// 	}
	// }, false);

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
	// 		onSelectNewRegion(event.state.rgn, true);
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
			loader.showDataLoadError(fetchData);
			hasError = true;
			console.error("Error loading data.", error);
		}).then(() => {
			if (!hasError) {
				loader.stop(goToStartView);
				loader.addEventListener(CUSTOM_EVENT_TYPES.LOADING_COMPLETE, loader.remove);
			}
		});
}

document.addEventListener("DOMContentLoaded", () => {
	scrollToTop(false);
	initializeSite();
	setTimeout(() => {
		fetchData();
	}, 100);
});
