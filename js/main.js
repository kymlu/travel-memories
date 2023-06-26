/* To implement
	- transition when selecting a prefecture (text) in mobile
	- transition after selecting a prefecture to view pictures
	- little icon to represent each prefecture
*/

// Imports
//import { Region } from "https://raw.githubusercontent.com/kymlu/travel-memories/main/js/region.js";
//import { Prefecture } from "https://raw.githubusercontent.com/kymlu/travel-memories/main/js/prefecture.js";
//import { Image } from "https://raw.githubusercontent.com/kymlu/travel-memories/main/js/image.js";

// Variables
var r = document.querySelector(':root');

let isLoading = true;
let now = null;

let allData = null;
let data = null;
let countryTitle = null;
let selectedCountry = null;
let selectedORegion = null;
let selectedPic = null;
let selectedPicInd = 0;

let throttleORegionInfo = false;
let isPopupVisible = false;
let isToTopVisible = false;
let isFilterVisible = false;
let isGalleryVisible = false;
let isNewORegion = true;
let isFullscreen = false;
let isNewFullscreenInstance = true;
let isORegionInfoVisible = false;
let isPicInfoVisible = false;

let initialX = null;
let initialY = null;
let initialYHandle = null;
let isHandleGrabbed = false;
let grabbedHandleId = null;
let lastSwipeTime = null;

let searchTerm = ["", ""];
let filterKeyword = "";
let filterLocationsList = [];
let tempFilterLocations = [];
let filterTagsList = [];
let tempFilterTags = [];
let filterCameraList = [];
let tempFilterCameras = [];
let visibleImgs = [];

const defaultTimeout = 500;
const threshold = 500;
const japan = "japan";
const taiwan = "taiwan";
const australia = "australia";
const newZealand = "newzealand";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayNamesJp = ["日", "月", "火", "水", "木", "金", "土"];
const dayNamesCn = ["日", "一", "二", "三", "四", "五", "六"];

const tags = [
	{
		"id": "animal",
		"english_name": "Animals",
		"japanese_name": "動物",
		"chinese_name": "動物"
	},
	{
		"id": "attractions",
		"english_name": "Attractions",
		"japanese_name": "観光地",
		"chinese_name": "旅游地"
	},
	{
		"id": "art",
		"english_name": "Art",
		"japanese_name": "美術",
		"chinese_name": "美術"
	},
	{
		"id": "event",
		"english_name": "Events",
		"japanese_name": "イベント",
		"chinese_name": "活動"
	},
	{
		"id": "food",
		"english_name": "Food",
		"japanese_name": "食べ物",
		"chinese_name": "食物"
	},
	{
		"id": "nature",
		"english_name": "Nature",
		"japanese_name": "自然",
		"chinese_name": "自然"
	},
	{
		"id": "relax",
		"english_name": "Daily life",
		"japanese_name": "日常",
		"chinese_name": "日常"
	},
	{
		"id": "town",
		"english_name": "Around town",
		"japanese_name": "街中で",
		"chinese_name": "城市四周"
	}
];

let polaroid, polaroidImgFrame, polaroidImg, polaroidCaption, polaroidCaptionText, polaroidCaptionContainer, polaroidDate, singleDate;
let filterTagBtn;

//let appColor = "#be0029";

// General
function isPortraitMode(){
	return window.innerHeight > window.innerWidth;
}

