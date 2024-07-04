/*
	Project Name: Travel Memories
	Author: Katie Lu
	Note: currently not implementing components in this project (hence 
			the length of the file) but I plan to once I have the time.
*/
/**** Variables ****/
var root = document.querySelector(':root');

// Loading
var isLoading = true;
var now = null;

// Data
var allData = null;
var data = null;
var countryTitle = null;
var selectedCountry = null;
var imgList = null;
var rgnsList = null;
var areaList = null;
var tagList = null;
var cameraList = null;

// Booleans
var throttleRegionInfo = false;

var infoPopup = null;
var isPopupVisible = false;
var isToTopVisible = false;
var isGalleryVisible = false;
var isRegionInfoVisible = false;
var filterPopup = null;
var isFilterVisible = false;
var isSingleRegion = false;
var isNewCountry = true;
var isNewRegionDropdown = true;
var isNewRegionFilter = true;

var isLeft = true;
var imageLoadIndex = 0;
var previousRegion = null;

// Fullscreen
var isFullscreen = false;
var isNewFullscreenInstance = true;
var selectedPic = null;
var selectedPicInd = 0;
var isPicInfoVisible = true;
var searchTermEng = "";
var searchTermJp = "";

// Gestures
var initialX = null;
var initialY = null;
var initialYHandle = null;
var isHandleGrabbed = false;
var grabbedHandleId = null;
var lastSwipeTime = null;

// Filters
var visibleImgs = [];


var seeFromRgnTitle = null;

var appColor;

/**** General ****/
function isPortraitMode() {
	return window.innerHeight > window.innerWidth;
}

function sortImgs(a, b) {
	return new Date(a.date) - new Date(b.date);
}

function sortByEnglishName(a, b) {
	let a1 = a.english_name.toLowerCase();
	let b1 = b.english_name.toLowerCase();

	if (a1 < b1) {
		return -1;
	}
	if (a1 > b1) {
		return 1;
	}
	return 0;
}

function addRemoveClass(elements, className, isAdd) {
	if (elements) {
		if (typeof (elements) == 'string') {
			let element = document.getElementById(elements);
			if (element.classList) {
				if (isAdd) {
					element.classList.add(className);
				} else {
					element.classList.remove(className);
				}
			}
		} else {
			if (elements.length > 0) {
				if (typeof (elements[0]) == 'string') {
					if (isAdd) {
						elements.forEach(element => document.getElementById(element).classList.add(className));
					} else {
						elements.forEach(element => document.getElementById(element).classList.remove(className));
					}
				} else {
					if (isAdd) {
						elements.forEach(element => {
							if (element.classList) {
								element.classList.add(className);
							}
						});
					} else {
						elements.forEach(element => {
							if (element.classList) {
								element.classList.remove(className);
							}
						});
					}
				}
			}
		}
	}
}

function addRemoveTransparent(elements, isAdd) {
	addRemoveClass(elements, "transparent", isAdd);
}

function addRemoveNoDisplay(elements, isAdd) {
	addRemoveClass(elements, "no-display", isAdd);
}

function flipArrow(arrow, isUp) {
	if (isUp == undefined) {
		arrow.classList.toggle("arrow-up");
		arrow.classList.toggle("arrow-down");
	} else {
		addRemoveClass(arrow, "arrow-up", isUp);
		addRemoveClass(arrow, "arrow-down", !isUp);
	}
}

function scrollToTop(isSmooth) {
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: isSmooth ? 'smooth' : "instant"
	});
}

// Text
function getBilingualText(english, japanese) {
	return english + (japanese ? (" – " + japanese) : "");
}

function getPictureDate(date, picOffset) {
	// picOffset is in hours
	const localOffset = now.getTimezoneOffset();
	return new Date(date.getTime() - ((picOffset * -60) - localOffset) * 60000);
}

function getEnglishDate(date, isFullDate, picOffset) {
	let hours = date.getHours();
	return (isFullDate ? DAY_NAMES_EN[date.getDay()] + ", " : "") +
		MONTH_NAMES[date.getMonth()] + " " +
		date.getDate() + ", " +
		date.getFullYear() +
		(isFullDate ?
			" " + (hours > 12 ? hours - 12 : hours).toString() + ":" +
			date.getMinutes().toString().padStart(2, "0") + ":" +
			date.getSeconds().toString().padStart(2, "0") +
			(hours >= 12 ? " PM" : " AM") +
			(picOffset > 0 ? " +" : " -") +
			Math.floor(picOffset) + ":" +
			String((picOffset - Math.floor(picOffset)) * 60).padStart(2, "0")
			: "");
}

function getJapaneseDate(date, isFullDate, picOffset) {
	let hours = date.getHours();
	return date.getFullYear() + "年" +
		(date.getMonth() + 1) + "月" +
		date.getDate() + "日" +
		(isFullDate ?
			"（" + DAY_NAMES_JP[date.getDay()] + "）" +
			(hours >= 12 ? "午後" : "午前") +
			(hours > 12 ? hours - 12 : hours).toString() + ":" +
			date.getMinutes().toString().padStart(2, "0") + ":" +
			date.getSeconds().toString().padStart(2, "0") +
			(picOffset >= 0 ? "+" : "") +
			Math.floor(picOffset) + ":" +
			String((picOffset - Math.floor(picOffset)) * 60).padStart(2, "0")
			: "");
}

/**** Floating Button ****/
function scrollDown() {
	document.getElementById("main-title").scrollIntoView({
		behavior: 'smooth',
		block: "start"
	});
}

