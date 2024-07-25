import * as Loader from "../../../components/loader/loader.js";
import * as GalleryPage from "../gallery-page/gallery-page.js"
import { DEFAULT_TIMEOUT, PAGE_NAMES } from "../../../js/constants.js";
import { setCurrentPage } from "../../../js/globals.js";
import { getAppColor, getCurrentCountry } from "../../js/globals.js";
import {
	addRemoveClass, addRemoveNoDisplay, addRemoveTransparent, getBilingualText, scrollToTop
} from "../../js/utils.js";

let countryTitle = "";
let currentCountry = null;

export function initializeMapPage() {
	document.getElementById("country-map").addEventListener("load", colourMap);

	[
		["main-title", function () { selectRegion(null); }]
	].forEach(([id, callback]) => {
		document.getElementById(id).addEventListener("click", callback);
	});
}

export function handleNewCountry() {
	currentCountry = getCurrentCountry();
	countryTitle = getBilingualText(currentCountry.englishName, currentCountry.japaneseName);

	addRemoveNoDisplay(["map-page", "btn-grp-left"], false);
	addRemoveClass("btn-grp-right", "justify-end", false);

	[
		["main-title", `See all images from ${currentCountry.englishName}`, `${currentCountry.japaneseName}の写真をすべて表示する`],
	].forEach(([id, englishText, japaneseText]) => {
		document.getElementById(id).title = getBilingualText(englishText, japaneseText);
	});

	setTimeout(() => {
		createMap();
	}, 50);
}

export function goToMapPage() {
	setCurrentPage(PAGE_NAMES.MAP);
	document.getElementById("main-title").innerHTML = countryTitle;
	scrollToTop(false);
	//Loader.stopLoader();
	addRemoveTransparent("map-page", false);
}

/** Colours the map according to which regions have been visited. */
export function colourMap() {
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
export function createMap() {
	const svgObj = document.getElementById("country-map");
	svgObj.data = `assets/img/country/${currentCountry.id}.svg`;
}

export function selectRegion(regionId, isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({ rgn: regionId }, "", null);
	}

	Loader.startLoader();
	if (regionId != undefined && regionId != null) {
		let newRegion = currentCountry.regionGroups.flatMap(x => x.regions).filter(rgn => rgn.id == regionId);
		GalleryPage.setNewRegion(newRegion, true);
	} else {
		let visitedRgns = currentCountry.regionGroups.flatMap(grp => grp.regions.filter(rgn => rgn.visited));
		GalleryPage.setNewRegion(visitedRgns, false);
	}

	setTimeout(() => {
		GalleryPage.openGallery();
	}, DEFAULT_TIMEOUT);
}