function shuffle(array) {
	let currentIndex = array.length, randomIndex;

	// While there are remain elements to shuffle.
	while (currentIndex != 0) {

		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

function addRemoveClass(elements, className, isAdd){
	if (elements){
		if (typeof (elements) == 'string') {
			if(isAdd){
				document.getElementById(elements).classList.add(className);
			} else {
				document.getElementById(elements).classList.remove(className);
			}
		} else {
			if (elements && elements.length > 0) {
				if (typeof (elements[0]) == 'string') {
					if(isAdd){
						elements.forEach(element => document.getElementById(element).classList.add(className));
					} else {
						elements.forEach(element => document.getElementById(element).classList.remove(className));
					}
				} else {
					if(isAdd){
						elements.forEach(element => element.classList.add(className));
					} else {
						elements.forEach(element => element.classList.remove(className));
					}
				}
			}
		}
	}
}

function addRemoveTransparent(elements, isAdd){
	addRemoveClass(elements, "transparent", isAdd);
}

function addRemoveNoDisplay(elements, isAdd){
	addRemoveClass(elements, "no-display", isAdd);
}

function scrollToTop(isSmooth){
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

function getPictureDate(date, picOffset){
	// picOffset is in hours
	const localOffset = now.getTimezoneOffset();
	return new Date(date.getTime() - ((picOffset * -60) - localOffset) * 60000);
}

function getEnglishDate(date, isFullDate) {
	var hours = date.getHours();
	return (isFullDate ? dayNamesEn[date.getDay()] +", " : "") +
		monthNames[date.getMonth()] + " " + 
		date.getDate() + ", " + 
		date.getFullYear() + 
		(isFullDate ? 
			" " + (hours > 12 ? hours - 12 : hours).toString() + ":" + 
			date.getMinutes().toString().padStart(2, "0") + ":" + 
			date.getSeconds().toString().padStart(2, "0")  + 
			(hours >= 12 ? " PM" : " AM") 
			: "");
}

function getJapaneseDate(date, isFullDate) {
	var hours = date.getHours();
	return date.getFullYear() + "年" + 
		(date.getMonth() + 1) + "月" + 
		date.getDate() + "日" + 
		(isFullDate ? 
			"（" + dayNamesJp[date.getDay()] + "）" +
			(hours >= 12 ? "午後" : "午前") + 
			(hours > 12 ? hours - 12 : hours).toString() + ":" + 
			date.getMinutes().toString().padStart(2, "0") + ":" + 
			date.getSeconds().toString().padStart(2, "0") 
			: "");
}

// Floating Button
function scrollDown(){
	document.getElementById("main-title").scrollIntoView({
		behavior: 'smooth',
		block: "start"
	});
}

function showHideFloatingBtn() {
	const totop = getBilingualText("Go to top", "トップに移動する");
	const down = getBilingualText("Scroll down", "下に移動する");
	var btn = document.getElementById("to-top-btn");
	if (document.body.scrollTop > threshold) {
		if(isGalleryVisible && !isToTopVisible){
			btn.classList.remove("arrow-down");
			btn.classList.add("arrow-up");
			addRemoveNoDisplay([btn], false);
			addRemoveTransparent([btn], false);
			btn.title = totop;
			isToTopVisible = true;
		} else if (!isGalleryVisible){
			btn.classList.remove("arrow-down");
			btn.classList.add("arrow-up");
			btn.title = totop;
		}
	} else if (document.body.scrollTop <= threshold) {
		if (isGalleryVisible && isToTopVisible) {
			btn.classList.remove("arrow-down");
			btn.classList.add("arrow-up");
			addRemoveTransparent([btn], true);
			setTimeout(() => { addRemoveNoDisplay([btn], true); }, defaultTimeout)
			isToTopVisible = false;
		} else if (!isGalleryVisible) {
			btn.classList.remove("arrow-up");
			btn.classList.add("arrow-down");
			btn.title = down;
		}
	}
}

// Official Region List
function createRgnList() {
	// Create templates
	const rgnList = document.getElementById("rgn-list");
	rgnList.replaceChildren();

	const dropDownPrefList = document.getElementById("rgn-drop-down");
	dropDownPrefList.replaceChildren();

	const rgnGrpGroup = document.createElement("div");
	rgnGrpGroup.classList.add("rgn-grp");
	if(!data.show_unofficial_regions){
		rgnGrpGroup.classList.add("none");
	}

	const rgnGrpTitle = document.createElement("div");
	rgnGrpTitle.classList.add("rgn-grp-text");

	const visitedORegion = document.createElement("div");
	visitedORegion.classList.add("rgn-txt", "visited-rgn-text");

	const unvisitedORegion = document.createElement("div");
	unvisitedORegion.classList.add("rgn-txt", "locked-rgn-text");

	const rgnGrpDrop = document.createElement("div");
	rgnGrpDrop.classList.add("rgn-grp-text", "regular-text");
	
	const rgnDrop = document.createElement("div");
	rgnDrop.classList.add("rgn-txt", "regular-text");

	const visitedTitle = getBilingualText("See images from this " + data.official_region_name_english, "この地域の写真を表示する");

	// Iterate each unofficial and official region, sort by visited/not visited
	data.region_groups.forEach(rgnGrp => {
		const newRgnGrp = rgnGrpGroup.cloneNode();
		var ddURegion = rgnGrpDrop.cloneNode();

		if(data.show_unofficial_regions){
			const newPrefTitle = rgnGrpTitle.cloneNode();
			newPrefTitle.innerHTML = getBilingualText(rgnGrp.english_name, rgnGrp.japanese_name);
			newRgnGrp.appendChild(newPrefTitle);
			ddURegion.innerHTML = getBilingualText(rgnGrp.english_name, rgnGrp.japanese_name);
			ddURegion.id = rgnGrp.english_name + "-dropdown";
			dropDownPrefList.appendChild(ddURegion);
		}

		rgnGrp.regions.forEach(rgn => {
			var ddRgn = rgnDrop.cloneNode();
			ddRgn.innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
			ddRgn.id = rgn.id + "-dropdown";
			ddRgn.title = visitedTitle;
			if (rgn.visited) {
				const rgnNode = visitedORegion.cloneNode();
				rgnNode.innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
				rgnNode.title = visitedTitle;
				rgnNode.addEventListener("click", function () {
					selectPref(rgn);
				}, false);
				newRgnGrp.appendChild(rgnNode);

				ddRgn.classList.add("visited-rgn-text");
				ddRgn.addEventListener("click", function () {
					selectPref(rgn);
				}, false);
			} else {
				const rgnNode = unvisitedORegion.cloneNode();
				rgnNode.innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
				newRgnGrp.appendChild(rgnNode);
				ddRgn.classList.add("locked-rgn-text");
			}
			
			dropDownPrefList.appendChild(ddRgn);
			});
		rgnList.appendChild(newRgnGrp);
	});
}

// Official region selector dropdown
function togglePrefDropdown() {
	document.getElementById("rgn-drop-down-container").classList.toggle("no-display");
	spinArrow();
	if(isNewORegion){
		isNewORegion = false;
		document.getElementById(selectedORegion.id + "-dropdown").scrollIntoView({ behavior: "smooth", block: "center" });
	}
}

function closePrefDropdown() {
	addRemoveNoDisplay("rgn-drop-down-container", true);
	document.getElementById("rgn-name-arrow").classList.add("arrow-down");
	document.getElementById("rgn-name-arrow").classList.remove("arrow-up");
}

function showPrefDropdown() {
	addRemoveNoDisplay("rgn-drop-down-container", false);
	document.getElementById("rgn-name-arrow").classList.remove("arrow-down");
	document.getElementById("rgn-name-arrow").classList.add("arrow-up");
}

// Map
function colourMap() {
	if(document.getElementById("country-map").data == "") return;

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
				selectPref(rgn);
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
			rgnImg.setAttribute("fill", "lightgray");
		}
	});
}

function createMap() {
	const svgObj = document.getElementById("country-map");
	svgObj.data = "img/country/"+ selectedCountry +".svg";
}

// Photo gallery
function createTemplates() {
	// sample polaroid
	polaroid = document.createElement("div");
	polaroid.classList.add("polaroid-frame");
	polaroid.classList.add("opacity-transform-transition");
	addRemoveTransparent([polaroid], true);
	polaroid.classList.add("pic-rotate")
	polaroid.title = getBilingualText("Expand image", "画像を拡大する");

	// polaroid pin
	var polaroidPin = document.createElement("div");
	polaroidPin.classList.add("polaroid-pin");
	var polaroidPinShine = document.createElement("div");
	polaroidPinShine.classList.add("polaroid-pin-shine");
	polaroidPin.appendChild(polaroidPinShine);
	polaroid.appendChild(polaroidPin);

	// image
	polaroidImgFrame = document.createElement("div");
	polaroidImgFrame.classList.add("polaroid-img");
	polaroidImg = document.createElement("img");
	addRemoveTransparent(polaroidImg, true);
	polaroidImg.classList.add("opacity-transition");

	// caption
	polaroidCaption = document.createElement("div");
	polaroidCaption.classList.add("polaroid-caption");
	polaroidDate = document.createElement("div");
	polaroidDate.classList.add("polaroid-date");
	singleDate = document.createElement("div");
	singleDate.classList.add("date-text");
	polaroidCaptionText = document.createElement("div");
	polaroidCaptionText.classList.add("caption-text");
	polaroidCaptionText.classList.add("one-line-text");
	polaroidCaptionContainer = document.createElement("div");
	polaroidCaptionContainer.classList.add("polaroid-caption-text-container");

	filterTagBtn = document.createElement("button");
	filterTagBtn.classList.add("filter-opt");
}

function filterMiniMap() {
	// get the selected official region only
	const svgObj = document.getElementById("country-map-mini");
	const svgDoc = svgObj.contentDocument;
	const rgnList = data.region_groups.flatMap(rgnGrp => rgnGrp.regions);

	rgnList.forEach(rgn => {
		const rgnImg = svgDoc.getElementById(rgn.id + "-img");
		if (rgn.id != selectedORegion.id) {
			rgnImg.setAttribute("fill", "none");
			rgnImg.setAttribute("stroke", "none");
		} else {
			rgnImg.setAttribute("fill", appColor);
			rgnImg.setAttribute("stroke", "none");
		}
	});

	// show the map
	const japanImg = svgDoc.getElementById(selectedCountry + "-img");
	japanImg.setAttribute("viewBox", selectedORegion.viewbox);
	setTimeout(() => {
		addRemoveTransparent([svgObj], false);
	}, 50);
}

