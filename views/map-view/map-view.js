import { ATTRIBUTES, DEFAULT_TIMEOUT } from "../../js/constants.js";
import {
	getAppColor, getCurrentCountry, getTranslucentAppColor, onSelectNewRegion
} from "../../js/globals.js";
import {
	addClickListeners, addRemoveClass, addRemoveNoDisplay,
	addRemoveTransparent, fetchInnerHtml, getBilingualText, scrollToTop
} from "../../js/utils.js";

/** The Map View. */
export default class MapView extends HTMLElement {
	#elements;

	constructor() {
		super();
		this.defaultMainTitleText = "";
		this.defaultMainTitleTitle = "";
		this.currentCountry = null;
		this.selectedRegion = null;
		this.isSelectingRegion = false;
		this.outlineThickness = 0;
		this.scaleLevel = 1;
		this.isScaling = false;
		this.#elements = {};
	}

	connectedCallback() {
		fetchInnerHtml("views/map-view/map-view.html", this)
			.then(() => {
				setTimeout(() => {
					this.#elements = {
						view: this.querySelector(".map-view"),
						mapControl: this.querySelector("#map-control"),
						mapContainer: this.querySelector("#map-container"),
						map: this.querySelector("#country-map"),
						mainTitle: this.querySelector("#main-title"),
						mainTitleText: this.querySelector("#main-title-text"),
						zoomIn: this.querySelector("#zoom-in"),
						zoomOut: this.querySelector("#zoom-out"),
					}

					setTimeout(() => {
						this.#elements.map.addEventListener("load", this.colourMap.bind(this));
						addClickListeners([
							[this.#elements.mainTitle, () => { onSelectNewRegion(this.selectedRegion, null, true); }],
							[this.#elements.zoomIn, this.scaleMap.bind(this, undefined, true)],
							[this.#elements.zoomOut, this.scaleMap.bind(this, undefined, false)]
						]);
						this.#elements.mainTitle.addEventListener("mouseover", () => {
							this.#elements.mainTitle.querySelector("i").classList.add("white");
						});
						this.#elements.mainTitle.addEventListener("mouseout", () => {
							this.#elements.mainTitle.querySelector("i").classList.remove("white");
						});
					}, 50);

					addRemoveNoDisplay([this]);
				}, 50);
			});
	}

	/** Function to run when a new country is selected. */
	handleNewCountry() {
		addRemoveNoDisplay([this], false);
		this.currentCountry = getCurrentCountry();
		this.defaultMainTitleText = getBilingualText(this.currentCountry.englishName, this.currentCountry.japaneseName);
		this.defaultMainTitleTitle = getBilingualText(`See all images from ${this.currentCountry.englishName}`, `${this.currentCountry.japaneseName}の写真をすべて表示する`);

		setTimeout(() => {
			this.createMap();
		}, 50);
	}

	/** Show the map view. */
	show() {
		addRemoveNoDisplay([this], false);
		this.scaleMap(1);
		this.selectedRegion = null;
		this.#elements.mainTitleText.innerHTML = this.defaultMainTitleText;
		this.#elements.mainTitle.title = this.defaultMainTitleTitle;
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
			this.outlineThickness = parseInt(svgDoc.querySelector("svg").getAttribute("width")) * 0.025;
			const rgnList = this.currentCountry.regionGroups.flatMap(rgnGrp => rgnGrp.regions);

			rgnList.forEach(rgn => {
				const rgnImg = svgDoc.getElementById(`${rgn.id}-img`);
				if (rgn.visited) {
					// CSS won't work on document objects
					let imgTitle = document.createElementNS("http://www.w3.org/2000/svg", ATTRIBUTES.TITLE);
					imgTitle.innerHTML = getBilingualText(`Toggle ${rgn.englishName}`, `${rgn.japaneseName}をトグルする`);
					rgnImg.appendChild(imgTitle);
					rgnImg.setAttribute("fill", getAppColor());
					rgnImg.setAttribute("stroke", "none");
					rgnImg.setAttribute("cursor", "pointer");
					rgnImg.setAttribute("transition", "opacity 0.3 ease-in-out");

					rgnImg.addEventListener("mouseover", () => {
						rgnImg.setAttribute("opacity", "50%");
					});

					rgnImg.addEventListener("mouseup", this.selectRegion.bind(this, rgn));

					rgnImg.addEventListener("mouseout", () => {
						rgnImg.setAttribute("opacity", "100%");
					});

				} else {
					rgnImg.setAttribute("fill", "lightgrey");
				}
			});
		}, 50);
	}

	/** Highlights the appropriate region. */
	selectRegion(region) {
		if (this.isSelectingRegion) return;
		this.isSelectingRegion = true;

		if (this.selectedRegion) {
			const oldRegionSvg = this.#elements.map.contentDocument.getElementById(`${this.selectedRegion}-img`);
			oldRegionSvg.setAttribute("fill", getAppColor());
			oldRegionSvg.setAttribute("stroke", "none");
		}

		if (this.selectedRegion == region.id) {
			this.selectedRegion = null;
			this.#elements.mainTitleText.innerHTML = this.defaultMainTitleText;
			this.#elements.mainTitle.title = this.defaultMainTitleTitle;
		} else {
			this.selectedRegion = region.id;
			const newRegionSvg = this.#elements.map.contentDocument.getElementById(`${this.selectedRegion}-img`);
			newRegionSvg.setAttribute("fill", getTranslucentAppColor());
			newRegionSvg.setAttribute("stroke", getAppColor());
			newRegionSvg.setAttribute("stroke-width", this.outlineThickness);
			this.#elements.mainTitleText.innerHTML = getBilingualText(region.englishName, region.japaneseName);
			this.#elements.mainTitle.title = this.defaultMainTitleTitle = getBilingualText(`See all images from ${region.englishName}`, `${region.japaneseName}の写真をすべて表示する`);
		}

		setTimeout(() => {
			this.isSelectingRegion = false;
		}, 50);
	}

	/** Change the scale of the map. */
	scaleMap(newScaleValue, isIncrease) {
		if (this.isScaling) return;

		const minScale = 1;
		const maxScale = 4;
		if ((newScaleValue != undefined && (newScaleValue > maxScale || newScaleValue < minScale)) ||
			(isIncrease && this.scaleLevel >= maxScale) ||
			(!isIncrease && this.scaleLevel <= minScale)) return;

		this.isScaling = true;

		const oldScale = this.scaleLevel;

		if (newScaleValue == undefined) {
			if (isIncrease) {
				this.scaleLevel++;
			} else {
				this.scaleLevel--;
			}
		} else {
			this.scaleLevel = newScaleValue;
		}

		addRemoveClass([this.#elements.zoomIn], "disabled", this.scaleLevel == maxScale);
		addRemoveClass([this.#elements.zoomOut], "disabled", this.scaleLevel == minScale);

		this.#elements.map.classList.remove(`scale-${oldScale}`);
		this.#elements.map.classList.add(`scale-${this.scaleLevel}`);

		const mapSize = this.#elements.map.getBoundingClientRect();
		this.#elements.mapContainer.scrollTo({
			top: 0.5 * (this.scaleLevel - 1) * mapSize.height / this.scaleLevel,
			left: 0.5 * (this.scaleLevel - 1) * mapSize.width / this.scaleLevel
		});

		setTimeout(() => {
			this.isScaling = false;
		}, 50);
	}
}

window.customElements.define("map-view", MapView);