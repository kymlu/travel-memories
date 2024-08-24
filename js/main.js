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

/// VARIABLES
// Booleans
/** @type {Loader} */
let loader = null;

/**** Data Loading/Setup ****/
function initializeSite() {
	loader = new Loader();
	document.body.append(loader);

	setSiteContents();

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