function editMiniMap() {
	const svgObj = document.getElementById("country-map-mini");
	addRemoveTransparent([svgObj], true);
	setTimeout(() => {	
		svgObj.data = "img/country/" + selectedCountry + ".svg";
	}, 50);
}

// Polaroid gallery
// Based on: https://www.codepel.com/vanilla-javascript/javascript-image-loaded/
// The lazy loading observer
function lazyLoadPolaroid(target) {
	const obs = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const thisPolaroid = entry.target;
				const img = thisPolaroid.querySelector(".polaroid-img").getElementsByTagName("img")[0];
				const src = img.getAttribute("img-src");
				img.setAttribute("src", src);
				setTimeout(() => {
					addRemoveTransparent([thisPolaroid], false);
				}, 75);
				observer.disconnect();
			}
		});
	});
	obs.observe(target);
}

function createGallery() {
	// clear existing
	let gallery = document.getElementById("gallery");
	gallery.replaceChildren();
	let isLeft = false;

	// add pictures
	if (selectedORegion.image_list.length > 0) {
		let angle = 1; // 1-4 for the rotation class
		selectedORegion.image_list.forEach(img => {
			// clone all relevant nodes
			let pol = polaroid.cloneNode(true);
			let polImgFrame = polaroidImgFrame.cloneNode();
			let polImg = polaroidImg.cloneNode();
			let polCaption = polaroidCaption.cloneNode();
			let polDate = polaroidDate.cloneNode();
			let polDateEn = singleDate.cloneNode();
			let polDateJp = singleDate.cloneNode();
			let polCaptionText = polaroidCaptionContainer.cloneNode()
			let polCaptionTextEn = polaroidCaptionText.cloneNode();
			let polCaptionTextJp = polaroidCaptionText.cloneNode();

			// append elements in correct order
			pol.appendChild(polImgFrame);
			polImgFrame.appendChild(polImg);
			pol.appendChild(polCaption);
			polCaption.appendChild(polDate);
			polDate.appendChild(polDateEn);
			polDate.appendChild(polDateJp);
			polCaption.appendChild(polCaptionText);
			polCaptionText.appendChild(polCaptionTextEn);
			polCaptionText.appendChild(polCaptionTextJp);

			// rotate picture
			pol.classList.add((isLeft ? "left-" : "right-") + angle);

			// add info
			if(img.date){
				let date = getPictureDate(new Date(img.date), img.offset);
				polDateEn.innerHTML = getEnglishDate(date, false);
				polDateJp.innerHTML = getJapaneseDate(date, false);
			} else {
				polDateEn.innerHTML = "";
				polDateJp.innerHTML = "";
			}
			if(img.description_english){
				polCaptionTextEn.innerHTML = img.description_english;
			}
			if(img.description_japanese){
				polCaptionTextJp.innerHTML = img.description_japanese;
			}

			// listeners
			pol.addEventListener("click", function () {
				selectedPic = img;
				selectedPicInd = selectedORegion.image_list.indexOf(selectedPic);
				isNewFullscreenInstance = true;
				setFullscreenPicture();
				lastSwipeTime = new Date();
				openFullscreen();
			});
			polImg.onload = function () {
				if (this.width > this.height) {
					polImg.classList.add("landscape-img");
				} else {
					polImg.classList.add("portrait-img");
				}
			}

			polImg.setAttribute("img-src", img.link ?? "img/" + selectedCountry + "/" + selectedORegion.id + "/" + img.file_name);
			polImg.addEventListener("load", event => {
				addRemoveTransparent(polImg, false);
			});
			lazyLoadPolaroid(pol);

			// add to screen
			gallery.appendChild(pol);

			// change iterators
			isLeft = !isLeft;
			if (isLeft) {
				angle++;
				if (angle > 4) {
					angle = 1;
				}
			}
		});
	} else {
		gallery.innerHTML = getBilingualText("No pictures available","写真はありません");
	}
}

function selectPref(newORegion) {
	openLoader();
	isNewORegion = true;

	if (selectedORegion) {
		document.getElementById(selectedORegion.id + "-dropdown").classList.remove("active");
	}
	document.getElementById(newORegion.id + "-dropdown").classList.add("active");

	selectedORegion = newORegion;
	document.getElementById("rgn-name-arrow").classList.add("arrow-down");
	document.getElementById("rgn-name-arrow").classList.remove("arrow-up");
	editMiniMap(newORegion);
	
	document.getElementById("rgn-dates").innerHTML = getBilingualText(selectedORegion.dates_english, selectedORegion.dates_japanese);
	document.getElementById("rgn-cities").innerHTML = selectedORegion.areas.map(area => {
		return getBilingualText(area.english_name, area.japanese_name);
	}
	).sort().join(" | ");
	document.getElementById("rgn-desc-eng").innerHTML = selectedORegion.description_english;
	document.getElementById("rgn-desc-jp").innerHTML = selectedORegion.description_japanese;
	document.getElementById("rgn-name").innerHTML = getBilingualText(selectedORegion.english_name, selectedORegion.japanese_name);

	var filterLocations = document.getElementById("location-list");
	filterLocations.replaceChildren();
	selectedORegion.areas.sort((a, b) => { 
		let a1 = a.english_name.toLowerCase();
		let b1 = b.english_name.toLowerCase();
	
		if (a1 < b1) {
			return -1;
		}
		if (a1 > b1) {
			return 1;
		}
		return 0;
	}).forEach(area => {
		var tempBtn = filterTagBtn.cloneNode();
		tempBtn.id = area.id + "-tag";
		tempBtn.innerHTML = getBilingualText(area.english_name, area.japanese_name);
		tempBtn.addEventListener("click", () => {
			toggleLocation(area.id);
			tempBtn.classList.toggle("active");
		});
		filterLocations.appendChild(tempBtn);
	});

	var filterTags = Array.from(document.getElementById("tags-list").getElementsByClassName("filter-opt"));
	var presentTags = new Set(selectedORegion.image_list.flatMap(x => {return x.tags}));
	filterTags.forEach(tag => {
		var id = tag.id.replace("-tag", "");
		if(presentTags.has(id)){
			addRemoveNoDisplay([tag], false);
		} else {
			addRemoveNoDisplay([tag], true);
		}
		tag.classList.remove("active");
	});

	var filterCameras = document.getElementById("camera-list");
	filterCameras.replaceChildren();
	new Set(selectedORegion.image_list.map(x => {return x.camera_model})
		.sort()
		.filter(x => x))
		.forEach(camera => {
		var tempBtn = filterTagBtn.cloneNode();
		tempBtn.id = camera + "-tag";
		tempBtn.innerHTML = camera;
		tempBtn.addEventListener("click", () => {
			toggleCamera(camera);
			tempBtn.classList.toggle("active");
		});
		filterCameras.appendChild(tempBtn);
	});

	clearFilters();
	filterKeyword = "";
	visibleImgs = [];
	filterLocationsList = [];
	filterTagsList = [];
	filterCameraList = [];
	createGallery();
	changeGalleryVisibility(true);
	hideLoader();
}

