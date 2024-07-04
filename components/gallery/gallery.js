
var filterPopup = null;
var isFilterVisible = false;
var isSingleRegion = false;
var isNewCountry = true;
var isNewRegionDropdown = true;
var isNewRegionFilter = true;

function createTemplates() {
	// favourited tag in fullscreen
	favouritedTag = document.createElement("div");
	favouritedTag.classList.add("img-tag");
	favouritedTag.innerHTML = getBilingualText("Favourited", "お気に入り");
	let tempStar = document.createElement("span");
	tempStar.classList.add("in-btn-icon");
	tempStar.style.marginRight = "5px";
	tempStar.innerHTML = "&#xf005";
	favouritedTag.prepend(tempStar);

	// region group text and regions
	rgnGrpGroup = document.createElement("div");
	rgnGrpGroup.classList.add("rgn-grp");

	rgnGrpTitle = document.createElement("div");
	rgnGrpTitle.classList.add("rgn-grp-text");

	rgnTxtBtn = document.createElement("button");
	rgnTxtBtn.classList.add("rgn-txt", "visited-rgn-text", "highlight-btn", "txt-btn");

	rgnGrpDrop = document.createElement("div");
	rgnGrpDrop.classList.add("rgn-grp-text", "regular-text");

	rgnDrop = document.createElement("button");
	rgnDrop.classList.add("rgn-txt", "regular-text", "highlight-btn", "txt-btn");
}

function filterMiniMap() {
	// get the selected official region only
	const svgObj = document.getElementById("country-map-mini");
	const svgDoc = svgObj.contentDocument;
	const rgnList = data.region_groups.flatMap(rgnGrp => rgnGrp.regions);

	try {
		rgnList.forEach(rgn => {
			const rgnImg = svgDoc.getElementById(rgn.id + "-img");
			if (!isSingleRegion) {
				if (rgn.visited) {
					rgnImg.setAttribute("fill", appColor);
				} else {
					rgnImg.setAttribute("fill", "lightgrey");
				}
				rgnImg.setAttribute("stroke", "none");
			} else if (rgn.id != rgnsList[0].id) {
				rgnImg.setAttribute("fill", "none");
				rgnImg.setAttribute("stroke", "none");
			} else {
				rgnImg.setAttribute("fill", appColor);
				rgnImg.setAttribute("stroke", "none");
			}
		});

		// show the map
		const countryImg = svgDoc.getElementById(selectedCountry + "-img");
		if (isSingleRegion) {
			countryImg.setAttribute("viewBox", rgnsList[0].viewbox);
		}
	} catch (error) {
		console.error(error);
	} finally {
		setTimeout(() => {
			addRemoveTransparent([svgObj], false);
			hideLoader();
		}, DEFAULT_TIMEOUT / 2);
	}
}

function editMiniMap() {
	const svgObj = document.getElementById("country-map-mini");
	addRemoveTransparent([svgObj], true);
	setTimeout(() => {
		svgObj.data = "assets/img/country/" + selectedCountry + ".svg";
	}, 1000);
}

/**** Polaroids ****/
function createPolaroidImg(img, isLeft) {
	let newPolaroid = new ImagePolaroid(
		isLeft,
		img.link ?? "assets/img/" + selectedCountry + "/" + (isSingleRegion ? rgnsList[0].id : img.rgn.id) + "/" + img.file_name,
		img.is_favourite ?? false,
		img.date,
		img.offset,
		img.description_english ?? "",
		img.description_japanese ?? ""
	);

	// listeners
	newPolaroid.addEventListener("click", function () {
		selectedPic = img;
		selectedPicInd = imgList.indexOf(selectedPic);
		isNewFullscreenInstance = true;
		setFullscreenPicture();
		lastSwipeTime = new Date();
		openFullscreen();
	});

	return newPolaroid;
}

function createPolaroidBlank(rgn, isLeft) {
	let newPolaroid = new TextPolaroid(
		isLeft,
		getBilingualText(rgn.english_name, rgn.japanese_name),
		rgn.Id,
		data.official_region_name_english
	);
	newPolaroid.addEventListener("click", function () {
		selectRgn(rgn.id)
	});

	return newPolaroid;
}

function addPics() {
	let gallery = document.getElementById("gallery");
	let maxImgLoad = 10; // TODO: determine how much based on screen size
	// if mobile, load 10?
	// TODO: have a loader
	let i = 0;
	while (imageLoadIndex < imgList.length && i < maxImgLoad) {
		let img = imgList[imageLoadIndex];
		if (!isSingleRegion && (previousRegion == null || previousRegion != img.rgn.id)) {
			previousRegion = img.rgn.id;
			let blankPol = createPolaroidBlank(img.rgn, isLeft);
			isLeft = !isLeft;
			gallery.appendChild(blankPol);
		}

		let pol = createPolaroidImg(img, isLeft);
		isLeft = !isLeft;
		gallery.appendChild(pol);

		if (i == 0) {
			maxImgLoad = Math.max(Math.floor(window.innerWidth / 255) *
				Math.floor(window.innerHeight / 315) * 2, 10);
		}

		i++;
		imageLoadIndex++;
	}
}

function createGallery() {
	// clear existing
	let gallery = document.getElementById("gallery");
	gallery.replaceChildren();
	isLeft = false;
	imageLoadIndex = 0;
	previousRegion = null;

	// add pictures
	if (imgList.length > 0) {
		addPics();
	} else {
		gallery.innerHTML = getBilingualText("No pictures available (yet)", "写真は（まだ）ありません");
	}
}

