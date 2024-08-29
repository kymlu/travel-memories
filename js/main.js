/*
	Project Name: Travel Memories
	Author: Katie Lu
*/

/// IMPORTS
import { VIEW_NAMES } from './constants.js';
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

/**** Data Loading/Setup ****/
function initializeSite() {
	setSiteContents();

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
				goToStartView(false);
			}
		}).catch(error => {
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