// filtering
function toggleFilter(id, array) {
	if(array.includes(id)){
		array.splice(array.indexOf(id), 2);
	} else {
		array.push(id);
	}
}

function toggleLocation(id) {
	toggleFilter(id, tempFilterLocations);
}

function toggleTag(id) {
	toggleFilter(id, tempFilterTags);
}

function toggleCamera(id){
	toggleFilter(id, tempFilterCameras)
}

function showFilter() {
	isFilterVisible = true;
	addRemoveTransparent(["img-filter-popup", "filter-popup-bg"], false);
	document.getElementById("filter-popup").style.visibility = "visible";
	document.getElementById("img-filter-popup").classList.add("popup-width");
	setTimeout(() => {
		addRemoveNoDisplay("filters", false);
		addRemoveTransparent("filters", false);
		document.getElementById("img-filter-popup").classList.add("popup-height");
	}, defaultTimeout);

	document.getElementById("keyword-input").value = filterKeyword;
	tempFilterLocations = filterLocationsList.slice();
	tempFilterTags = filterTagsList.slice();
	tempFilterCameras = filterCameraList.slice();
	Array.from(document.getElementById("location-list").getElementsByClassName("filter-opt"))
		.forEach(tag => {
			if (tempFilterLocations.includes(tag.id.replace("-tag", ""))) {
				tag.classList.add("active");
			} else {
				tag.classList.remove("active");
			}
		});
	Array.from(document.getElementById("tags-list").getElementsByClassName("filter-opt"))
		.forEach(tag => {
			if (tempFilterTags.includes(tag.id.replace("-tag", ""))) {
				tag.classList.add("active");
			} else {
				tag.classList.remove("active");
			}
		});
	Array.from(document.getElementById("camera-list").getElementsByClassName("filter-opt"))
		.forEach(tag => {
			if (tempFilterCameras.includes(tag.innerHTML)) {
				tag.classList.add("active");
			} else {
				tag.classList.remove("active");
			}
		});
}

function hideFilter(forceClose) {
	isFilterVisible = false;
	if (forceClose) {
		document.getElementById("filter-popup").style.visibility = "hidden";
		addRemoveTransparent("filters", true);
		document.getElementById("img-filter-popup").classList.remove("popup-height");
		document.getElementById("img-filter-popup").classList.remove("popup-width");
		addRemoveNoDisplay("filters", false);
		addRemoveTransparent("img-filter-popup", true);
		addRemoveTransparent("filter-popup-bg", true);
	} else {
		addRemoveTransparent("filters", true);
		setTimeout(() => {
			document.getElementById("img-filter-popup").classList.remove("popup-height");
			setTimeout(() => {
				addRemoveNoDisplay("filters", true);
				document.getElementById("img-filter-popup").classList.remove("popup-width");
				setTimeout(() => {
					addRemoveTransparent("img-filter-popup", true);
					addRemoveTransparent("filter-popup-bg", true);
					setTimeout(() => {
						document.getElementById("filter-popup").style.visibility = "hidden";
					}, defaultTimeout);
				}, defaultTimeout);
			}, defaultTimeout);
		}, defaultTimeout);
	}
}

function checkEmptyKeywordInput(){
	if (document.getElementById("keyword-input").value == ""){
		addRemoveNoDisplay("kw-clear-btn", true);
	} else if (document.getElementById("kw-clear-btn").classList.contains("no-display")) {
		addRemoveNoDisplay("kw-clear-btn", false);
	}
}

function clearKeyword() {
	document.getElementById("keyword-input").value = "";
	checkEmptyKeywordInput();
}

function clearFilters() {
	clearKeyword();
	tempFilterLocations = [];
	tempFilterTags = [];
	tempFilterCameras = [];
	Array.from(document.getElementById("location-list").getElementsByClassName("active"))
	.forEach(tag => {
		tag.classList.remove("active");
	});
	Array.from(document.getElementById("tags-list").getElementsByClassName("active"))
	.forEach(tag => {
		tag.classList.remove("active");
	});
	Array.from(document.getElementById("camera-list").getElementsByClassName("active"))
	.forEach(tag => {
		tag.classList.remove("active");
	});
}

function doesTextIncludeKeyword(text){
	return text && text.toLowerCase().includes(filterKeyword);
}

function includeImage(img) {
	let area = selectedORegion.areas.find(x => {return x.id == img.city;});
	let tempTags = tags.filter(tag => img.tags.includes(tag.id) && (doesTextIncludeKeyword(tag.english_name) || doesTextIncludeKeyword(tag.japanese_name)));
	return (filterKeyword == "" ||
		doesTextIncludeKeyword(img.description_english) ||
		doesTextIncludeKeyword(img.description_japanese) ||
		doesTextIncludeKeyword(img.location_english) ||
		doesTextIncludeKeyword(img.location_japanese) ||
		doesTextIncludeKeyword(img.location_chinese) ||
		doesTextIncludeKeyword(area?.english_name) ||
		doesTextIncludeKeyword(area?.japanese_name) || 
		doesTextIncludeKeyword(img.camera_model) || 
		tempTags.length > 0) &&
		(filterLocationsList.length == 0 || filterLocationsList.includes(img.city)) &&
		(filterTagsList.length == 0 || filterTagsList.filter(value => img.tags.includes(value)).length > 0) &&
		(filterCameraList.length == 0 || filterCameraList.includes(img.camera_model));
}

function filterImages() {
	var i = 0;	
	let angle = 1; // 1-4 for the rotation class
	isLeft = false;
	visibleImgs = [];

	if(document.getElementById("none")){
		document.getElementById("none").remove();
	}
	var allPolaroids = Array.from(document.getElementsByClassName("polaroid-frame"));

	selectedORegion.image_list.forEach(img => {
		if(includeImage(img)){
			addRemoveNoDisplay([allPolaroids[i]], false);
			var classList = Array.from(allPolaroids[i].classList).filter(className => {return className.includes("left") || className.includes("right")});
			
			if ((classList.filter(className => className.includes("left")).length > 0 && !isLeft) ||
				(classList.filter(className => className.includes("right")).length > 0 && isLeft)) {
				allPolaroids[i].classList.remove(classList[0]);
				allPolaroids[i].classList.add((isLeft ? "left-" : "right-") + angle);
			}

			isLeft = !isLeft;
			if (isLeft) {
				angle++;
				if (angle > 4) {
					angle = 1;
				}
			}
			visibleImgs.push(i);
		} else {
			addRemoveNoDisplay([allPolaroids[i]], true);
		}
		i++;
	})
	if(visibleImgs.length == 0){
		let temp = document.createElement("div");
		temp.id = "none";
		temp.style.margin = "-125px";
		temp.innerHTML = getBilingualText("No pictures available","写真はありません");
		document.getElementById("gallery").appendChild(temp);
	}
	
}

