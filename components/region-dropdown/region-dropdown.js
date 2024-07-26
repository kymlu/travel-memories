import { getCurrentCountry } from "../../js/globals";
import { getBilingualText } from "../../js/utils";

export default class RegionDropDown extends HTMLElement {
	constructor() {
		this.isVisible = false;
		this.isNewRegionDropdown = false;
		this.currentRegionId = null;
	}

	/** 
	 * Creates the region drop down list.
	 */
	handleNewCountry() {
		// the dropdown object
		const dropDownList = document.getElementById("rgn-drop-down");
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
						selectRegion(rgn.id);
					}, false);
					dropDownList.appendChild(regionButton);
				}
			});
		});
	}

	changeSelectedRegion(oldRegionId, newRegionId) {
		if (oldRegionId) {
			document.getElementById(currentRegion.id + "-dropdown").classList.remove("active");
		}
		
		if (newRegionId) {
			document.getElementById(currentRegion.id + "-dropdown").classList.add("active");
		}
	}

	toggleRegionDropdown() {
		document.getElementById("rgn-drop-down-container").classList.toggle("no-display");
		flipArrow(document.getElementById("rgn-name-arrow"));
		if (this.isNewRegionDropdown && this.currentRegionId) {
			this.isNewRegionDropdown = false;
			document.getElementById(`${this.currentRegionId}-dropdown`).scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}

	closeRegionDropdown() {
		addRemoveNoDisplay("rgn-drop-down-container", true);
		flipArrow(document.getElementById("rgn-name-arrow"), false);
	}
}