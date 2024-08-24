/*
	Project Name: Travel Memories
	Author: Katie Lu
*/

/// IMPORTS
import { CUSTOM_EVENT_TYPES, VIEW_NAMES } from './constants.js';
import Loader from '../components/loader/loader.js';
import {
	goToMapView,
	goToStartView,
	isStartView,
	onSelectNewRegion,
	setAllCountryData,
	setCurrentCountry,
	setSiteContents,
} from './globals.js';
import {
	scrollToTop,
} from './utils.js';
import ImagePolaroid from '../views/gallery-view/components/polaroid/img-polaroid/img-polaroid.js';
import TextPolaroid from '../views/gallery-view/components/polaroid/txt-polaroid/txt-polaroid.js';

/// VARIABLES
// Booleans
/** @type {Loader} */
let loader = null;

async function fetchHtml(address, type) {
	try {
		const response = await fetch(address);
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

	Promise.all([
		fetchHtml("views/gallery-view/components/polaroid/img-polaroid/img-polaroid.html", ImagePolaroid.name),
		fetchHtml("views/gallery-view/components/polaroid/txt-polaroid/txt-polaroid.html", TextPolaroid.name),
	]).then(([imgPolaroid, txtPolaroid]) => {
		setSiteContents(imgPolaroid, txtPolaroid);
	});

	// document.addEventListener("contextmenu", function (e) {
	// 	if (e.target.nodeName === "IMG") {
	// 		e.preventDefault();
	// 	}
	// }, false);

	// Back button detections
	window.addEventListener('popstate', (event) => {
		if (event.state.type == VIEW_NAMES.MAP) {
			if (isStartView()) {
				setCurrentCountry(event.state.country, event.state.countryColor, true);
			}
			goToMapView();
		} else if (event.state.type == VIEW_NAMES.GALLERY) {
			onSelectNewRegion(event.state.regionId, true, false);
		} else {
			goToStartView(true);
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
				throw new Error("No data");
			} else {
				setAllCountryData(d);
				loader.stop(goToStartView.bind(this, false));
				loader.addEventListener(CUSTOM_EVENT_TYPES.LOADING_COMPLETE, loader.remove);
			}
		}).catch(error => {
			loader.showDataLoadError(fetchData);
			hasError = true;
			console.error("Error loading data.", error);
		});
}

document.addEventListener("DOMContentLoaded", () => {
	scrollToTop(false);
	initializeSite();
	setTimeout(() => {
		fetchData();
	}, 100);
});