function submitFilters() {
	filterKeyword = document.getElementById("keyword-input").value;
	filterLocationsList = tempFilterLocations.slice();
	filterTagsList = tempFilterTags.slice();
	filterCameraList = tempFilterCameras.slice();
	filterImages();
	hideFilter(true);
}

// fullscreen
function search(searchTerm) {
	window.open("https://www.google.com/search?q=" + searchTerm);
}

function searchEnglish() {
	search(searchTerm[0]);
}

function searchJapanese() {
	search(searchTerm[1])
}

function changeFullscreenPicture(isForward) {
	if (isForward) {
		if (visibleImgs.length > 0){
			var ind = visibleImgs.indexOf(selectedPicInd);
			if (ind == visibleImgs.length - 1) {
				selectedPicInd = visibleImgs[0];
			} else {
				selectedPicInd = visibleImgs[ind + 1];
			}
		} else {
			if (selectedPicInd == (selectedORegion.image_list.length - 1)) {
				selectedPicInd = 0;
			} else {
				selectedPicInd++;
			}
		}
	} else {
		if (visibleImgs.length > 0) {
			var ind = visibleImgs.indexOf(selectedPicInd);
			if (ind == 0) {
				selectedPicInd = visibleImgs[visibleImgs.length - 1];
			} else {
				selectedPicInd = visibleImgs[ind - 1];
			}
		} else {
			if (selectedPicInd == 0) {
				selectedPicInd = selectedORegion.image_list.length - 1;
			} else {
				selectedPicInd--;
			}
		}
	}
	selectedPic = selectedORegion.image_list[selectedPicInd];
	setFullscreenPicture(isForward);
}

