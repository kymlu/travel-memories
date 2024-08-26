import BaseElement from "../../js/base-element.js";
import { ATTRIBUTES, CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT } from "../../js/constants.js";
import {
	getAppColor, getCurrentCountry, getTranslucentAppColor, onSelectNewRegion
} from "../../js/globals.js";
import {
	addClickListeners, addRemoveClass, addRemoveNoDisplay,
	addRemoveTransparent, fetchInnerHtml, getBilingualText, scrollToTop
} from "../../js/utils.js";

/** The Map View. */
export default class MapView extends BaseElement {
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
		document.addEventListener(CUSTOM_EVENT_TYPES.NEW_COUNTRY_SELECTED, this.handleNewCountry.bind(this));
	}

	connectedCallback() {
		fetchInnerHtml("views/map-view/map-view.html", this, true)
			.then(() => {
				setTimeout(() => {
					this._elements = {
						view: this.queryByClassName("map-view"),
						mapControl: this.queryById("map-control"),
						mapContainer: this.queryById("map-container"),
						map: this.queryById("country-map"),
						mainTitle: this.queryById("main-title"),
						mainTitleText: this.queryById("main-title-text"),
						zoomIn: this.queryById("zoom-in"),
						zoomOut: this.queryById("zoom-out"),
					}

					setTimeout(() => {
						this._elements.map.addEventListener("load", this.colourMap.bind(this));
						addClickListeners([
							[this._elements.mainTitle, () => { onSelectNewRegion(this.selectedRegion, null, true); }],
							[this._elements.zoomIn, this.scaleMap.bind(this, undefined, true)],
							[this._elements.zoomOut, this.scaleMap.bind(this, undefined, false)]
						]);
						["mouseover", "touchstart"].forEach(eventName => {
							this._elements.mainTitle.addEventListener(eventName, () => {
								addRemoveClass([this._elements.mainTitle], "animated", true);
								this._elements.mainTitle.querySelector("i").classList.add("white");
							});
						});
						["mouseout", "touchend"].forEach(eventName => {
							this._elements.mainTitle.addEventListener(eventName, () => {
								addRemoveClass([this._elements.mainTitle], "animated", false);
								this._elements.mainTitle.querySelector("i").classList.remove("white");
							});
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

		if (this.selectedRegion != null) {
			this.colourMap();
			this.selectedRegion = null;
		}

		this._elements.mainTitleText.innerHTML = this.defaultMainTitleText;
		this._elements.mainTitle.title = this.defaultMainTitleTitle;
		scrollToTop(false);
		// Note: for some reason making "this" transparent does not work.
		setTimeout(() => {
			addRemoveTransparent([this._elements.view], false);
		}, 0);
	}

	/** Hide the map view. */
	hide() {
		addRemoveTransparent([this._elements.view], true);
		setTimeout(() => {
			addRemoveNoDisplay([this], true);
		}, DEFAULT_TIMEOUT);
	}

	/** Sets the appropriate map. */
	createMap() {
		this._elements.map.data = `assets/img/country/${this.currentCountry.id}.svg`;
	}

	/** Colours the map according to which regions have been visited. */
	colourMap() {
		setTimeout(() => {
			if (!this._elements.map.hasAttribute("data") || this._elements.map.data == "") return;

			const svgDoc = this._elements.map.contentDocument;
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

					["touchstart", "mouseover"].forEach(eventName => {
						rgnImg.addEventListener(eventName, () => {
							rgnImg.setAttribute("opacity", "50%");
						});
					});

					["touchend", "mouseout"].forEach(eventName => {
						rgnImg.addEventListener(eventName, () => {
							rgnImg.setAttribute("opacity", "100%");
						});
					});

					rgnImg.addEventListener("mouseup", this.selectRegion.bind(this, rgn));

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
			const oldRegionSvg = this._elements.map.contentDocument.getElementById(`${this.selectedRegion}-img`);
			oldRegionSvg.setAttribute("fill", getAppColor());
			oldRegionSvg.setAttribute("stroke", "none");
		}

		if (this.selectedRegion == region.id) {
			this.selectedRegion = null;
			this._elements.mainTitleText.innerHTML = this.defaultMainTitleText;
			this._elements.mainTitle.title = this.defaultMainTitleTitle;
		} else {
			this.selectedRegion = region.id;
			const newRegionSvg = this._elements.map.contentDocument.getElementById(`${this.selectedRegion}-img`);
			newRegionSvg.setAttribute("fill", getTranslucentAppColor());
			newRegionSvg.setAttribute("stroke", getAppColor());
			newRegionSvg.setAttribute("stroke-width", this.outlineThickness);
			this._elements.mainTitleText.innerHTML = getBilingualText(region.englishName, region.japaneseName);
			this._elements.mainTitle.title = this.defaultMainTitleTitle = getBilingualText(`See all images from ${region.englishName}`, `${region.japaneseName}の写真をすべて表示する`);
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

		addRemoveClass([this._elements.zoomIn], "disabled", this.scaleLevel == maxScale);
		addRemoveClass([this._elements.zoomOut], "disabled", this.scaleLevel == minScale);

		this._elements.map.classList.remove(`scale-${oldScale}`);
		this._elements.map.classList.add(`scale-${this.scaleLevel}`);

		const mapSize = this._elements.map.getBoundingClientRect();
		this._elements.mapContainer.scrollTo({
			top: 0.5 * (this.scaleLevel - 1) * mapSize.height / this.scaleLevel,
			left: 0.5 * (this.scaleLevel - 1) * mapSize.width / this.scaleLevel
		});

		setTimeout(() => {
			this.isScaling = false;
		}, 50);
	}
}

window.customElements.define("map-view", MapView);