function showHideFloatingBtn() {
	const totop = getBilingualText("Go to top", "トップに移動する");
	const down = getBilingualText("Scroll down", "下に移動する");
	let btn = document.getElementById("to-top-btn");
	if (document.body.scrollTop > SCROLL_THRESHOLD) {
		if (isGalleryVisible && !isToTopVisible) {
			flipArrow([btn], true);
			addRemoveNoDisplay([btn], false);
			addRemoveTransparent([btn], false);
			btn.title = totop;
			isToTopVisible = true;
		} else if (!isGalleryVisible) {
			flipArrow([btn], true);
			btn.title = totop;
		}
	} else if (document.body.scrollTop <= SCROLL_THRESHOLD) {
		if (isGalleryVisible && isToTopVisible) {
			flipArrow([btn], true);
			addRemoveTransparent([btn], true);
			setTimeout(() => { addRemoveNoDisplay([btn], true); }, DEFAULT_TIMEOUT)
			isToTopVisible = false;
		} else if (!isGalleryVisible) {
			let pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight,
				document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

			if (window.innerHeight + SCROLL_THRESHOLD < pageHeight) {
				addRemoveNoDisplay([btn], false);
				flipArrow([btn], false);
				btn.title = down;
			} else {
				addRemoveNoDisplay([btn], true);
			}
		}
	}
}

/**** Official Region List ****/
function createRgnDD() {
	const dropDownRgnList = document.getElementById("rgn-drop-down");
	dropDownRgnList.replaceChildren();

	if (data.show_unofficial_regions) {
		rgnGrpGroup.classList.remove("none");
	} else {
		rgnGrpGroup.classList.add("none");
	}

	// Iterate each unofficial and official region, sort by visited/not visited
	data.region_groups.filter(grp => grp.regions.filter(rgn => rgn.visited).length > 0).forEach(rgnGrp => {
		const newRgnGrp = rgnGrpGroup.cloneNode();
		let ddURegion = rgnGrpDrop.cloneNode();

		if (data.show_unofficial_regions) {
			const newRgnTitle = rgnGrpTitle.cloneNode();
			newRgnTitle.innerHTML = getBilingualText(rgnGrp.english_name, rgnGrp.japanese_name);
			newRgnGrp.appendChild(newRgnTitle);
			ddURegion.innerHTML = getBilingualText(rgnGrp.english_name, rgnGrp.japanese_name);
			ddURegion.id = rgnGrp.english_name + "-dropdown";
			dropDownRgnList.appendChild(ddURegion);
		}

		rgnGrp.regions.filter(rgn => rgn.visited).forEach(rgn => {
			if (rgn.visited) {
				let ddRgn = rgnDrop.cloneNode();
				ddRgn.innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
				ddRgn.id = rgn.id + "-dropdown";
				ddRgn.title = seeFromRgnTitle;
				ddRgn.classList.add("visited-rgn-text");
				ddRgn.addEventListener("click", function () {
					selectRgn(rgn.id);
				}, false);
				dropDownRgnList.appendChild(ddRgn);
			}
		});
	});
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

/**** Map ****/
function colourMap() {
	if (document.getElementById("country-map").data == "") return;

	const svgObj = document.getElementById("country-map");
	const svgDoc = svgObj.contentDocument;
	const rgnList = data.region_groups.flatMap(rgnGrp => rgnGrp.regions);

	rgnList.forEach(rgn => {
		const rgnImg = svgDoc.getElementById(rgn.id + "-img");
		if (rgn.visited) {
			// CSS won't work on document objects
			rgnImg.title = getBilingualText("See images from this" + data.official_region_name, "この地域の写真を表示する");
			rgnImg.setAttribute("fill", appColor);
			rgnImg.setAttribute("stroke", "none");
			rgnImg.setAttribute("cursor", "pointer");
			rgnImg.setAttribute("transition", "opacity 0.3 ease-in-out");
			rgnImg.addEventListener("click", function () {
				selectRgn(rgn.id);
				document.getElementById("main-title").innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
			});

			rgnImg.addEventListener("mouseover", () => {
				rgnImg.setAttribute("opacity", "50%");
				hoveredRegion = rgn.english_name;
				document.getElementById("main-title").innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
			});

			rgnImg.addEventListener("mouseout", () => {
				rgnImg.setAttribute("opacity", "100%");
				hoveredRegion = "";
				document.getElementById("main-title").innerHTML = countryTitle;
			});
		} else {
			rgnImg.setAttribute("fill", "lightgrey");
		}
	});
}

function createMap() {
	const svgObj = document.getElementById("country-map");
	svgObj.data = "img/country/" + selectedCountry + ".svg";
}

/**** Photo Gallery  ****/
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
		svgObj.data = "img/country/" + selectedCountry + ".svg";
	}, 1000);
}

