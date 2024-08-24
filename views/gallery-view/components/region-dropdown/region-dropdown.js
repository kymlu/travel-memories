import CustomHeader from "../../../../components/header/header.js";
import { CUSTOM_EVENT_TYPES } from "../../../../js/constants.js";
import { getCurrentCountry, onSelectNewRegion } from "../../../../js/globals.js";
import {
	addClickListeners, addRemoveNoDisplay, addRemoveTransparent, fetchInnerHtml, getBilingualText
} from "../../../../js/utils.js";

/** The Region Dropdown. */
export default class RegionDropdown extends HTMLElement {
	#elements;

	constructor() {
		super();
		/** @type {CustomHeader} */
		this.header = null;
		document.addEventListener(CUSTOM_EVENT_TYPES.HEADER_CHANGED, (event) => this.header = event.detail.header);
		
		this.hasOpenedForRegion = false;
		this.currentRegionId = null;
		
		this.#elements = {};

	}

	connectedCallback() {
		fetchInnerHtml("views/gallery-view/components/region-dropdown/region-dropdown.html", this)
			.then(() => {
				this.#elements = {
					background: this.querySelector("#rgn-drop-down-bg"),
					content: this.querySelector("#rgn-drop-down"),
				}
				setTimeout(() => {
					addClickListeners([
						[this.#elements.background, this.close.bind(this, null)]
					]);
					addRemoveNoDisplay([this], true);
					addRemoveTransparent([this.querySelector(".transparent")], false);
				}, 50);
			});
	}

	/** 
	 * Creates the region drop down list.
	 */
	handleNewCountry() {
		// the dropdown object
		const dropDownList = this.#elements.content;
		dropDownList.replaceChildren();

		// region group text and regions
		let regionGroupTemplate = document.createElement("div");
		regionGroupTemplate.classList.add("rgn-grp-text", "regular-text");

		let regionTemplate = document.createElement("button");
		regionTemplate.classList.add("rgn-txt", "regular-text", "highlight-btn", "text-btn");

		// Iterate each unofficial and official region, sort by visited/not visited
		const currentCountry = getCurrentCountry();
		currentCountry.regionGroups.filter(grp => grp.regions.some(rgn => rgn.visited)).forEach(grp => {
			let regionGroupElement = regionGroupTemplate.cloneNode();

			if (currentCountry.showUnofficialRegions) {
				regionGroupElement.innerHTML = getBilingualText(grp.englishName, grp.japaneseName);
				dropDownList.appendChild(regionGroupElement);
			}

			grp.regions.filter(rgn => rgn.visited).forEach(rgn => {
				if (rgn.visited) {
					let regionButton = regionTemplate.cloneNode();
					regionButton.innerHTML = getBilingualText(rgn.englishName, rgn.japaneseName);
					regionButton.id = this.#getDropdownElementId(rgn.id);
					regionButton.title = getBilingualText(`See images from ${rgn.englishName}`, `${rgn.japaneseName}の写真を表示する`);
					regionButton.classList.add("visited-rgn-text");
					regionButton.addEventListener("click", () => { onSelectNewRegion(rgn.id, null, false) }, false);
					dropDownList.appendChild(regionButton);
				}
			});
		});
	}

	/** Changes the highlighted region. 
	 * @param {string} oldRegionId 
	 * @param {string} newRegionId 
	*/
	changeSelectedRegion(oldRegionId, newRegionId) {
		if (oldRegionId) {
			document.getElementById(this.#getDropdownElementId(oldRegionId))?.classList.remove("active");
		}

		if (newRegionId) {
			this.hasOpenedForRegion = false;
			this.currentRegionId = newRegionId;
			document.getElementById(this.#getDropdownElementId(newRegionId))?.classList.add("active");
		}

		this.close();
	}

	/** Toggles the visibility of the dropdown. */
	toggleVisibility() {
		this.classList.toggle("no-display");
		this.header.flipRegionNameArrow();
		if (!this.hasOpenedForRegion) {
			this.hasOpenedForRegion = true;
			if (this.currentRegionId) {
				document.getElementById(this.#getDropdownElementId(this.currentRegionId)).scrollIntoView({ behavior: "smooth", block: "center" });
			} else {
				this.#elements.content.scrollTo({ top: 0, behavior: "instant" });
			}
		}
	}

	close() {
		addRemoveNoDisplay([this], true);
		this.header.flipRegionNameArrow(false);
	}

	#getDropdownElementId(name) {
		return `${name}-dropdown`;
	}
}

window.customElements.define("region-dropdown", RegionDropdown);