/**** Filtering ****/
function showFilter() {
	isFilterVisible = true;
	filterPopup.openPopup();
}

function doesTextIncludeKeyword(text, keywordSearchTerm) {
	return text && text.toLowerCase().includes(keywordSearchTerm.toLowerCase());
}

function includeImage(img,
	isOnlyFavs,
	keywordSearchTerm,
	selectedRegions,
	selectedAreas,
	selectedTags,
	selectedCameras) {
	let region = isSingleRegion ? rgnsList[0] : rgnsList.find(x => x.id == img.rgn.id);
	let area = areaList.find(x => { return x.id == img.area; });
	let tagsWithKeyword = TAGS.filter(tag => img.tags.includes(tag.id) &&
		(doesTextIncludeKeyword(tag.english_name, keywordSearchTerm) ||
		doesTextIncludeKeyword(tag.japanese_name, keywordSearchTerm)));
	let keywordsToSearch = [
		img.description_english,
		img.description_japanese,
		img.location_english,
		img.location_japanese,
		region?.english_name,
		region?.japanese_name,
		area?.english_name,
		area?.japanese_name,
		img.camera_model
	].filter(Boolean);

	return (!isOnlyFavs || img.is_favourite) &&
		(keywordSearchTerm == "" ||
			keywordsToSearch.some(keyword => doesTextIncludeKeyword(keyword, keywordSearchTerm)) ||
			tagsWithKeyword.length > 0) &&
		(selectedRegions.length == 0 || selectedRegions.includes(region.id)) &&
		(selectedAreas.length == 0 || selectedAreas.includes(area.id)) &&
		(selectedTags.length == 0 || selectedTags.filter(value => img.tags.includes(value)).length > 0) &&
		(selectedCameras.length == 0 || selectedCameras.includes(img.camera_model));
}

function filterImages(isOnlyFavs,
	keyword,
	selectedRegions,
	selectedAreas,
	selectedTags,
	selectedCameras) {
	isLeft = false;
	visibleImgs = [];

	if (document.getElementById("none")) {
		document.getElementById("none").remove();
	}

	let allPolaroids = Array.from(document.querySelectorAll("img-polaroid, txt-polaroid"));

	let lastShownRegion = null;
	let previousRegion = null;
	let previousRegionCardInd = null;
	let regionCount = 0;

	let polInd = 0;
	let imgInd = 0;
	allPolaroids.forEach(pol => {
		if (pol.isBlank) { // if is a divider
			let currentRegion = pol.regionId;

			// If it is a new region
			if (currentRegion != previousRegion) {
				addRemoveNoDisplay([pol], false);
				if (regionCount == 0 && previousRegionCardInd != null) {
					// If the previous region has nothing, remove the previous card
					addRemoveNoDisplay([allPolaroids[previousRegionCardInd]], true);

					// If the one before that has something and is the same, remove the current card. 
					// Last shown card remains the same.
					if (lastShownRegion == currentRegion) addRemoveNoDisplay([pol], true);

				} else if (regionCount > 0 && previousRegionCardInd != null) {
					// If the previous region has something, that is the last shown card
					lastShownRegion = previousRegion;
					regionCount = 0;
				} else {
					// If the start of the gallery, ignore
					regionCount = 0;
				}

				// Set the current region and its position
				previousRegion = currentRegion;
				previousRegionCardInd = polInd;
			} else {
				addRemoveNoDisplay([pol], true);
			}
		} else if (includeImage(imgList[imgInd], isOnlyFavs,
			keyword,
			selectedRegions,
			selectedAreas,
			selectedTags,
			selectedCameras)) {
			addRemoveNoDisplay([pol], false);
			visibleImgs.push(imgInd);
			regionCount++;
			imgInd++;
		} else {
			addRemoveNoDisplay([pol], true);
			imgInd++;
		}

		polInd++;
	});

	if (previousRegionCardInd && regionCount == 0) addRemoveNoDisplay([allPolaroids[previousRegionCardInd]], true);

	allPolaroids.filter(pol => !pol.classList.contains("no-display"))
		.forEach(pol => {
			pol.setNewAngle(isLeft);
			// pol.setAttribute("isAngledLeft", isLeft);
			isLeft = !isLeft;
		});

	if (visibleImgs.length == 0) {
		let temp = document.createElement("div");
		temp.id = "none";
		temp.style.margin = "-125px";
		temp.innerHTML = getBilingualText("No pictures available (yet)", "写真は(まだ)ありません");
		document.getElementById("gallery").appendChild(temp);
	}
}



/**** Official region selector dropdown ****/
function toggleRgnDropdown() {
	document.getElementById("rgn-drop-down-container").classList.toggle("no-display");
	flipArrow(document.getElementById("rgn-name-arrow"));
	if (isNewRegionDropdown && isSingleRegion) {
		isNewRegionDropdown = false;
		document.getElementById(rgnsList[0].id + "-dropdown").scrollIntoView({ behavior: "smooth", block: "center" });
	}
}

function closeRgnDropdown() {
	addRemoveNoDisplay("rgn-drop-down-container", true);
	flipArrow("rgn-name-arrow", false);
}

function showRgnDropdown() {
	addRemoveNoDisplay("rgn-drop-down-container", false);
	flipArrow("rgn-name-arrow", true);
}