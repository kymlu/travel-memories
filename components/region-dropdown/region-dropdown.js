import { getCurrentCountry, onSelectNewRegion } from "../../js/globals.js";
import { addClickListeners, getBilingualText } from "../../js/utils.js";

/** The Region Dropdown. */
export default class RegionDropdown extends HTMLElement {
	constructor() {
        super();
		this.isVisible = false;
		this.hasOpenedForRegion = false;
		this.currentRegionId = null;
		this.elements = {
			background: document.getElementById("rgn-drop-down-bg"),
			content: document.getElementById("rgn-drop-down"),
		}
		this.initialize();
	}

	initialize(){
		addClickListeners([
			[this.elements.background, this.close]
		]);
	}

	/** 
	 * Creates the region drop down list.
	 */
	handleNewCountry() {
		// the dropdown object
		const dropDownList = this.elements.content;
		dropDownList.replaceChildren();

		// region group text and regions
		let regionGroupTemplate = document.createElement("div");
		regionGroupTemplate.classList.add("rgn-grp-text", "regular-text");

		let regionTemplate = document.createElement("button");
		regionTemplate.classList.add("rgn-txt", "regular-text", "highlight-btn", "txt-btn");

		// Iterate each unofficial and official region, sort by visited/not visited
		const currentCountry = getCurrentCountry();
		currentCountry.regionGroups.filter(grp => grp.regions.filter(rgn => rgn.visited).length > 0).forEach(grp => {
			let regionGroupElement = regionGroupTemplate.cloneNode();

			if (currentCountry.showUnofficialRegions) {
				regionGroupElement.innerHTML = getBilingualText(grp.englishName, grp.japaneseName);
				regionGroupElement.id = `${grp.englishName}-dropdown`;
				dropDownList.appendChild(regionGroupElement);
			}

			grp.regions.filter(rgn => rgn.visited).forEach(rgn => {
				if (rgn.visited) {
					let regionButton = regionTemplate.cloneNode();
					regionButton.innerHTML = getBilingualText(rgn.englishName, rgn.japaneseName);
					regionButton.id = `${rgn.id}-dropdown`;
					regionButton.title = getBilingualText(`See images from ${rgn.englishName}`, `${rgn.japaneseName}の写真を表示する`);
					regionButton.classList.add("visited-rgn-text");
					regionButton.addEventListener("click", function () {
						onSelectNewRegion(rgn.id);
					}, false);
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
			document.getElementById(oldRegionId + "-dropdown")?.classList.remove("active");
		}

		if (newRegionId) {
			this.hasOpenedForRegion = true;
			document.getElementById(newRegionId + "-dropdown")?.classList.add("active");
		}
	}

	/** Toggles the visibility of the dropdown. */
	toggleVisibility() {
		this.classList.toggle("no-display"); // TODO: this used to be container, double check how to reference
		flipArrow(document.getElementById("rgn-name-arrow"));
		if (this.hasOpenedForRegion) {
			this.hasOpenedForRegion = false;
			if(this.currentRegionId){
				document.getElementById(`${this.currentRegionId}-dropdown`).scrollIntoView({ behavior: "smooth", block: "center" });
			} else {
				this.elements.content.scrollTo({top: 0, behavior: "instant"});
			}
		}
	}

	close() {
		addRemoveNoDisplay(this, true);
		flipArrow(document.getElementById("rgn-name-arrow"), false); // TODO: AH
	}
}
window.customElements.define("region-dropdown", RegionDropdown);
