/*
	Project Name: Travel Memories
	Author: Katie Lu
	Note: currently not implementing components in this project (hence 
			the length of the file) but I plan to once I have the time.
*/
import * as Gallery from '../components/gallery/gallery.js';
import * as Fullscreen from '../components/fullscreen/fullscreen.js';
import InfoPopup from '../components/popup/info-popup/info-popup.js'
import { LOAD_ANIMATION_TIME, DEFAULT_TIMEOUT, SCROLL_THRESHOLD } from './constants.js'
import { getBilingualText, isPortraitMode, scrollToTop, addRemoveClass,sortImgs, addRemoveNoDisplay, addRemoveTransparent } from '../../js/utility.js';

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
//var imgList = null;

// Booleans
var infoPopup = null;
var isPopupVisible = false;
var isGalleryVisible = false;

// Gestures
var initialX = null;
var initialY = null;
var initialYHandle = null;
var isHandleGrabbed = false;
var grabbedHandleId = null;

var seeFromRgnTitle = null;

var appColor;

/**** General ****/
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
					Fullscreen.hidePicInfo();
				} else {
					Gallery.showRegionInfo(true);
				}
			} else if (currentY < initialYHandle) {
				if (grabbedHandleId == "rgn-info-handle") {
					Gallery.hideRegionInfo(true);
				}
			}
			initialYHandle = null;
			grabbedHandleId = null;
		}
	}
}

/**** Floating Button ****/
function scrollDown() {
	document.getElementById("main-title").scrollIntoView({
		behavior: 'smooth',
		block: "start"
	});
}

/**** Official Region List ****/
function createRgnDD() {
	const dropDownRgnList = document.getElementById("rgn-drop-down");
	dropDownRgnList.replaceChildren();

	// region group text and regions
	let rgnGrpGroup = document.createElement("div");
	rgnGrpGroup.classList.add("rgn-grp");

	let rgnGrpTitle = document.createElement("div");
	rgnGrpTitle.classList.add("rgn-grp-text");

	let rgnTxtBtn = document.createElement("button");
	rgnTxtBtn.classList.add("rgn-txt", "visited-rgn-text", "highlight-btn", "txt-btn");

	let rgnGrpDrop = document.createElement("div");
	rgnGrpDrop.classList.add("rgn-grp-text", "regular-text");

	let rgnDrop = document.createElement("button");
	rgnDrop.classList.add("rgn-txt", "regular-text", "highlight-btn", "txt-btn");

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
					selectRegion(rgn.id);
				}, false);
				dropDownRgnList.appendChild(ddRgn);
			}
		});
	});
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
				selectRegion(rgn.id);
				document.getElementById("main-title").innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
			});

			rgnImg.addEventListener("mouseover", () => {
				rgnImg.setAttribute("opacity", "50%");
				//hoveredRegion = rgn.english_name;
				document.getElementById("main-title").innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
			});

			rgnImg.addEventListener("mouseout", () => {
				rgnImg.setAttribute("opacity", "100%");
				//hoveredRegion = "";
				document.getElementById("main-title").innerHTML = countryTitle;
			});
		} else {
			rgnImg.setAttribute("fill", "lightgrey");
		}
	});
}

function createMap() {
	const svgObj = document.getElementById("country-map");
	svgObj.data = "assets/img/country/" + selectedCountry + ".svg";
}

/**** Site Info Popup ****/
function openInfoPopup() {
	isPopupVisible = true;
	infoPopup.openPopup();
}

function closeInfoPopup() {
	document.querySelector("info-popup").closePopup(true);
}

/**** Show and hide pages ****/
function openMapPage() {
	hideLoader();
	scrollToTop(false);
	addRemoveTransparent("map-page", false);
	addRemoveNoDisplay("to-top-btn", false);
	Gallery.toggleFloatingButton();
}

