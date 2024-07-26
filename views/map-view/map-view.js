import { getAppColor, getCurrentCountry, onSelectNewRegion } from "../../js/globals.js";
import {
	addClickListeners, addRemoveNoDisplay, addRemoveTransparent,
	getBilingualText, scrollToTop, setBilingualAttribute
} from "../../js/utils.js";

/** The Map View. */
export default class MapView extends HTMLElement {
	constructor(element) {
		super();
		this.innerHTML = element;
		this.countryTitle = "";
		this.currentCountry = null;
		this.elements = {
			map: document.getElementById("country-map"),
			mainTitle: document.getElementById("main-title")
		}
		this.initialize();
	}

	initialize() {
		this.elements.map.addEventListener("load", colourMap);

		addClickListeners([[this.elements.mainTitle, function () { onSelectNewRegion(null); }]]);
	}

	handleNewCountry() {
		currentCountry = getCurrentCountry();
		countryTitle = getBilingualText(currentCountry.englishName, currentCountry.japaneseName);
		
		addRemoveNoDisplay([this], false);

		setBilingualAttribute([
			[this.elements.mainTitle, `See all images from ${currentCountry.englishName}`, `${currentCountry.japaneseName}の写真をすべて表示する`],
		], "title");

		setTimeout(() => {
			createMap();
		}, 50);
	}

	show() {
		this.elements.mainTitle.innerHTML = countryTitle;
		scrollToTop(false);
		addRemoveTransparent([this], false);
	}

	hide() {
		addRemoveTransparent([this], true);
		addRemoveNoDisplay([this], true);
	}

	/** Colours the map according to which regions have been visited. */
	colourMap() {
		if (this.elements.map.data == "") return;

		const svgDoc = this.elements.map.contentDocument;
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
					onSelectNewRegion(rgn.id);
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
	createMap() {
		this.elements.map.data = `assets/img/country/${currentCountry.id}.svg`;
	}
}

window.customElements.define("map-view", MapView);