import BaseElement from "../../../../js/base-element.js";
import { CUSTOM_EVENT_TYPES } from "../../../../js/constants.js";
import { getHeader, isGalleryView, onSelectNewRegion } from "../../../../js/globals.js";
import {
	addClickListeners, addRemoveNoDisplay, addRemoveTransparent, 
	fetchInnerHtml, getBilingualText
} from "../../../../js/utils.js";

/** The Region Dropdown. */
export default class RegionDropdown extends BaseElement {
	constructor() {
		super();
		this.hasOpenedForRegion = false;
		this.currentRegionId = null;

		document.addEventListener(CUSTOM_EVENT_TYPES.NEW_COUNTRY_SELECTED,
			(event) => { this.handleNewCountry(event.detail.country) });
	}

	connectedCallback() {
		fetchInnerHtml("views/gallery-view/components/region-dropdown/region-dropdown.html", this, true)
			.then(() => {
				this._elements = {
					background: this.queryById("background"),
					content: this.queryById("dropdown"),
				}
				setTimeout(() => {
					document.addEventListener(CUSTOM_EVENT_TYPES.HEADER_UPDATED,
						(event) => { this.#adjustPosition(event.detail.header) });
					window.addEventListener("resize", () => {
						if (isGalleryView()) {
							this.#adjustPosition();
						}
					});
					addClickListeners([
						[this._elements.background, this.close.bind(this, null)]
					]);
					addRemoveNoDisplay([this], true);
					addRemoveTransparent([this.queryByClassName("transparent")], false);
				}, 50);
			});
	}

	/** 
	 * Creates the region drop down list.
	 */
	handleNewCountry(newCountry) {
		// the dropdown object
		const dropDownList = this._elements.content;
		dropDownList.replaceChildren();

		// region group text and regions
		let regionGroupTemplate = document.createElement("div");
		regionGroupTemplate.classList.add("rgn-grp-text", "regular-text");

		let regionTemplate = document.createElement("button");
		regionTemplate.classList.add("rgn-txt", "regular-text");

		// Iterate each unofficial and official region, sort by visited/not visited
		newCountry.regionGroups.filter(grp => grp.regions.some(rgn => rgn.visited)).forEach(grp => {
			if (newCountry.showUnofficialRegions) {
				let regionGroupElement = regionGroupTemplate.cloneNode();
				regionGroupElement.innerText = getBilingualText(grp.englishName, grp.japaneseName);
				dropDownList.appendChild(regionGroupElement);
			}

			grp.regions.filter(rgn => rgn.visited).forEach(rgn => {
				if (rgn.visited) {
					let regionButton = regionTemplate.cloneNode();
					regionButton.innerText = getBilingualText(rgn.englishName, rgn.japaneseName);
					regionButton.id = this.#getDropdownElementId(rgn.id);
					regionButton.title = getBilingualText(`See images from ${rgn.englishName}`, `${rgn.japaneseName}の写真を表示する`);
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
			this.queryById(this.#getDropdownElementId(oldRegionId))?.classList.remove("active");
		}

		this.currentRegionId = newRegionId;

		if (this.currentRegionId) {
			this.hasOpenedForRegion = false;
			this.queryById(this.#getDropdownElementId(newRegionId))?.classList.add("active");
		}

		this.close();
	}

	/** Toggles the visibility of the dropdown. */
	toggleVisibility() {
		this.classList.toggle("no-display");
		getHeader()?.flipRegionNameArrow();
		if (!this.hasOpenedForRegion) {
			this.hasOpenedForRegion = true;
			if (this.currentRegionId) {
				this.queryById(this.#getDropdownElementId(this.currentRegionId))?.scrollIntoView({ behavior: "smooth", block: "center" });
			} else {
				this._elements.content.scrollTo({ top: 0, behavior: "instant" });
			}
		}
	}

	close() {
		addRemoveNoDisplay([this], true);
		getHeader()?.flipRegionNameArrow(false);
	}

	#getDropdownElementId(name) {
		return `${name}-dropdown`;
	}

	#adjustPosition(header) {
		this._elements.content.style.top = `${header?.getHeight()}px`;
	}
}

window.customElements.define("region-dropdown", RegionDropdown);