function changeGalleryVisibility(isVisible) {
	Gallery.closeRgnDropdown();
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
		if (Gallery.imgList.length > 0) {
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

function selectRegion(regionId, isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({ rgn: regionId }, null, null);
	}

	showLoader();
	if(regionId != undefined && regionId != null){
		let newRegion = data.region_groups.flatMap(x => x.regions).filter(rgn => rgn.id == regionId);
		Gallery.setNewRegion(newRegion, true);
	} else {
		let visitedRgns = data.region_groups.flatMap(grp => grp.regions.filter(rgn => rgn.visited));
		Gallery.setNewRegion(visitedRgns, false);
	}

	setTimeout(() => {
		changeGalleryVisibility(true);
	}, DEFAULT_TIMEOUT);
}

function selectCountry(country, countryColor, isPoppedPage) {
	if (isPoppedPage == null) {
		window.history.pushState({ country: country, countryColor: countryColor }, null, null);
	}

	// TODO: modularize loader
	now = new Date();
	document.getElementById("load-icon").src = "assets/icons/" + allData.filter(x => { return x.id == country })[0].symbol + ".svg";
	showLoader();

	addRemoveNoDisplay(["map-page", "btn-grp-left"], false);
	addRemoveClass("btn-grp-right", "justify-end", false);
	selectedCountry = country;

	changeMainColor(countryColor);
	filterCountryData();

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
	document.getElementById("rgn-drop-down-bg").addEventListener("click", Gallery.closeRgnDropdown);
	document.getElementById("rgn-info-bg").addEventListener("click", function () { changeRegionInfoVisibility(false, true); });
	document.getElementById("to-top-btn").addEventListener("click", function () {
		if (document.body.scrollTop > SCROLL_THRESHOLD) {
			scrollToTop(true);
		} else {
			scrollDown();
		}
	});
	document.getElementById("main-title").addEventListener("click", function () { selectRegion(); });
	document.getElementById("rgn-title-btn").addEventListener("click", Gallery.toggleRgnDropdown);
	document.getElementById("creator-btn").addEventListener("click", openInfoPopup);
	document.getElementById("globe-btn").addEventListener("click", showStartScreen);
	document.getElementById("map-btn").addEventListener("click", function () { changeGalleryVisibility(false); });
	document.getElementById("info-btn").addEventListener("click", function () { Gallery.changeRegionInfoVisibility(undefined, true); });

	document.getElementById("filter-btn").addEventListener("click", Gallery.showFilter);

	document.getElementById("fullscreen-bg").addEventListener("click", function () { Fullscreen.closeFullscreen(true) });
	document.getElementById("fullscreen-ctrl").addEventListener("click", function () { Fullscreen.closeFullscreen(true) });
	document.getElementById("left-arrow").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("fullscreen-pic").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("right-arrow").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("left-arrow").addEventListener("click", function () { Fullscreen.changeFullscreenPicture(false); });
	document.getElementById("right-arrow").addEventListener("click", function () { Fullscreen.changeFullscreenPicture(true); });
	document.getElementById("pic-info-bg").addEventListener("click", Fullscreen.hidePicInfo);
	document.getElementById("pic-info-drawer").addEventListener("click", (event) => { event.stopPropagation(); });
	document.getElementById("pic-info-btn").addEventListener("click", function () { Fullscreen.changePicInfoVisibility(); });
	document.getElementById("pic-info-close-btn").addEventListener("click", Fullscreen.hidePicInfo);
	document.getElementById("search-eng").addEventListener("click", Fullscreen.searchEnglish);
	document.getElementById("search-jp").addEventListener("click", Fullscreen.searchJapanese);

	document.getElementById("country-map-mini").addEventListener("load", () => {
		Gallery.filterMiniMap;
		hideLoader();
	});
	document.getElementById("country-map").addEventListener("load", colourMap);
	document.getElementById("rgn-info-handle").addEventListener("touchstart", e => { startHandleDrag(e, "rgn-info-handle") }, false);
	document.getElementById("pic-info-handle").addEventListener("touchstart", e => { startHandleDrag(e, "pic-info-handle") }, false);
	document.addEventListener("touchend", endHandleDrag, false);

	// Key input detections
	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			if (isPopupVisible) {
				closeInfoPopup(true);
			} else if (Fullscreen.isFullscreen) {
				Fullscreen.closeFullscreen(true);
			}
		}

		if (Fullscreen.isFullscreen) {
			if (event.key === "ArrowRight") {
				Fullscreen.changeFullscreenPicture(true);
			} else if (event.key == "ArrowLeft") {
				Fullscreen.changeFullscreenPicture(false);
			} else if (!isPicInfoVisible && event.key == "ArrowUp") {
				Fullscreen.showPicInfo();
			} else if (isPicInfoVisible && event.key == "ArrowDown") {
				Fullscreen.hidePicInfo();
			}
		}
	});

	// Popups
	infoPopup = new InfoPopup();
	document.body.appendChild(infoPopup);
	infoPopup.addEventListener("info-popup-closed", () => {
		isPopupVisible = false;
	});
	Gallery.initializeGallery((regionId) => {
		selectRegion(regionId);
	});
	Fullscreen.initializeFullscreen();

	// Swipe detections
	let swipeContainer = document.getElementById("fullscreen");
	swipeContainer.addEventListener("touchstart", Fullscreen.startFullscreenSwipe, false);
	swipeContainer.addEventListener("touchmove", Fullscreen.moveFullscreenSwipe, false);

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
			Gallery.onScrollFunction();
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
			this.selectRegion(event.state.rgn, true);
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

		let tempCountry = JSON.parse(JSON.stringify(data));
		tempCountry.region_groups.forEach(group => group.regions.forEach(region => {
			if (region.image_list) {
				region.image_list = [];
			}
		}));
		Gallery.setNewCountry(tempCountry, appColor);

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
		imgWhite.src = "assets/icons/" + country.symbol + "_white.svg";
		let imgColor = img.cloneNode();
		imgColor.id = abb + "-start-icon-c";
		imgColor.src = "assets/icons/" + country.symbol + ".svg";
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
	//createTemplates();
	setupSite();
	fetchData();
}

main();