/**** Polaroids ****/
function createPolaroidImg(img, isLeft) {
	let newPolaroid = new ImagePolaroid(
		isLeft,
		img.link ?? "img/" + selectedCountry + "/" + (isSingleRegion ? rgnsList[0].id : img.rgn.id) + "/" + img.file_name,
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

/**** Googling picture info ****/
function search(searchTerm) {
	window.open("https://www.google.com/search?q=" + searchTerm);
}

function searchEnglish() {
	search(searchTermEng);
}

function searchJapanese() {
	search(searchTermJp)
}

/**** Fullscreen Picture ****/
function changeFullscreenPicture(isForward) {
	if (isForward) {
		if (visibleImgs.length > 0) {
			let ind = visibleImgs.indexOf(selectedPicInd);
			if (ind == visibleImgs.length - 1) {
				selectedPicInd = visibleImgs[0];
			} else {
				selectedPicInd = visibleImgs[ind + 1];
			}
		} else {
			if (selectedPicInd == (imgList.length - 1)) {
				selectedPicInd = 0;
			} else {
				selectedPicInd++;
			}
		}
	} else {
		if (visibleImgs.length > 0) {
			let ind = visibleImgs.indexOf(selectedPicInd);
			if (ind == 0) {
				selectedPicInd = visibleImgs[visibleImgs.length - 1];
			} else {
				selectedPicInd = visibleImgs[ind - 1];
			}
		} else {
			if (selectedPicInd == 0) {
				selectedPicInd = imgList.length - 1;
			} else {
				selectedPicInd--;
			}
		}
	}
	selectedPic = imgList[selectedPicInd];
	setFullscreenPicture(isForward);
}

function setFullscreenInfo() {
	if (selectedPic.date) {
		let date = getPictureDate(new Date(selectedPic.date), selectedPic.offset);
		document.getElementById("fullscreen-eng-date").innerHTML = getEnglishDate(date, true, selectedPic.offset);
		document.getElementById("fullscreen-jp-date").innerHTML = getJapaneseDate(date, true, selectedPic.offset);
	} else {
		document.getElementById("fullscreen-eng-date").innerHTML = "Unknown date";
		document.getElementById("fullscreen-jp-date").innerHTML = "不明な日付";
	}
	let area = areaList.find(function (area) { return area.id == selectedPic.area });
	searchTermEng = (selectedPic.location_english ?
		(selectedPic.location_english + ", ") :
		selectedCountry == JAPAN && selectedPic.location_japanese ? (selectedPic.location_japanese + ", ") :
			selectedCountry == TAIWAN && selectedPic.location_chinese ? (selectedPic.location_chinese + ", ") :
				"") + (area.english_name ?? "");
	document.getElementById("fullscreen-eng-city").innerHTML = searchTermEng;
	searchTermJp = (area.japanese_name ?? area.english_name ?? "") + (selectedPic.location_japanese ? ("　" + selectedPic.location_japanese) :
		(selectedCountry == TAIWAN && selectedPic.location_chinese) ? ("　" + selectedPic.location_chinese) :
			selectedPic.location_english ? ("　" + selectedPic.location_english) : "");
	document.getElementById("fullscreen-jp-city").innerHTML = searchTermJp;


	if (selectedPic.description_english) {
		addRemoveNoDisplay("fullscreen-eng-caption", false);
		document.getElementById("fullscreen-eng-caption").innerHTML = selectedPic.description_english;
	} else {
		addRemoveNoDisplay("fullscreen-eng-caption", true);
	}
	if (selectedPic.description_japanese) {
		addRemoveNoDisplay("fullscreen-jp-caption", false);
		document.getElementById("fullscreen-jp-caption").innerHTML = selectedPic.description_japanese;
	} else {
		addRemoveNoDisplay("fullscreen-jp-caption", true);
	}

	if (selectedPic.camera_model) {
		addRemoveNoDisplay("camera-info", false);
		document.getElementById("camera-info").innerHTML = selectedPic.camera_model;
	} else {
		addRemoveNoDisplay("camera-info", true);
	}

	if (selectedPic.lens) {
		addRemoveNoDisplay("lens-info", false);
		document.getElementById("lens-info").innerHTML = selectedPic.lens;
	} else {
		addRemoveNoDisplay("lens-info", true);
	}

	document.getElementById("technical-info").replaceChildren();
	let tempElement = null;
	if (selectedPic.f_stop) {
		tempElement = document.createElement("div");
		tempElement.innerHTML = "\u0192/" + selectedPic.f_stop;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if (selectedPic.shutter_speed) {
		tempElement = document.createElement("div");
		tempElement.innerHTML = selectedPic.shutter_speed;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if (selectedPic.iso) {
		tempElement = document.createElement("div");
		tempElement.innerHTML = "iso " + selectedPic.iso;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if (tempElement == null) {
		addRemoveNoDisplay("technical-info", true);
	} else {
		addRemoveNoDisplay("technical-info", false);
	}

	selectedPic.tags.map(x => { return TAGS.find(function (t) { return t.id == x }) })
		.sort(sortByEnglishName)
		.forEach(tag => {
			tempElement = document.createElement("div");
			tempElement.classList.add("img-tag");
			tempElement.innerHTML = getBilingualText(tag.english_name, tag.japanese_name);
			document.getElementById("img-tags").appendChild(tempElement);
		});

	if (selectedPic.is_favourite) {
		document.getElementById("img-tags").appendChild(favouritedTag);
	}
}

function setFullscreenPicture(isForward) {
	document.getElementById("img-tags").replaceChildren();

	let src = selectedPic.link ?? "img/" + selectedCountry + "/" + (isSingleRegion ? rgnsList[0].id : selectedPic.rgn.id) + "/" + selectedPic.file_name;

	if (isNewFullscreenInstance || (new Date() - lastSwipeTime) < 300) {
		document.getElementById("fullscreen-pic").src = src;
		isNewFullscreenInstance = false;
	} else {
		let nextPic = document.getElementById("fullscreen-pic-next");
		let currentPic = document.getElementById("fullscreen-pic");

		addRemoveNoDisplay([nextPic], true);
		nextPic.src = src;
		nextPic.classList.add(isForward ? "fullscreen-pic-right" : "fullscreen-pic-left");

		setTimeout(() => {
			addRemoveNoDisplay([nextPic], false);
			addRemoveTransparent([nextPic], false);
			addRemoveTransparent([currentPic], true);
			nextPic.classList.remove(isForward ? "fullscreen-pic-right" : "fullscreen-pic-left");
			currentPic.classList.add(isForward ? "fullscreen-pic-left" : "fullscreen-pic-right");

			setTimeout(() => {
				addRemoveNoDisplay([currentPic], true);
				addRemoveTransparent([currentPic], false);
				currentPic.src = src;
				currentPic.classList.remove(isForward ? "fullscreen-pic-left" : "fullscreen-pic-right");
				setTimeout(() => {
					addRemoveNoDisplay([currentPic], false);
					addRemoveNoDisplay([nextPic], true);
					addRemoveTransparent([nextPic], true);
					nextPic.classList.remove("fullscreen-pic-in");
				}, 100);
			}, 100);
		}, 20);
	}
	lastSwipeTime = new Date();
	setFullscreenInfo();
}

function openFullscreen() {
	if (isPortraitMode()) {
		isPicInfoVisible = false;
		addRemoveTransparent("pic-info", true);
		hidePicInfo();
		setTimeout(() => {
			addRemoveTransparent("pic-info", false);
		}, DEFAULT_TIMEOUT);
	}
	isFullscreen = true;
	document.body.style.overflowY = "hidden";
	document.getElementById("fullscreen").style.visibility = "visible";
	addRemoveTransparent(["fullscreen", "fullscreen-bg"], false);
}

function closeFullscreen(forceClose) {
	isFullscreen = false;
	document.body.style.overflowY = "auto";
	if (forceClose) {
		document.getElementById("fullscreen").style.visibility = "hidden";
		addRemoveTransparent(["fullscreen", "fullscreen-bg"], true);
	} else {
		addRemoveTransparent(["fullscreen", "fullscreen-bg"], true);
		setTimeout(() => {
			document.getElementById("fullscreen").style.visibility = "hidden";
		}, DEFAULT_TIMEOUT);
	}
}

/**** Fullscreen Picture Info ****/
function showPicInfo() {
	isPicInfoVisible = true;
	addRemoveNoDisplay("pic-info", false);
	let element = document.getElementById("pic-info-drawer");
	//TODO: transition on first portrait mode open
	addRemoveNoDisplay([element], false);
	setTimeout(() => {
		element.style.bottom = "0";
		element.style.marginRight = "0px";
	}, 20);
}

function hidePicInfo() {
	isPicInfoVisible = false;
	let element = document.getElementById("pic-info-drawer");
	element.style.bottom = "-" + element.getBoundingClientRect().height + "px";
	element.style.marginRight = "-" + element.getBoundingClientRect().width + "px";
	setTimeout(() => {
		addRemoveNoDisplay([element], true);
		addRemoveNoDisplay("pic-info", true);
	}, DEFAULT_TIMEOUT);
}

function changePicInfoVisibility(isVisible) {
	if (isVisible == undefined) {
		isVisible = !isPicInfoVisible;
	}

	if (isVisible) {
		showPicInfo();
	} else {
		hidePicInfo();
	}
}

/**** Gestures ****/
// Source: https://stackoverflow.com/questions/53192433/how-to-detect-swipe-in-javascript
function startHandleDrag(e, handleId) {
	if (isPortraitMode()) {
		isHandleGrabbed = true;
		grabbedHandleId = handleId
		initialYHandle = e.touches[0].clientY;
	}
}

function endHandleDrag(e) {
	if (isPortraitMode()) {
		if (isHandleGrabbed && grabbedHandleId) {
			isHandleGrabbed = false;
			let currentY = e.changedTouches[0].clientY;
			if (currentY > initialYHandle) {
				if (grabbedHandleId == "pic-info-handle") {
					hidePicInfo();
				} else {
					showRegionInfo(true);
				}
			} else if (currentY < initialYHandle) {
				if (grabbedHandleId == "rgn-info-handle") {
					hideRegionInfo(true);
				}
			}
			initialYHandle = null;
			grabbedHandleId = null;
		}
	}
}

function startFullscreenSwipe(e) {
	if (isPortraitMode()) {
		if (e.touches.length == 1) {
			initialX = e.touches[0].clientX;
			initialY = e.touches[0].clientY;
		}
	}
}

function moveFullscreenSwipe(e) {
	if (initialX === null) {
		return;
	}

	if (initialY === null) {
		return;
	}

	if (!isPortraitMode()) {
		return;
	}

	if (e.touches.length == 1) {
		let currentX = e.touches[0].clientX;
		let currentY = e.touches[0].clientY;

		let diffX = initialX - currentX;
		let diffY = initialY - currentY;

		if (Math.abs(diffX) > Math.abs(diffY)) {
			if (diffX > 0) {
				changeFullscreenPicture(true);
			} else {
				changeFullscreenPicture(false);
			}
		} else {
			if (diffY > 0) {
				if (!isPicInfoVisible) {
					showPicInfo();
				}
				// removed because will not work with Apple
			} else {
				if (isPicInfoVisible) {
					hidePicInfo();
				}
			}
		}

		initialX = null;
		initialY = null;

		e.preventDefault();
	}
}

/**** Site Info Popup ****/
function openInfoPopup() {
	isPopupVisible = true;
	infoPopup.openPopup();
}

function closeInfoPopup() {
	document.querySelector("info-popup").closePopup(true);
}

/**** Official Region Info ****/
function showRegionInfo(isForced) {
	isRegionInfoVisible = true;
	addRemoveTransparent("rgn-info-bg", false);
	document.getElementById("rgn-info-bg").style.visibility = "visible";
	if (isForced) {
		if (document.body.scrollTop < document.getElementById("rgn-info").getBoundingClientRect().height) {
			scrollToTop(true);
		} else {
			document.getElementById("rgn-info").style.position = "sticky";
			document.getElementById("rgn-info").style.top = document.getElementById("top-bar").getBoundingClientRect().height;
		}
	}
}

function hideRegionInfo(isForced) {
	isRegionInfoVisible = false;
	if (isForced) {
		let rgnInfoOffset = document.getElementById("rgn-info").getBoundingClientRect().height;
		if (document.body.scrollTop <= rgnInfoOffset) {
			window.scrollTo({
				top: rgnInfoOffset,
				left: 0,
				behavior: 'smooth'
			});
		}
	}
	addRemoveTransparent("rgn-info-bg", true);
	setTimeout(() => {
		document.getElementById("rgn-info-bg").style.visibility = "hidden";
		document.getElementById("rgn-info").style.position = "relative";
		document.getElementById("rgn-info").style.top = "0";
	}, DEFAULT_TIMEOUT);
}

function changeRegionInfoVisibility(isVisible, isForced) {
	if (isRegionInfoVisible == isVisible) {
		return;
	}

	if (isVisible == undefined) {
		isVisible = !isRegionInfoVisible;
	}

	if (isVisible) {
		showRegionInfo(isForced);
	} else {
		hideRegionInfo(isForced);
	}
}

function scrollRegionInfo() {
	if (throttleRegionInfo || !isGalleryVisible) return;
	throttleRegionInfo = true;
	setTimeout(() => {
		let rgnInfoOffset = document.getElementById("rgn-info").getBoundingClientRect().height / 2;
		if (isRegionInfoVisible && document.body.scrollTop > rgnInfoOffset) {
			isRegionInfoVisible = false;
			hideRegionInfo(false);
		} else if (!isRegionInfoVisible && document.body.scrollTop < rgnInfoOffset) {
			isRegionInfoVisible = true;
			showRegionInfo(false);
		}
		throttleRegionInfo = false;
	}, 250);
}

/**** Show and hide pages ****/
function openMapPage() {
	hideLoader();
	scrollToTop(false);
	addRemoveTransparent("map-page", false);
	addRemoveNoDisplay("to-top-btn", false);
	showHideFloatingBtn();
}

function changeGalleryVisibility(isVisible) {
	closeRgnDropdown();
	scrollToTop(false);
	if (isVisible == undefined) {
		isGalleryVisible = !isGalleryVisible;
	} else {
		isGalleryVisible = isVisible;
	}

	if (isGalleryVisible) {
		document.getElementById("btn-grp-left").classList.add("btn-grp-left");
		document.getElementById("btn-grp-right").classList.add("btn-grp-right");
		document.getElementById("top-bar").style.position = "sticky";
		document.getElementById("top-bar").style.backgroundColor = "white";
		addRemoveNoDisplay(["map-page", "to-top-btn", "globe-btn"], true);
		addRemoveNoDisplay(["gallery", "map-btn", "info-btn", "rgn-title-btn", "rgn-info", "rgn-info-drawer"], false);
		if (imgList.length > 0) {
			addRemoveNoDisplay("filter-btn", false);
		}
		document.getElementById("rgn-info-bg").style.visibility = "visible";
		addRemoveTransparent("to-top-btn", true);
		if (isPortraitMode()) {
			document.getElementById("dates-title").scrollIntoView({ block: isPortraitMode() ? "end" : "start" });
		}
	} else {
		document.getElementById("btn-grp-left").classList.remove("btn-grp-left");
		document.getElementById("btn-grp-right").classList.remove("btn-grp-right");
		document.getElementById("top-bar").style.position = "fixed";
		document.getElementById("top-bar").style.backgroundColor = "transparent";
		addRemoveNoDisplay(["map-page", "to-top-btn", "globe-btn"], false);
		addRemoveNoDisplay(["gallery", "filter-btn", "map-btn", "info-btn", "rgn-title-btn", "rgn-info", "rgn-info-drawer"], true);
		document.getElementById("rgn-info-bg").style.visibility = "hidden";
		addRemoveTransparent("to-top-btn", false);
	}
	addRemoveTransparent("rgn-info-bg", false);

	isRegionInfoVisible = isGalleryVisible;
	if (!isGalleryVisible) {
		showLoader();
		setTimeout(() => {
			createMap();
			setTimeout(() => {
				openMapPage();
			}, 200);
		}, 50);
	}
}

function changeMainColor(newColor) {
	root.style.setProperty('--main-color', getComputedStyle(root).getPropertyValue(newColor));
	let temp = getComputedStyle(root).getPropertyValue("--main-color").split(", ");
	appColor = "rgb(" + temp[0] + ", " + temp[1] + ", " + temp[2] + ")";
}

function selectRgn(rgnId, isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({ rgn: rgnId }, null, null);
	}

	showLoader();
	if (!isNewCountry && isSingleRegion) {
		document.getElementById(rgnsList[0].id + "-dropdown").classList.remove("active");
	}

	isNewCountry = false;
	isNewRegionDropdown = true;
	isNewRegionFilter = true;

	isSingleRegion = rgnId != undefined && rgnId != null;

	if (isSingleRegion) {
		let newRegion = data.region_groups.flatMap(x => x.regions).filter(rgn => rgn.id == rgnId)[0];
		document.getElementById(newRegion.id + "-dropdown").classList.add("active");
		imgList = newRegion.image_list;
		rgnsList = [newRegion];
		areaList = newRegion.areas;
		addRemoveNoDisplay("rgn-info-dates", false);
		document.getElementById("areas-title").innerHTML = getBilingualText("Areas", "所");
		document.getElementById("rgn-dates").innerHTML = getBilingualText(newRegion.dates_english, newRegion.dates_japanese);
		document.getElementById("rgn-desc-eng").innerHTML = newRegion.description_english;
		document.getElementById("rgn-desc-jp").innerHTML = newRegion.description_japanese;
		document.getElementById("rgn-name").innerHTML = getBilingualText(newRegion.english_name, newRegion.japanese_name);
		document.getElementById("description-title").innerHTML = getBilingualText("About", data.official_region_name_japanese + "について");
		document.getElementById("rgn-areas").innerHTML = areaList.map(area => {
			return getBilingualText(area.english_name, area.japanese_name);
		}).sort().join(" | ");
	} else {
		let visitedRgns = data.region_groups.flatMap(grp => grp.regions.filter(rgn => rgn.visited));
		imgList = visitedRgns.flatMap(rgn => {
			return rgn.image_list.map(img => ({
				...img, rgn: {
					"id": rgn.id,
					"english_name": rgn.english_name,
					"japanese_name": rgn.japanese_name
				}
			}));
		}).sort(sortImgs);

		addRemoveNoDisplay("rgn-info-dates", true);
		document.getElementById("areas-title").innerHTML = getBilingualText(data.official_region_name_english + "s", data.official_region_name_japanese);
		document.getElementById("rgn-desc-eng").innerHTML = data.description_english;
		document.getElementById("rgn-desc-jp").innerHTML = data.description_japanese;
		document.getElementById("rgn-name").innerHTML = getBilingualText(data.english_name, data.japanese_name);
		document.getElementById("description-title").innerHTML = getBilingualText("About", "国について");

		rgnsList = visitedRgns.map(rgn => {
			return {
				"id": rgn.id,
				"english_name": rgn.english_name,
				"japanese_name": rgn.japanese_name
			}
		});

		//areaList = data.region_groups.flatMap(grp => grp.regions.filter(rgn => rgn.visited)).map(rgn => {return {"id": rgn.id, "areas": rgn.areas}});
		areaList = visitedRgns.flatMap(rgn => rgn.areas);
		document.getElementById("rgn-areas").innerHTML = rgnsList.map(area => {
			return getBilingualText(area.english_name, area.japanese_name);
		}).sort().join(" | ");
	}

	let tempTags = new Set(imgList.flatMap(x => { return x.tags }));
	tagList = TAGS.filter(x => tempTags.has(x.id));
	cameraList = [...new Set(imgList.map(x => x.camera_model))];

	filterPopup.refreshFilters(
		isSingleRegion,
		rgnsList,
		areaList,
		tagList,
		cameraList,
		data.official_region_name_english,
		data.official_region_name_japanese
	);

	editMiniMap();

	flipArrow("rgn-name-arrow", false);
	visibleImgs = [];
	createGallery();
	setTimeout(() => {
		changeGalleryVisibility(true);
	}, DEFAULT_TIMEOUT);
}

function selectCountry(country, countryColor, isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({ country: country, countryColor: countryColor }, null, null);
	}

	now = new Date();
	document.getElementById("load-icon").src = "img/icons/" + allData.filter(x => { return x.id == country })[0].symbol + ".svg";
	showLoader();

	addRemoveNoDisplay(["map-page", "btn-grp-left"], false);
	addRemoveClass("btn-grp-right", "justify-end", false);
	imgList = [];
	rgnsList = [];
	areaList = [];
	selectedCountry = country;
	isNewCountry = true;

	filterCountryData();
	changeMainColor(countryColor);

	setTimeout(() => {
		stopLoader();
		document.getElementById("load8").addEventListener("animationend", openMapPage);
	}, 1200);
}

/**** Data Loading/Setup ****/
function setupSite() {
	[["dates-title", "Dates visited", "訪れた日付"],
	["pic-info-btn", "See picture information", "写真の情報を見る"],
	["globe-btn", "Return to country picker", "国の選択へ戻る"],
	["map-btn", "Return to map", "地図に戻る"],
	["creator-btn", "About the site", "このサイトについて"],
	["filter-btn", "Filter Pictures", "写真をフィルターする"],
	["left-arrow", "Previous picture", "前の写真"],
	["right-arrow", "Next picture", "次の写真"],
	["search-eng", "Google in English", "英語でググる"],
	["search-jp", "Google in Japanese", "日本語でググる"]]
		.forEach(element => {
			document.getElementById(element[0]).title = getBilingualText(element[1], element[2]);
		});

	Array.from(document.getElementsByClassName("close-btn")).forEach(element => {
		element.title = getBilingualText("Close", "閉じる");
	})

	Array.from(document.getElementsByClassName("loader-dot")).forEach(dot => {
		dot.addEventListener("animationend", function () {
			addRemoveNoDisplay([dot], true);
		});
	});

	document.addEventListener("contextmenu", function (e) {
		if (e.target.nodeName === "IMG") {
			e.preventDefault();
		}
	}, false);

	document.getElementById("load8").addEventListener("animationend", function () {
		addRemoveNoDisplay(document.getElementById("loading-screen"), true);
		isLoading = false;
	});

	// Button click detections
	document.getElementById("rgn-drop-down-bg").addEventListener("click", closeRgnDropdown);
	document.getElementById("rgn-info-bg").addEventListener("click", function () { changeRegionInfoVisibility(false, true); });
	document.getElementById("to-top-btn").addEventListener("click", function () {
		if (document.body.scrollTop > SCROLL_THRESHOLD) {
			scrollToTop(true);
		} else {
			scrollDown();
		}
	});
	document.getElementById("main-title").addEventListener("click", function () { selectRgn(); });
	document.getElementById("rgn-title-btn").addEventListener("click", toggleRgnDropdown);
	document.getElementById("creator-btn").addEventListener("click", openInfoPopup);
	document.getElementById("globe-btn").addEventListener("click", showStartScreen);
	document.getElementById("map-btn").addEventListener("click", function () { changeGalleryVisibility(false); });
	document.getElementById("info-btn").addEventListener("click", function () { changeRegionInfoVisibility(undefined, true); });

	document.getElementById("filter-btn").addEventListener("click", showFilter);

	document.getElementById("fullscreen-bg").addEventListener("click", function () { closeFullscreen(true) });
	document.getElementById("fullscreen-ctrl").addEventListener("click", function () { closeFullscreen(true) });
	document.getElementById("left-arrow").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("fullscreen-pic").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("right-arrow").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("left-arrow").addEventListener("click", function () { changeFullscreenPicture(false); });
	document.getElementById("right-arrow").addEventListener("click", function () { changeFullscreenPicture(true); });
	document.getElementById("pic-info-bg").addEventListener("click", hidePicInfo);
	document.getElementById("pic-info-drawer").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("pic-info-btn").addEventListener("click", function () { changePicInfoVisibility(); });
	document.getElementById("pic-info-close-btn").addEventListener("click", hidePicInfo);
	document.getElementById("search-eng").addEventListener("click", searchEnglish);
	document.getElementById("search-jp").addEventListener("click", searchJapanese);

	document.getElementById("country-map-mini").addEventListener("load", filterMiniMap);
	document.getElementById("country-map").addEventListener("load", colourMap);
	document.getElementById("rgn-info-handle").addEventListener("touchstart", e => { startHandleDrag(e, "rgn-info-handle") }, false);
	document.getElementById("pic-info-handle").addEventListener("touchstart", e => { startHandleDrag(e, "pic-info-handle") }, false);
	document.addEventListener("touchend", endHandleDrag, false);

	// Key input detections
	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			if (isPopupVisible) {
				closeInfoPopup(true);
			} else if (isFullscreen) {
				closeFullscreen(true);
			}
		}

		if (isFullscreen) {
			if (event.key === "ArrowRight") {
				changeFullscreenPicture(true);
			} else if (event.key == "ArrowLeft") {
				changeFullscreenPicture(false);
			} else if (!isPicInfoVisible && event.key == "ArrowUp") {
				showPicInfo();
			} else if (isPicInfoVisible && event.key == "ArrowDown") {
				hidePicInfo();
			}
		}
	});

	// Popups
	infoPopup = new InfoPopup();
	document.body.appendChild(infoPopup);
	infoPopup.addEventListener("info-popup-closed", () => {
		isPopupVisible = false;
	});
	filterPopup = new FilterPopup();
	filterPopup.addEventListener("filter-popup-closed", () => {
		isFilterVisible = false;
	});
	filterPopup.addEventListener("filter-popup-submitted", event => {
		filterImages(event.detail.isOnlyFavs,
			event.detail.keyword,
			event.detail.selectedRegions,
			event.detail.selectedAreas,
			event.detail.selectedTags,
			event.detail.selectedCameras);
	});
	document.body.appendChild(filterPopup);

	// Swipe detections
	let swipeContainer = document.getElementById("fullscreen");
	swipeContainer.addEventListener("touchstart", startFullscreenSwipe, false);
	swipeContainer.addEventListener("touchmove", moveFullscreenSwipe, false);

	// currently remove because it will not work on Apple
	document.getElementById("pic-info-details").addEventListener("touchstart", (event) => {
		event.stopPropagation();
	});
	document.getElementById("pic-info-details").addEventListener("touchmove", (event) => {
		event.stopPropagation();
	});

	// Scroll detections
	window.onscroll = function () {
		if (!isLoading) {
			showHideFloatingBtn();
			scrollRegionInfo();

			if (isGalleryVisible && imageLoadIndex < imgList.length && (window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
				addPics();
			}
		}
	};

	// Back button detections
	window.addEventListener('popstate', (event) => {
		if (event.state.country) {
			if (this.isGalleryVisible) {
				changeGalleryVisibility(false);
			} else {
				this.selectCountry(event.state.country, event.state.countryColor, true);
			}
		} else if (event.state.rgn && this.selectedCountry != null) {
			this.selectRgn(event.state.rgn, true);
		} else {
			this.showStartScreen(true);
		}
	});
}

function filterCountryData() {
	if (allData != null && selectedCountry != null) {
		data = allData.find(country => { return country.id == selectedCountry; })
		data.region_groups.forEach(rgnGrp => {
			rgnGrp.regions.forEach(rgn => {
				if (rgn.image_list != null) {
					rgn.image_list.sort(sortImgs);
				}
			});
		});

		countryTitle = getBilingualText(data.english_name, data.japanese_name);
		document.getElementById("main-title").innerHTML = countryTitle;
		document.getElementById("main-title").title = getBilingualText("See all images from " + data.english_name, data.japanese_name + "の写真をすべて表示する");
		document.getElementById("rgn-title-btn").title = getBilingualText("Change " + data.official_region_name_english, data.official_region_name_japanese + "を切り替える");
		document.getElementById("info-btn").title = getBilingualText("Toggle " + data.official_region_name + " info", data.official_region_name_japanese + "の情報をトグル");
		seeFromRgnTitle = getBilingualText("See images from this " + data.official_region_name_english, "この地域の写真を表示する");

		createRgnDD();
		setTimeout(() => {
			createMap();
		}, 50);
	}
}

function fetchData() {
	let hasError = false;

	fetch("js/data.json")
		.then(response => {
			return response.json();
		}).then(d => {
			allData = d;
		}).catch(error => {
			showDataLoadError();
			hasError = true;
			console.error(error);
		}).then(() => {
			if (!hasError && allData != null) {
				createStartScreen();
				showFirstStartScreen();
			}
		});
}

function retry() {
	addRemoveNoDisplay("error-btn", true);
	for (let i = 0; i <= 8; i++) {
		document.getElementById("load" + i).style.animationPlayState = "running";
	}
	fetchData();
}

function showDataLoadError() {
	setTimeout(() => {
		addRemoveNoDisplay("error-btn", false);
		addRemoveTransparent("error-btn", false);
		for (let i = 0; i <= 8; i++) {
			document.getElementById("load" + i).style.animationPlayState = "paused";
		}
	}, DEFAULT_TIMEOUT);
}

/**** Loading Animation ****/
function showLoader() {
	isLoading = true;
	addRemoveTransparent(["top-bar", "map-page", "start-screen"], true);
	addRemoveNoDisplay("loading-screen", false);
	addRemoveTransparent("loading-screen", false);
	for (let i = 0; i <= 8; i++) {
		document.getElementById("load" + i).style.animationIterationCount = "infinite";
		addRemoveNoDisplay("load" + i, false);
	}

	setTimeout(() => {
		addRemoveNoDisplay("start-screen", true);
	}, DEFAULT_TIMEOUT);
}

function hideLoader() {
	addRemoveTransparent("loading-screen", true);
	addRemoveTransparent("top-bar", false);
	document.body.style.overflowY = "auto";
	setTimeout(() => {
		addRemoveNoDisplay("loading-screen", true);
		setTimeout(() => {
			addRemoveTransparent("loading-screen", false);
			isLoading = false;
		}, DEFAULT_TIMEOUT);
	}, DEFAULT_TIMEOUT);
}

function stopLoader() {
	setTimeout(() => {
		let iterationCount = Math.ceil((new Date() - now) / LOAD_ANIMATION_TIME);
		for (let i = 0; i <= 8; i++) {
			document.getElementById("load" + i).style.animationIterationCount = iterationCount;
		}
	}, 100);
}

/**** Start Screen ****/
function highlightCountry(abbreviation, isHover) {
	addRemoveTransparent(abbreviation + "-start-icon-c", isHover);
	let icons = Array.from(document.getElementById(abbreviation + "-start-icon").getElementsByTagName("img"));
	addRemoveClass(icons, "animated", isHover);
}

function createStartScreen() {
	const btn = document.createElement("button");
	btn.classList.add("start-btn", "highlight-btn", "txt-btn");
	const text = document.createElement("div");
	text.classList.add("country-text");
	const icon = document.createElement("div");
	icon.classList.add("start-icon");
	const img = document.createElement("img");
	img.classList.add("start-icon", "img");

	document.getElementById("start-screen").replaceChildren();

	allData.forEach(country => {
		const abb = country.abbreviation;

		let newBtn = btn.cloneNode();
		newBtn.id = "start-btn-" + abb;
		newBtn.title = getBilingualText("See " + country.english_name, country.japanese_name + "へ");
		newBtn.classList.add(abb);
		newBtn.addEventListener("click", function () {
			selectCountry(country.id, '--' + abb + '-color');
		});

		let engTxt = text.cloneNode();
		engTxt.innerHTML = country.english_name;
		let jpTxt = text.cloneNode();
		jpTxt.innerHTML = country.japanese_name;
		let iconn = icon.cloneNode();
		iconn.id = abb + "-start-icon";
		let imgWhite = img.cloneNode();
		imgWhite.id = abb + "-start-icon-w";
		imgWhite.src = "img/icons/" + country.symbol + "_white.svg";
		let imgColor = img.cloneNode();
		imgColor.id = abb + "-start-icon-c";
		imgColor.src = "img/icons/" + country.symbol + ".svg";
		imgColor.classList.add("opacity-transition");

		newBtn.addEventListener("mouseover", function () {
			highlightCountry(abb, true);
		});
		newBtn.addEventListener("touchstart", function () {
			highlightCountry(abb, true);
		});
		newBtn.addEventListener("mouseout", function () {
			highlightCountry(abb, false);
		});
		newBtn.addEventListener("touchend", function () {
			highlightCountry(abb, false);
		});

		newBtn.appendChild(engTxt);
		newBtn.appendChild(iconn);
		newBtn.appendChild(jpTxt);
		iconn.appendChild(imgWhite);
		iconn.appendChild(imgColor);

		document.getElementById("start-screen").appendChild(newBtn);
	});
}

function showFirstStartScreen() {
	window.history.pushState({}, null, null);
	document.getElementById("load8").addEventListener("animationend", showStartScreen);
	stopLoader();
}

function showStartScreen(isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({}, null, null);
	}

	selectedCountry = null;
	scrollToTop(false);
	changeMainColor("--default-color");
	addRemoveNoDisplay(["top-bar", "load-icon"], false);
	addRemoveTransparent("top-bar", false);
	addRemoveClass("btn-grp-right", "justify-end", true);
	addRemoveTransparent("map-page", true);
	addRemoveNoDisplay(["btn-grp-left", "loading-screen", "to-top-btn", "map-page"], true);
	document.getElementById("load8").removeEventListener("animationend", showStartScreen);
	addRemoveNoDisplay("start-screen", false);
	document.getElementById("start-screen").scrollTo({
		top: 0,
		left: 0,
		behavior: "instant"
	});
	setTimeout(() => {
		addRemoveTransparent("start-screen", false);
	}, 10);
}

/**** Main ****/
function main() {
	now = new Date();
	scrollToTop(false);
	createTemplates();
	setupSite();
	fetchData();
}

main();
