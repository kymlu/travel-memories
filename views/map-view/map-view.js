import { ATTRIBUTES, DEFAULT_TIMEOUT } from "../../js/constants.js";
import { getAppColor, getCurrentCountry, onSelectNewRegion } from "../../js/globals.js";
import {
	addClickListeners, addRemoveNoDisplay, addRemoveTransparent,
	getBilingualText, scrollToTop, setBilingualProperty
} from "../../js/utils.js";

/** The Map View. */
export default class MapView extends HTMLElement {
	#elements;

	constructor(innerHtml) {
		super();
		this.innerHTML = innerHtml;
		this.countryTitle = "";
		this.currentCountry = null;
		this.#elements = {};
	}

	connectedCallback() {
		setTimeout(() => {
			this.#elements = {
				view: this.querySelector(".map-view"),
				map: this.querySelector("#country-map"),
				mainTitle: this.querySelector("#main-title")
			}

			setTimeout(() => {
				this.#elements.map.addEventListener("load", this.colourMap.bind(this));
				addClickListeners([[this.#elements.mainTitle, function () { onSelectNewRegion(null, null, true); }]]);
			}, 50);
			addRemoveNoDisplay([this]);
		}, 50);
	}

	/** Function to run when a new country is selected. */
	// TODO: put a listener in here? 
	handleNewCountry() {
		addRemoveNoDisplay([this], false);
		this.currentCountry = getCurrentCountry();
		this.countryTitle = getBilingualText(this.currentCountry.englishName, this.currentCountry.japaneseName);


		setBilingualProperty([
			[this.#elements.mainTitle, `See all images from ${this.currentCountry.englishName}`, `${this.currentCountry.japaneseName}の写真をすべて表示する`],
		], ATTRIBUTES.TITLE);

		setTimeout(() => {
			this.createMap();
		}, 50);
	}

	/** Show the map view. */
	show() {
		addRemoveNoDisplay([this], false);
		this.#elements.mainTitle.innerHTML = this.countryTitle;
		scrollToTop(false);
		// Note: for some reason making "this" transparent does not work.
		setTimeout(() => {
			addRemoveTransparent([this.#elements.view], false);
		}, 0);
	}

	/** Hide the map view. */
	hide() {
		addRemoveTransparent([this.#elements.view], true);
		setTimeout(() => {
			addRemoveNoDisplay([this], true);
		}, DEFAULT_TIMEOUT);
	}

	/** Sets the appropriate map. */
	createMap() {
		this.#elements.map.data = `assets/img/country/${this.currentCountry.id}.svg`;
	}

	/** Colours the map according to which regions have been visited. */
	colourMap() {
		setTimeout(() => {
			if (!this.#elements.map.hasAttribute("data") || this.#elements.map.data == "") return;

			const svgDoc = this.#elements.map.contentDocument;
			const rgnList = this.currentCountry.regionGroups.flatMap(rgnGrp => rgnGrp.regions);

			rgnList.forEach(rgn => {
				const rgnImg = svgDoc.getElementById(`${rgn.id}-img`);
				if (rgn.visited) {
					// CSS won't work on document objects
					let imgTitle = document.createElementNS("http://www.w3.org/2000/svg", ATTRIBUTES.TITLE);
					imgTitle.innerHTML = getBilingualText(`See images from ${rgn.englishName}`, `${rgn.japaneseName}の写真を表示する`);
					rgnImg.appendChild(imgTitle);
					rgnImg.setAttribute("fill", getAppColor());
					rgnImg.setAttribute("stroke", "none");
					rgnImg.setAttribute("cursor", "pointer");
					rgnImg.setAttribute("transition", "opacity 0.3 ease-in-out");
					rgnImg.addEventListener("click", function () {
						onSelectNewRegion(rgn.id, null, true);
						document.getElementById("main-title").innerHTML = getBilingualText(rgn.englishName, rgn.japaneseName);
					});

					rgnImg.addEventListener("mouseover", () => {
						rgnImg.setAttribute("opacity", "50%");
						document.getElementById("main-title").innerHTML = getBilingualText(rgn.englishName, rgn.japaneseName);
					});

					rgnImg.addEventListener("mouseout", () => {
						rgnImg.setAttribute("opacity", "100%");
						document.getElementById("main-title").innerHTML = this.countryTitle;
					});
				} else {
					rgnImg.setAttribute("fill", "lightgrey");
				}
			});
		}, 50);
	}
}

window.customElements.define("map-view", MapView);