function setFullscreenInfo(){
	if(selectedPic.date){
		let date = getPictureDate(new Date(selectedPic.date), selectedPic.offset);
		document.getElementById("fullscreen-eng-date").innerHTML = getEnglishDate(date, true);
		document.getElementById("fullscreen-jp-date").innerHTML = getJapaneseDate(date, true);
	} else {
		document.getElementById("fullscreen-eng-date").innerHTML = "Unknown date";
		document.getElementById("fullscreen-jp-date").innerHTML = "不明な日付";
	}
	let area = selectedORegion.areas.find(function (area) { return area.id == selectedPic.city });
	searchTerm[0] = (selectedPic.location_english ? 
						(selectedPic.location_english + ", ") : 
						selectedCountry == japan && selectedPic.location_japanese ? (selectedPic.location_japanese + ", ") : 
						selectedCountry == taiwan && selectedPic.location_chinese ? (selectedPic.location_chinese + ", ") : 
						"") + (area.english_name ?? "");
	document.getElementById("fullscreen-eng-city").innerHTML = searchTerm[0];
	document.getElementById("search-eng").addEventListener("click", searchEnglish);
	searchTerm[1] = (area.japanese_name ?? area.english_name ?? "") + (selectedPic.location_japanese ? ("　" + selectedPic.location_japanese) : 
						(selectedCountry == taiwan && selectedPic.location_chinese) ? ("　" + selectedPic.location_chinese) : 
						selectedPic.location_english ? ("　" + selectedPic.location_english) : "");
	document.getElementById("fullscreen-jp-city").innerHTML = searchTerm[1];
	document.getElementById("search-jp").addEventListener("click", searchJapanese);

	
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
	var tempElement = null;
	if(selectedPic.f_stop){
		tempElement = document.createElement("div");
		tempElement.innerHTML = "\u0192/" + selectedPic.f_stop;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if(selectedPic.exposure){
		tempElement = document.createElement("div");
		tempElement.innerHTML = selectedPic.exposure;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if(selectedPic.iso){
		tempElement = document.createElement("div");
		tempElement.innerHTML = "iso " + selectedPic.iso;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	// if(selectedPic.focal_length){
	// 	tempElement = document.createElement("div");
	// 	tempElement.innerHTML = selectedPic.focal_length;
	// 	document.getElementById("technical-info").appendChild(tempElement);
	// }

	selectedPic.tags.map(x => { return tags.find(function (t) { return t.id == x }) })
		.sort()
		.forEach(tag => {
			tempElement = document.createElement("div");
			tempElement.classList.add("img-tag");
			tempElement.innerHTML = getBilingualText(tag.english_name, tag.japanese_name);
			document.getElementById("img-tags").appendChild(tempElement);
		});
}

function setFullscreenPicture(isForward) {
	document.getElementById("search-eng").removeEventListener("click", searchEnglish);
	document.getElementById("search-jp").removeEventListener("click", searchJapanese);
	document.getElementById("img-tags").replaceChildren();

	var src = selectedPic.link ?? "img/" + selectedCountry + "/" + selectedORegion.id + "/" + selectedPic.file_name;

	if (isNewFullscreenInstance || (new Date() - lastSwipeTime) < 300) {
		document.getElementById("fullscreen-pic").src = src;
		isNewFullscreenInstance = false;
	} else {
		var nextPic = document.getElementById("fullscreen-pic-next");
		var currentPic = document.getElementById("fullscreen-pic");
		
		addRemoveNoDisplay(nextPic, true);
		nextPic.src = src;
		nextPic.classList.add(isForward ? "fullscreen-pic-right":"fullscreen-pic-left");

		setTimeout(() => {
			addRemoveNoDisplay(nextPic, false);
			addRemoveTransparent([nextPic, currentPic], false);
			nextPic.classList.remove(isForward ? "fullscreen-pic-right" : "fullscreen-pic-left");
			currentPic.classList.add(isForward ? "fullscreen-pic-left" : "fullscreen-pic-right");

			setTimeout(() => {
				addRemoveNoDisplay(currentPic, true);
				currentPic.src = src;
				currentPic.classList.remove(isForward ? "fullscreen-pic-left" : "fullscreen-pic-right");
				addRemoveTransparent([currentPic], false);
				setTimeout(() => {
					addRemoveNoDisplay(currentPic, false);
					addRemoveNoDisplay(nextPic, true);
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
		addRemoveTransparent("pic-info", true);
		hidePicInfo();
		setTimeout(() => {
			addRemoveTransparent("pic-info", false);
		}, defaultTimeout);
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
		}, defaultTimeout);
	}
}

// Fullscreen picture info
function showPicInfo() {
	isPicInfoVisible = true;
	addRemoveNoDisplay("pic-info", false);
	var element = document.getElementById("pic-info-drawer");
	//TODO: transition on first portrait mode open
	addRemoveNoDisplay([element], false);
	setTimeout(() => {
		element.style.bottom = "0";
		element.style.marginRight = "0px";
	}, 20);
}

function hidePicInfo() {
	isPicInfoVisible = false;
	var element = document.getElementById("pic-info-drawer");
	element.style.bottom = "-" + element.getBoundingClientRect().height + "px";
	element.style.marginRight = "-" + element.getBoundingClientRect().width + "px";
	setTimeout(() => {
		addRemoveNoDisplay([element], true);
		addRemoveNoDisplay("pic-info", true);
	}, defaultTimeout);
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

// Gestures
// Source: https://stackoverflow.com/questions/53192433/how-to-detect-swipe-in-javascript
function startHandleDrag(e, handleId) {
	if(isPortraitMode()){
		isHandleGrabbed = true;
		grabbedHandleId = handleId
		initialYHandle = e.touches[0].clientY;
	}
}

function endHandleDrag(e) {
	if(isPortraitMode()){
		if (isHandleGrabbed && grabbedHandleId) {
			isHandleGrabbed = false;
			var currentY = e.changedTouches[0].clientY;
			if (currentY > initialYHandle) {
				if(grabbedHandleId == "pic-info-handle"){
					hidePicInfo();
				} else {
					showORegionInfo(true);
				}
			} else if (currentY < initialYHandle) {
				if(grabbedHandleId == "rgn-info-handle"){
					hideORegionInfo(true);
				}
			}
			initialYHandle = null;
			grabbedHandleId = null;
		}
	}
}

function startFullscreenSwipe(e) {
	if(isPortraitMode()){
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

	if(!isPortraitMode()){
		return;
	}

	if (e.touches.length == 1) {
		var currentX = e.touches[0].clientX;
		var currentY = e.touches[0].clientY;

		var diffX = initialX - currentX;
		var diffY = initialY - currentY;

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

// Popup
function openInfoPopup() {
	isPopupVisible = true;
	addRemoveTransparent(["site-info-popup", "popup-bg"], false);
	document.getElementById("info-popup").style.visibility = "visible";
	document.getElementById("site-info-popup").classList.add("popup-width");
	setTimeout(() => {
		addRemoveNoDisplay("site-info", false);
		addRemoveTransparent("site-info", false);
		document.getElementById("site-info-popup").classList.add("popup-height");
	}, defaultTimeout);
}

function closeInfoPopup(forceClose) {
	if (forceClose) {
		document.getElementById("info-popup").style.visibility = "hidden";
		addRemoveTransparent(["site-info", "site-info-popup", "popup-bg"], true);
		document.getElementById("site-info-popup").classList.remove("popup-height");
		addRemoveNoDisplay("site-info", true);
		document.getElementById("site-info-popup").classList.remove("popup-width");
	} else {
		addRemoveTransparent("site-info", true);
		setTimeout(() => {
			document.getElementById("site-info-popup").classList.remove("popup-height");
			setTimeout(() => {
				addRemoveNoDisplay("site-info", true);
				document.getElementById("site-info-popup").classList.remove("popup-width");
				setTimeout(() => {
					addRemoveTransparent(["site-info-popup", "popup-bg"], true);
					setTimeout(() => {
						document.getElementById("info-popup").style.visibility = "hidden";
					}, defaultTimeout);
				}, defaultTimeout);
			}, defaultTimeout);
		}, defaultTimeout);
	}
}

// Official region info
function spinArrow() {
	document.getElementById("rgn-name-arrow").classList.toggle("arrow-down");
	document.getElementById("rgn-name-arrow").classList.toggle("arrow-up");
}

function showORegionInfo(isForced) {
	isORegionInfoVisible = true;
	addRemoveTransparent("rgn-info-bg", true);
	document.getElementById("rgn-info-bg").style.visibility = "visible";
	if (isForced) {
		if (document.body.scrollTop < document.getElementById("rgn-info").getBoundingClientRect().height) {
			scrollToTop(true);
		} else {
			document.getElementById("rgn-info").style.position = "sticky";
			document.getElementById("rgn-info").style.top = document.getElementById("top-bar").getBoundingClientRect().height;
			addRemoveTransparent("rgn-info-bg", false);
		}
	}
}

function hideORegionInfo(isForced) {
	isORegionInfoVisible = false;
	if (isForced) {
		var rgnInfoOffset = document.getElementById("rgn-info").getBoundingClientRect().height;
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
	}, defaultTimeout);
}

function changeORegionInfoVisibility(isVisible, isForced) {
	if (isORegionInfoVisible == isVisible) {
		return;
	}

	if (isVisible == undefined) {
		isVisible = !isORegionInfoVisible;
	}

	if (isVisible) {
		showORegionInfo(isForced);
	} else {
		hideORegionInfo(isForced);
	}
}

function scrollORegionInfo() {
	if (throttleORegionInfo || !isGalleryVisible) return;
	throttleORegionInfo = true;
	setTimeout(() => {
		let rgnInfoOffset = document.getElementById("rgn-info").getBoundingClientRect().height / 2;
		if (isORegionInfoVisible && document.body.scrollTop > rgnInfoOffset) {
			isORegionInfoVisible = false;
			hideORegionInfo(false);
		} else if (!isORegionInfoVisible && document.body.scrollTop < rgnInfoOffset) {
			isORegionInfoVisible = true;
			showORegionInfo(false);
		}
		throttleORegionInfo = false;
	}, 250);
}

// Main pages and setup
function openGallery() {
	hideLoader();
	scrollToTop(false);
	addRemoveTransparent("map-page", false);
	addRemoveNoDisplay("to-top-btn", false);
}

function changeGalleryVisibility(isVisible) {
	closePrefDropdown();
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
		addRemoveNoDisplay(["gallery", "filter-btn", "map-btn", "info-btn", "rgn-title-btn", "rgn-info", "rgn-info-drawer"], false);
		document.getElementById("rgn-info-bg").style.visibility = "visible";
		addRemoveTransparent("to-top-btn", true);
		if(isPortraitMode()){
			document.getElementById("dates-title").scrollIntoView({block: isPortraitMode() ? "end" : "start"});
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

	isORegionInfoVisible = isGalleryVisible;
	if (!isGalleryVisible) {
	openLoader();
		setTimeout(() => {
			createMap();
			setTimeout(() => {
				openGallery();
			}, 200);
		}, 50);
	}
}

function selectCountry(country, countryColor){
	openLoader();
	addRemoveNoDisplay("map-page", false);
	selectedCountry = country;
	filterCountryData();
	r.style.setProperty('--main-color', getComputedStyle(r).getPropertyValue(countryColor));
	var temp = getComputedStyle(r).getPropertyValue("--main-color").split(", ");
	appColor = "rgb("+ temp [0] +", "+ temp [1] +", "+ temp [2] +")";
	setTimeout(() => {
		openGallery();
	}, 1200);
}

function setupSite() {
	document.getElementById("dates-title").innerHTML = getBilingualText("Dates visited", "訪れた日付");
	document.getElementById("cities-title").innerHTML = getBilingualText("Areas visited", "訪れた所");
	document.getElementById("filter-title").innerHTML = getBilingualText("Filters", "フィルター");
	document.getElementById("keyword-title").innerHTML = getBilingualText("Keyword", "キーワード");
	document.getElementById("tags-title").innerHTML = getBilingualText("Tags", "タグ");
	document.getElementById("camera-title").innerHTML = getBilingualText("Camera", "カメラ");
	document.getElementById("location-title").innerHTML = getBilingualText("Areas", "所");
	document.getElementById("clear-btn").innerHTML = getBilingualText("Clear", "クリアする");
	document.getElementById("submit-btn").innerHTML = getBilingualText("Save", "保存する");
	document.getElementById("pic-info-btn").title = getBilingualText("See picture information", "写真の情報を見る");
	document.getElementById("globe-btn").title = getBilingualText("Return to country picker", "国の選択へ戻る");
	document.getElementById("map-btn").title = getBilingualText("Return to map", "地図に戻る");
	document.getElementById("creator-btn").title = getBilingualText("About the site", "このサイトについて");
	document.getElementById("filter-btn").title = getBilingualText("Filter Pictures", "写真をフィルターする");
	document.getElementById("left-arrow").title = getBilingualText("Previous picture", "前の写真");
	document.getElementById("right-arrow").title = getBilingualText("Next picture", "次の写真");
	document.getElementById("search-eng").title = getBilingualText("Google in English", "英語でググる");
	document.getElementById("search-jp").title = getBilingualText("Google in Japanese", "日本語でググる");
	Array.from(document.getElementsByClassName("close-btn")).forEach(element => {
		element.title = getBilingualText("Close", "閉じる");
	})

	var filterTags = document.getElementById("tags-list");
	tags.sort((a, b) => { 
			let a1 = a.english_name.toLowerCase();
			let b1 = b.english_name.toLowerCase();
		
			if (a1 < b1) {
				return -1;
			}
			if (a1 > b1) {
				return 1;
			}
			return 0;
		}).forEach(tag => {
			var tempBtn = filterTagBtn.cloneNode();
			tempBtn.innerHTML = getBilingualText(tag.english_name, tag.japanese_name);
			tempBtn.id = tag.id + "-tag"
			tempBtn.addEventListener("click", () => {
				toggleTag(tag.id);
				tempBtn.classList.toggle("active");
			});
			filterTags.appendChild(tempBtn);
	});

	Array.from(document.getElementsByClassName("loader-dot")).forEach(dot => {
		dot.addEventListener("animationend", function() {
			addRemoveNoDisplay([dot], true);
		});
	});

	document.addEventListener("contextmenu", function(e){
		if (e.target.nodeName === "IMG") {
			e.preventDefault();
		}
	}, false);

	document.getElementById("load8").addEventListener("animationend", function() {
		addRemoveNoDisplay(document.getElementById("loader"), true);
		addRemoveNoDisplay(Array.from(document.getElementsByClassName("loader-dot")).flatMap(dot => dot.id), false);
	});

	document.getElementById("start-btn-jp").addEventListener("click", function () {
		selectCountry(japan, '--jp-color');
	});
	document.getElementById("start-btn-jp").addEventListener("mouseover", function () {
		addRemoveTransparent("jp-start-icon-c", true);
		var icons = Array.from(document.getElementById("jp-start-icon").getElementsByTagName("img"));
		addRemoveClass(icons, "animated", true);
	});
	document.getElementById("start-btn-jp").addEventListener("mouseout", function () {
		addRemoveTransparent("jp-start-icon-c", false);
		var icons = Array.from(document.getElementById("jp-start-icon").getElementsByTagName("img"));
		addRemoveClass(icons, "animated", false);
	});
	document.getElementById("start-btn-tw").addEventListener("click", function () {
		selectCountry(taiwan, '--tw-color');
	});
	document.getElementById("start-btn-tw").addEventListener("mouseover", function () {
		addRemoveTransparent("tw-start-icon-c", true);
		var icons = Array.from(document.getElementById("tw-start-icon").getElementsByTagName("img"));
		addRemoveClass(icons, "animated", true);
	});
	document.getElementById("start-btn-tw").addEventListener("mouseout", function () {
		addRemoveTransparent("tw-start-icon-c", false);
		var icons = Array.from(document.getElementById("tw-start-icon").getElementsByTagName("img"));
		addRemoveClass(icons, "animated", false);
	});
	document.getElementById("start-btn-au").addEventListener("click", function () {
		selectCountry(australia, '--au-color');
	});
	document.getElementById("start-btn-au").addEventListener("mouseover", function () {
		addRemoveTransparent("au-start-icon-c", true);
		var icons = Array.from(document.getElementById("au-start-icon").getElementsByTagName("img"));
		addRemoveClass(icons, "animated", true);
	});
	document.getElementById("start-btn-au").addEventListener("mouseout", function () {
		addRemoveTransparent("au-start-icon-c", false);
		var icons = Array.from(document.getElementById("au-start-icon").getElementsByTagName("img"));
		addRemoveClass(icons, "animated", false);
	});
	document.getElementById("start-btn-nz").addEventListener("click", function () {
		selectCountry(newZealand, '--nz-color');
	});
	document.getElementById("start-btn-nz").addEventListener("mouseover", function () {
		addRemoveTransparent("nz-start-icon-c", true);
		var icons = Array.from(document.getElementById("nz-start-icon").getElementsByTagName("img"));
		addRemoveClass(icons, "animated", true);
	});
	document.getElementById("start-btn-nz").addEventListener("mouseout", function () {
		addRemoveTransparent("nz-start-icon-c", false);
		var icons = Array.from(document.getElementById("nz-start-icon").getElementsByTagName("img"));
		addRemoveClass(icons, "animated", false);
	});
	document.getElementById("rgn-drop-down-bg").addEventListener("click", function () { closePrefDropdown(); });
	document.getElementById("rgn-info-bg").addEventListener("click", function () { changeORegionInfoVisibility(false, true); });
	document.getElementById("info-popup-close-btn").addEventListener("click", function () { closeInfoPopup(false); });
	document.getElementById("site-info-popup").addEventListener("click", (event) => {
		event.stopPropagation();
	});
	document.getElementById("to-top-btn").addEventListener("click", function () {
		if (document.body.scrollTop > threshold) {
			scrollToTop(true);
		} else {
			scrollDown();
		}
	});
	document.getElementById("rgn-title-btn").addEventListener("click", function () { togglePrefDropdown() });
	document.getElementById("filter-btn").addEventListener("click", function () { showFilter(); });
	document.getElementById("filter-popup-bg").addEventListener("click", function () { hideFilter(true); });
	document.getElementById("filter-popup-close-btn").addEventListener("click", function () { hideFilter(false); });
	document.getElementById("keyword-input").addEventListener("input", function () { checkEmptyKeywordInput(); });
	document.getElementById("kw-clear-btn").addEventListener("click", function () { clearKeyword(); });
	document.getElementById("clear-btn").addEventListener("click", function () { clearFilters(); });
	document.getElementById("submit-btn").addEventListener("click", function () { submitFilters(); });
	document.getElementById("pic-info-btn").addEventListener("click", function () { changePicInfoVisibility(); });
	document.getElementById("pic-info-close-btn").addEventListener("click", function () { hidePicInfo(); });
	document.getElementById("popup-bg").addEventListener("click", function () { closeInfoPopup(true); });
	document.getElementById("creator-btn").addEventListener("click", openInfoPopup);
	document.getElementById("globe-btn").addEventListener("click", function () { showStartScreen(); });
	document.getElementById("map-btn").addEventListener("click", function () { changeGalleryVisibility(false); });
	document.getElementById("info-btn").addEventListener("click", function () { changeORegionInfoVisibility(undefined, true); });
	document.getElementById("fullscreen-bg").addEventListener("click", function () { closeFullscreen(true) });
	document.getElementById("fullscreen-ctrl").addEventListener("click", function () { closeFullscreen(true) });
	document.getElementById("left-arrow").addEventListener("click", (event) => {
		event.stopPropagation();
	});
	document.getElementById("fullscreen-pic").addEventListener("click", (event) => {
		event.stopPropagation();
	});
	document.getElementById("right-arrow").addEventListener("click", (event) => {
		event.stopPropagation();
	});
	document.getElementById("left-arrow").addEventListener("click", function () { changeFullscreenPicture(false); });
	document.getElementById("right-arrow").addEventListener("click", function () { changeFullscreenPicture(true); });
	document.getElementById("pic-info-bg").addEventListener("click", function () { hidePicInfo(); });
	document.getElementById("pic-info-drawer").addEventListener("click", (event) => {
		event.stopPropagation();
	});
	document.getElementById("country-map-mini").addEventListener("load", filterMiniMap);
	document.getElementById("country-map").addEventListener("load", colourMap);
	document.getElementById("rgn-info-handle").addEventListener("touchstart", e => { startHandleDrag(e,"rgn-info-handle") }, false);
	document.getElementById("pic-info-handle").addEventListener("touchstart", e => { startHandleDrag(e,"pic-info-handle") }, false);
	document.addEventListener("touchend", endHandleDrag, false);

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
			} else if (!isPicInfoVisible && event.key == "ArrowUp"){
				showPicInfo();
			} else if (isPicInfoVisible && event.key == "ArrowDown"){
				hidePicInfo();
			}
		}
	});

	var swipeContainer = document.getElementById("fullscreen");
	swipeContainer.addEventListener("touchstart", startFullscreenSwipe, false);
	swipeContainer.addEventListener("touchmove", moveFullscreenSwipe, false);
	
	// currently remove because it will not work on Apple
	document.getElementById("pic-info-details").addEventListener("touchstart", (event) => {
		event.stopPropagation();
	});
	document.getElementById("pic-info-details").addEventListener("touchmove", (event) => {
		event.stopPropagation();
	});

	window.onscroll = function () {
		showHideFloatingBtn();
		scrollORegionInfo();
	};
}

// Loading data
function openLoader() {
	addRemoveTransparent(["top-bar", "map-page"], true);
	addRemoveTransparent("start-screen", true);
	addRemoveNoDisplay("loader", false);
	addRemoveTransparent("loader", false);
	for (let i = 1; i <= 8; i++) {
		document.getElementById("load" + i).style.animationIterationCount = "infinite";
		addRemoveNoDisplay("load" + i, false);
	}
	
	setTimeout(() => {
		addRemoveNoDisplay("start-screen", true);
	}, defaultTimeout);
}

function hideLoader() {
	addRemoveTransparent("loader", true);
	addRemoveTransparent("top-bar", false);
	document.body.style.overflowY = "auto";
	setTimeout(() => {
		addRemoveNoDisplay("loader", true);
		addRemoveTransparent("loader", false);
	}, defaultTimeout);
}

function filterCountryData() {
	if (allData != null && selectedCountry != null) {
		data = allData.find(country => {return country.id == selectedCountry;})
		data.region_groups.forEach(rgnGrp => {
			rgnGrp.regions.forEach(rgn => {
				if (rgn.image_list != null) {
					rgn.image_list.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
				}
			});
		});

		countryTitle = getBilingualText(data.english_name, data.japanese_name);
		document.getElementById("main-title").innerHTML = countryTitle;
		document.getElementById("map-instructions").innerHTML = getBilingualText(
			"Select a " + data.official_region_name_english + " to see pictures from that location.", 
			data.official_region_name_japanese + "を選択して、その地域の写真を表示する。");
		document.getElementById("rgn-title-btn").title = getBilingualText("Change " + data.official_region_name_english, data.official_region_name_japanese + "を切り替える");
		document.getElementById("info-btn").title = getBilingualText("Toggle "  + data.official_region_name + " info", data.official_region_name_japanese + "の情報をトグル");
		document.getElementById("description-title").innerHTML = getBilingualText("About", data.official_region_name_japanese + "について");

		createRgnList();
		setTimeout(() => {
			createMap();
		}, 50);
	}
}

function stopLoader(){
	setTimeout(() => {
		var iterationCount = Math.ceil((new Date() - now) / 1000 / 2);
		for (let i = 1; i <= 8; i++) {
			document.getElementById("load" + i).style.animationIterationCount = iterationCount;
		}
	}, 100);
}

function showFirstStartScreen(){
	document.getElementById("load8").addEventListener("animationend", showStartScreen);
	stopLoader();
}

function showStartScreen(){
	scrollToTop(false);
	addRemoveNoDisplay(["loader", "to-top-btn"], true);
	selectedCountry = null;
	selectedORegion = null;
	addRemoveTransparent("map-page", true);
	setTimeout(() => {
		addRemoveNoDisplay("map-page", true);		
	}, defaultTimeout);
	document.getElementById("load8").removeEventListener("animationend", showStartScreen);
	addRemoveNoDisplay("start-screen", false);
	setTimeout(() => {
		addRemoveTransparent("start-screen", false);
	}, 10);
}

function fetchData() {
	var hasError = false;

	fetch("https://raw.githubusercontent.com/kymlu/travel-memories/main/js/data.json")
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
				showFirstStartScreen();
			}
		});
}

function retry() {
	addRemoveNoDisplay("error-btn", true);
	for (let i = 1; i <= 8; i++) {
		document.getElementById("load" + i).style.animationPlayState = "running";
	}
	fetchData();
}

function showDataLoadError() {
	setTimeout(() => {
		addRemoveNoDisplay("error-btn", false);
		addRemoveTransparent("error-btn", false);
		for (let i = 1; i <= 8; i++) {
			document.getElementById("load" + i).style.animationPlayState = "paused";
		}
	}, defaultTimeout);
}

function main() {
	now = new Date();
	scrollToTop(false);
	createTemplates();
	setupSite();
	fetchData();
}

main();
