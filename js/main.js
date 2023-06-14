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
let isLoading = true;
let selectedPref = null;
let selectedPicture = null;
let selectedPictureIndex = 0;
let isPopupVisible = false;
let isFilterVisible = false;
let isGalleryVisible = false;
let isFullscreen = false;
let isPrefInfoVisible = false;
let throttlePrefInfo = false;
let isPicInfoVisible = true;
let data = null;
let japanTitle = null;
let now = null;
let isHandleGrabbed = false;
let grabbedHandleId = null;
let searchTerm = ["", ""];
let isNewFullscreenInstance = true;
let isNewPref = true;
let lastSwipeTime = null;
let isToTopVisible = false;
let filterKeyword = "";
let filterLocationsList = [];
let filterTagsList = [];
let tempFilterLocations = [];
let tempFilterTags = [];
let visibleImgs = [];

const defaultTimeout = 500;
const jpnTimeDiff = -540;
const threshold = 500;

let initialX = null;
let initialY = null;
let initialYHandle = null;

const monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];

const tags = [
	{
		"id": "animal",
		"english_name": "Animals",
		"japanese_name": "動物"
	},
	{
		"id": "attractions",
		"english_name": "Attractions",
		"japanese_name": "観光地"
	},
	{
		"id": "art",
		"english_name": "Art",
		"japanese_name": "美術"
	},
	{
		"id": "event",
		"english_name": "Events",
		"japanese_name": "イベント"
	},
	{
		"id": "food",
		"english_name": "Food",
		"japanese_name": "食べ物"
	},
	{
		"id": "nature",
		"english_name": "Nature",
		"japanese_name": "自然"
	},
	{
		"id": "relax",
		"english_name": "Daily life",
		"japanese_name": "日常"
	},
	{
		"id": "town",
		"english_name": "Around town",
		"japanese_name": "街中で"
	}
];

let polaroid, polaroidImgFrame, polaroidImg, polaroidCaption, polaroidCaptionText, polaroidCaptionContainer, polaroidDate, singleDate;
let filterTagButton;

let appColor = "#be0029";

// General
function isPortraitMode(){
	return window.innerHeight > window.innerWidth;
}

function shuffle(array) {
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {

		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

function scrollToTop(isSmooth){
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: isSmooth ? 'smooth' : "instant"
	});
}

function scrollDown(){
	document.getElementById("main-title").scrollIntoView({
		behavior: 'smooth',
		block: "start"
	});
}

function showHideFloatingBtn() {
	var btn = document.getElementById("to-top-btn");
	if (document.body.scrollTop > threshold) {
		if(isGalleryVisible && !isToTopVisible){
			btn.classList.remove("arrow-down");
			btn.classList.add("arrow-up");
			removeNoDisplay([btn]);
			btn.classList.remove("transparent");
			isToTopVisible = true;
		} else if (!isGalleryVisible){
			btn.classList.remove("arrow-down");
			btn.classList.add("arrow-up");
		}
	} else if (document.body.scrollTop <= threshold) {
		if (isGalleryVisible && isToTopVisible) {
			btn.classList.remove("arrow-down");
			btn.classList.add("arrow-up");
			btn.classList.add("transparent");
			setTimeout(() => { addNoDisplay([btn]); }, defaultTimeout)
			isToTopVisible = false;
		} else if (!isGalleryVisible) {
			btn.classList.remove("arrow-up");
			btn.classList.add("arrow-down");
		}
	}
}

function addNoDisplay(elements){
	if (typeof (elements) == 'string') {
		document.getElementById(elements).classList.add("no-display")
	} else {
		if (elements && elements.length > 0) {
			if (typeof (elements[0]) == 'string') {
				elements.forEach(element => document.getElementById(element).classList.add("no-display"));
			} else {
				elements.forEach(element => element.classList.add("no-display"));
			}
		}
	}
}

function removeNoDisplay(elements) {
	if (typeof (elements) == 'string') {
		document.getElementById(elements).classList.remove("no-display")
	} else {
		if (elements && elements.length > 0) {
			if (typeof (elements[0]) == 'string') {

				elements.forEach(element => document.getElementById(element).classList.remove("no-display"));
			} else {
				elements.forEach(element => element.classList.remove("no-display"));
			}
		}
	}
}

// Text
function getBilingualText(english, japanese) {
	return english + " – " + japanese;
}

function getPictureDate(date, picOffset){
	const localOffset = now.getTimezoneOffset();
	return new Date(date.getTime() - (picOffset - localOffset) * 60000);
}

function getEnglishDate(date, isFullDate) {
	var hours = date.getHours();
	return monthNames[date.getMonth()] + " " + 
		date.getDate() + ", " + 
		date.getFullYear() + 
		(isFullDate ? 
			" " + (hours > 12 ? hours - 12 : hours).toString() + ":" + 
			date.getMinutes().toString().padStart(2, "0") + ":" + 
			date.getSeconds().toString().padStart(2, "0")  + 
			(hours >= 12 ? "PM" : "AM") 
			: "");
}

function getJapaneseDate(date, isFullDate) {
	var hours = date.getHours();
	return date.getFullYear() + "年" + 
		(date.getMonth() + 1) + "月" + 
		date.getDate() + "日" + 
		(isFullDate ? 
			" " + (hours >= 12 ? "午後" : "午前") + 
			(hours > 12 ? hours - 12 : hours).toString() + ":" + 
			date.getMinutes().toString().padStart(2, "0") + ":" + 
			date.getSeconds().toString().padStart(2, "0") 
			: "");
}
// Prefecture List
function createPrefList() {
	// Create templates
	const prefList = document.getElementById("pref-list");
	prefList.replaceChildren();

	const dropDownPrefList = document.getElementById("pref-drop-down");
	dropDownPrefList.replaceChildren();

	const regionGroup = document.createElement("div");
	regionGroup.classList.add("region-group");

	const regionTitle = document.createElement("div");
	regionTitle.classList.add("region-text");

	const visitedPref = document.createElement("div");
	visitedPref.classList.add("prefecture-text", "visited-pref-text");

	const unvisitedPref = document.createElement("div");
	unvisitedPref.classList.add("prefecture-text", "locked-pref-text");

	const regionDrop = document.createElement("div");
	regionDrop.classList.add("region-text", "regular-text");
	
	const prefDrop = document.createElement("div");
	prefDrop.classList.add("prefecture-text", "regular-text");

	// Iterate each region and prefecture, sort by visited/not visited
	data.forEach(region => {
		const newPref = regionGroup.cloneNode();
		const newPrefTitle = regionTitle.cloneNode();
		newPrefTitle.innerHTML = getBilingualText(region.english_name, region.japanese_name);
		newPrefTitle.title = getBilingualText("See images from this prefecture", "この地域の写真を表示する");
		newPref.appendChild(newPrefTitle);

		var ddRegion = regionDrop.cloneNode();
		ddRegion.innerHTML = getBilingualText(region.english_name, region.japanese_name);
		ddRegion.id = region.english_name + "-dropdown";
		dropDownPrefList.appendChild(ddRegion);
		region.prefectures.forEach(prefecture => {
			var ddPref = prefDrop.cloneNode();
			ddPref.innerHTML = getBilingualText(prefecture.english_name, prefecture.japanese_name);
			ddPref.id = prefecture.english_name + "-dropdown";
			if (prefecture.visited) {
				const prefNode = visitedPref.cloneNode();
				prefNode.innerHTML = getBilingualText(prefecture.english_name, prefecture.japanese_name);
				prefNode.addEventListener("click", function () {
					selectPref(prefecture);
				}, false);
				newPref.appendChild(prefNode);

				ddPref.classList.add("visited-pref-text");
				ddPref.addEventListener("click", function () {
					selectPref(prefecture);
				}, false);
			} else {
				const prefNode = unvisitedPref.cloneNode();
				prefNode.innerHTML = getBilingualText(prefecture.english_name, prefecture.japanese_name);
				newPref.appendChild(prefNode);
				ddPref.classList.add("locked-pref-text");
			}
			
			dropDownPrefList.appendChild(ddPref);
			});
		prefList.appendChild(newPref);
	});
}

// Map
function colourMap() {
	const svgObj = document.getElementById("japan-map");
	const svgDoc = svgObj.contentDocument;
	const prefList = data.flatMap(region => region.prefectures);

	prefList.forEach(pref => {
		const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
		if (pref.visited) {
			// CSS won't work on document objects
			prefImg.title = getBilingualText("See images from this prefecture", "この地域の写真を表示する");
			prefImg.setAttribute("fill", appColor);
			prefImg.setAttribute("stroke", "none");
			prefImg.setAttribute("cursor", "pointer");
			prefImg.setAttribute("transition", "opacity 0.3 ease-in-out");
			prefImg.addEventListener("click", function () {
				selectPref(pref);
				document.getElementById("main-title").innerHTML = getBilingualText(pref.english_name, pref.japanese_name);
			});
			prefImg.addEventListener("mouseover", () => {
				prefImg.setAttribute("opacity", "50%");
				hoveredRegion = pref.english_name;
				document.getElementById("main-title").innerHTML = getBilingualText(pref.english_name, pref.japanese_name);
			});

			prefImg.addEventListener("mouseout", () => {
				prefImg.setAttribute("opacity", "100%");
				hoveredRegion = "";
				document.getElementById("main-title").innerHTML = japanTitle;
			});
		} else {
			prefImg.setAttribute("fill", "lightgray");
		}
	});
}

function createMap() {
	const svgObj = document.getElementById("japan-map");
	svgObj.data = "img/japan.svg";
}

// Photo gallery
function createTemplates() {
	// sample polaroid
	polaroid = document.createElement("div");
	polaroid.classList.add("polaroid-frame");
	polaroid.classList.add("opacity-transform-transition");
	polaroid.classList.add("transparent");
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

	filterTagButton = document.createElement("button");
	filterTagButton.classList.add("filter-opt");
}

function filterMiniMap() {
	// get the selected prefecture only
	const svgObj = document.getElementById("japan-map-mini");
	const svgDoc = svgObj.contentDocument;
	const prefList = data.flatMap(region => region.prefectures);

	prefList.forEach(pref => {
		const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
		if (pref.english_name != selectedPref.english_name) {
			prefImg.setAttribute("fill", "none");
			prefImg.setAttribute("stroke", "none");
		} else {
			prefImg.setAttribute("fill", appColor);
			prefImg.setAttribute("stroke", "none");
		}
	});

	// show the map
	const japanImg = svgDoc.getElementById("japan-img");
	japanImg.setAttribute("viewBox", selectedPref.viewbox);
	setTimeout(() => {
		svgObj.classList.remove("transparent");
	}, 50);
}

function editMiniMap() {
	const svgObj = document.getElementById("japan-map-mini");
	svgObj.classList.add("transparent");
	setTimeout(() => {	
		svgObj.data = "img/japan.svg";
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
				thisPolaroid.classList.remove("transparent");
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
	if (selectedPref.image_list.length > 0) {
		let angle = 1; // 1-4 for the rotation class
		selectedPref.image_list.forEach(img => {
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
			pol.classList.add((isLeft ? "right-" : "left-") + angle);

			// add info
			if(img.date){
				let date = getPictureDate(new Date(img.date), jpnTimeDiff);
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
				selectedPicture = img;
				selectedPictureIndex = selectedPref.image_list.indexOf(selectedPicture);
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

			polImg.setAttribute("img-src", img.link ?? "img/" + selectedPref.english_name.toLowerCase() + "/" + img.file_name);
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

function selectPref(newPref) {
	openLoader();
	isNewPref = true;

	if (selectedPref) {
		document.getElementById(selectedPref.english_name + "-dropdown").classList.remove("active");
	}
	document.getElementById(newPref.english_name + "-dropdown").classList.add("active");

	selectedPref = newPref;
	document.getElementById("pref-name-arrow").classList.add("arrow-down");
	document.getElementById("pref-name-arrow").classList.remove("arrow-up");
	editMiniMap(newPref);
	
	document.getElementById("pref-dates").innerHTML = getBilingualText(selectedPref.dates_english, selectedPref.dates_japanese);
	document.getElementById("pref-cities").innerHTML = selectedPref.areas.map(area => {
		return getBilingualText(area.english_name, area.japanese_name);
	}
	).sort().join(" | ");
	document.getElementById("pref-desc-eng").innerHTML = selectedPref.description_english;
	document.getElementById("pref-desc-jp").innerHTML = selectedPref.description_japanese;
	document.getElementById("pref-name").innerHTML = getBilingualText(selectedPref.english_name, selectedPref.japanese_name);
	document.getElementById("dates-title").scrollIntoView({block: isPortraitMode() ? "end" : "start"});

	var filterLocations = document.getElementById("location-list");
	filterLocations.replaceChildren();
	selectedPref.areas.sort((a, b) => { 
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
		var tempButton = filterTagButton.cloneNode();
		tempButton.id = area.id + "-tag";
		tempButton.innerHTML = getBilingualText(area.english_name, area.japanese_name);
		tempButton.addEventListener("click", () => {
			toggleLocation(area.id);
			tempButton.classList.toggle("active");
		});
		filterLocations.appendChild(tempButton);
	});

	var filterTags = Array.from(document.getElementById("tags-list").getElementsByClassName("filter-opt"));
	var presentTags = selectedPref.image_list.flatMap(x => {return x.tags});
	filterTags.forEach(tag => {
		var id = tag.id.replace("-tag", "");
		if(presentTags.includes(id)){
			removeNoDisplay([tag]);
		} else {
			addNoDisplay([tag]);
		}
		tag.classList.remove("active");
	});
	clearFilters();
	visibleImgs = [];
	filterLocationsList = [];
	filterTagsList = [];
	createGallery();
	changeGalleryVisibility(true);
	hideLoader();
}

function togglePrefDropdown() {
	document.getElementById("pref-drop-down-container").classList.toggle("no-display");
	spinArrow();
	if(isNewPref){
		isNewPref = false;
		document.getElementById(selectedPref.english_name + "-dropdown").scrollIntoView({ behavior: "smooth", block: "center" });
	}
}

function closePrefDropdown() {
	addNoDisplay("pref-drop-down-container");
	document.getElementById("pref-name-arrow").classList.add("arrow-down");
	document.getElementById("pref-name-arrow").classList.remove("arrow-up");
}

function showPrefDropdown() {
	removeNoDisplay("pref-drop-down-container");
	document.getElementById("pref-name-arrow").classList.remove("arrow-down");
	document.getElementById("pref-name-arrow").classList.add("arrow-up");
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

function showFilter() {
	isFilterVisible = true;
	document.getElementById("img-filter-popup").classList.remove("transparent");
	document.getElementById("filter-popup").style.visibility = "visible";
	document.getElementById("filter-popup-bg").classList.remove("transparent");
	document.getElementById("img-filter-popup").classList.add("popup-width");
	setTimeout(() => {
		removeNoDisplay("filters");
		document.getElementById("filters").classList.remove("transparent");
		document.getElementById("img-filter-popup").classList.add("popup-height");
	}, defaultTimeout);

	document.getElementById("keyword").value = filterKeyword;
	tempFilterLocations = filterLocationsList.slice();
	tempFilterTags = filterTagsList.slice();
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
}

function hideFilter(forceClose) {
	isFilterVisible = false;
	if (forceClose) {
		document.getElementById("filter-popup").style.visibility = "hidden";
		document.getElementById("filters").classList.add("transparent");
		document.getElementById("img-filter-popup").classList.remove("popup-height");
		document.getElementById("img-filter-popup").classList.remove("popup-width");
		removeNoDisplay("filters");
		document.getElementById("img-filter-popup").classList.add("transparent");
		document.getElementById("filter-popup-bg").classList.add("transparent");
	} else {
		document.getElementById("filters").classList.add("transparent");
		setTimeout(() => {
			document.getElementById("img-filter-popup").classList.remove("popup-height");
			setTimeout(() => {
				addNoDisplay("filters");
				document.getElementById("img-filter-popup").classList.remove("popup-width");
				setTimeout(() => {
					document.getElementById("img-filter-popup").classList.add("transparent");
					document.getElementById("filter-popup-bg").classList.add("transparent");
					setTimeout(() => {
						document.getElementById("filter-popup").style.visibility = "hidden";
					}, defaultTimeout);
				}, defaultTimeout);
			}, defaultTimeout);
		}, defaultTimeout);
	}
}

function clearFilters() {
	document.getElementById("keyword").value = "";
	tempFilterLocations = [];
	tempFilterTags = [];
	Array.from(document.getElementById("location-list").getElementsByClassName("active"))
	.forEach(tag => {
		tag.classList.remove("active");
	});
	Array.from(document.getElementById("tags-list").getElementsByClassName("active"))
	.forEach(tag => {
		tag.classList.remove("active");
	});
}

function doesTextIncludeKeyword(text){
	return text && text.toLowerCase().includes(filterKeyword);
}

function includeImage(img) {
	let area = selectedPref.areas.find(x => {return x.id == img.city;});
	let tempTags = tags.filter(tag => img.tags.includes(tag.id) && (doesTextIncludeKeyword(tag.english_name) || doesTextIncludeKeyword(tag.japanese_name)));
	return (filterKeyword == "" ||
		doesTextIncludeKeyword(img.description_english) ||
		doesTextIncludeKeyword(img.description_japanese) ||
		doesTextIncludeKeyword(img.location_english) ||
		doesTextIncludeKeyword(img.location_japanese) ||
		doesTextIncludeKeyword(area.english_name) ||
		doesTextIncludeKeyword(area.japanese_name) || 
		tempTags.length > 0) &&
		(filterLocationsList.length == 0 || filterLocationsList.includes(img.city)) &&
		(filterTagsList.length == 0 || filterTagsList.filter(value => img.tags.includes(value)).length > 0);
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

	selectedPref.image_list.forEach(img => {
		if(includeImage(img)){
			removeNoDisplay([allPolaroids[i]]);
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
			addNoDisplay([allPolaroids[i]]);
		}
		i++;
	})
	if(visibleImgs.length == 0){
		let temp = document.createElement("div");
		temp.id = "none";
		temp.display.margin = "-125px";
		temp.innerHTML = getBilingualText("No pictures available","写真はありません");
		document.getElementById("gallery").appendChild(temp);
	}
	
}

function submitFilters() {
	filterKeyword = document.getElementById("keyword").value;
	filterLocationsList = tempFilterLocations.slice();
	filterTagsList = tempFilterTags.slice();
	filterImages();
	hideFilter();
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
			var ind = visibleImgs.indexOf(selectedPictureIndex);
			if (ind == visibleImgs.length - 1) {
				selectedPictureIndex = visibleImgs[0];
			} else {
				selectedPictureIndex = visibleImgs[ind + 1];
			}
		} else {
			if (selectedPictureIndex == (selectedPref.image_list.length - 1)) {
				selectedPictureIndex = 0;
			} else {
				selectedPictureIndex++;
			}
		}
	} else {
		if (visibleImgs.length > 0) {
			var ind = visibleImgs.indexOf(selectedPictureIndex);
			if (ind == 0) {
				selectedPictureIndex = visibleImgs[visibleImgs.length - 1];
			} else {
				selectedPictureIndex = visibleImgs[ind - 1];
			}
		} else {
			if (selectedPictureIndex == 0) {
				selectedPictureIndex = selectedPref.image_list.length - 1;
			} else {
				selectedPictureIndex--;
			}
		}
	}
	selectedPicture = selectedPref.image_list[selectedPictureIndex];
	setFullscreenPicture(isForward);
}

function setFullscreenInfo(){
	if(selectedPicture.date){
		let date = getPictureDate(new Date(selectedPicture.date), jpnTimeDiff);
		document.getElementById("fullscreen-eng-date").innerHTML = getEnglishDate(date, true);
		document.getElementById("fullscreen-jp-date").innerHTML = getJapaneseDate(date, true);
	} else {
		document.getElementById("fullscreen-eng-date").innerHTML = "Unknown date";
		document.getElementById("fullscreen-jp-date").innerHTML = "不明な日付";
	}
	let area = selectedPref.areas.find(function (area) { return area.id == selectedPicture.city });
	searchTerm[0] = (selectedPicture.location_english ? (selectedPicture.location_english + ", ") : "") + (area.english_name ?? "");
	document.getElementById("fullscreen-eng-city").innerHTML = searchTerm[0];
	document.getElementById("search-eng").addEventListener("click", searchEnglish);
	searchTerm[1] = (area.japanese_name ?? "") + (selectedPicture.location_japanese ? ("　" + selectedPicture.location_japanese + "") : "");
	document.getElementById("fullscreen-jp-city").innerHTML = searchTerm[1];
	document.getElementById("search-jp").addEventListener("click", searchJapanese);

	
	if (selectedPicture.description_english) {
		removeNoDisplay("fullscreen-eng-caption");
		document.getElementById("fullscreen-eng-caption").innerHTML = selectedPicture.description_english;
	} else {
		addNoDisplay("fullscreen-eng-caption");
	}
	if (selectedPicture.description_japanese) {
		removeNoDisplay("fullscreen-jp-caption");
		document.getElementById("fullscreen-jp-caption").innerHTML = selectedPicture.description_japanese;
	} else {
		addNoDisplay("fullscreen-jp-caption");
	}

	if (selectedPicture.camera_model) {
		removeNoDisplay("camera-info");
		document.getElementById("camera-info").innerHTML = selectedPicture.camera_model;
	} else {
		addNoDisplay("camera-info");
	}
	
	if (selectedPicture.lens) {
		removeNoDisplay("lens-info");
		document.getElementById("lens-info").innerHTML = selectedPicture.lens;
	} else {
		addNoDisplay("lens-info");
	}
	
	document.getElementById("technical-info").replaceChildren();
	var tempElement = null;
	if(selectedPicture.f_stop){
		tempElement = document.createElement("div");
		tempElement.innerHTML = "\u0192/" + selectedPicture.f_stop;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if(selectedPicture.exposure){
		tempElement = document.createElement("div");
		tempElement.innerHTML = selectedPicture.exposure;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if(selectedPicture.iso){
		tempElement = document.createElement("div");
		tempElement.innerHTML = "iso " + selectedPicture.iso;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	// if(selectedPicture.focal_length){
	// 	tempElement = document.createElement("div");
	// 	tempElement.innerHTML = selectedPicture.focal_length;
	// 	document.getElementById("technical-info").appendChild(tempElement);
	// }

	selectedPicture.tags.map(x => { return tags.find(function (t) { return t.id == x }) })
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

	var src = selectedPicture.link ?? "img/" + selectedPref.english_name.toLowerCase() + "/" + selectedPicture.file_name;

	if (isNewFullscreenInstance || (new Date() - lastSwipeTime) < 300) {
		document.getElementById("fullscreen-pic").src = src;
		isNewFullscreenInstance = false;
	} else {
		var nextPic = document.getElementById("fullscreen-pic-next");
		var currentPic = document.getElementById("fullscreen-pic");
		
		addNoDisplay(nextPic);
		nextPic.src = src;
		nextPic.classList.add(isForward ? "fullscreen-pic-right":"fullscreen-pic-left");

		setTimeout(() => {
			removeNoDisplay(nextPic);
			nextPic.classList.remove("transparent");
			nextPic.classList.remove(isForward ? "fullscreen-pic-right" : "fullscreen-pic-left");
			currentPic.classList.add(isForward ? "fullscreen-pic-left" : "fullscreen-pic-right");
			currentPic.classList.add("transparent");

			setTimeout(() => {
				addNoDisplay(currentPic);
				currentPic.src = src;
				currentPic.classList.remove(isForward ? "fullscreen-pic-left" : "fullscreen-pic-right");
				currentPic.classList.remove("transparent");
				setTimeout(() => {
					removeNoDisplay(currentPic);
					addNoDisplay(nextPic);
					nextPic.classList.add("transparent");
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
		hidePicInfo();
	}
	isFullscreen = true;
	document.body.style.overflowY = "hidden";
	document.getElementById("fullscreen").style.visibility = "visible";
	document.getElementById("fullscreen").classList.remove("transparent");
	document.getElementById("fullscreen-bg").classList.remove("transparent");
}

function closeFullscreen(forceClose) {
	isFullscreen = false;
	document.body.style.overflowY = "auto";
	if (forceClose) {
		document.getElementById("fullscreen").style.visibility = "hidden";
		document.getElementById("fullscreen").classList.add("transparent");
		document.getElementById("fullscreen-bg").classList.add("transparent");
	} else {
		document.getElementById("fullscreen").classList.add("transparent");
		document.getElementById("fullscreen-bg").classList.add("transparent");
		setTimeout(() => {
			document.getElementById("fullscreen").style.visibility = "hidden";
		}, defaultTimeout);
	}
}

// Fullscreen picture info
function showPicInfo() {
	isPicInfoVisible = true;
	removeNoDisplay("pic-info");
	var element = document.getElementById("pic-info-drawer");
	//TODO: transition on first portrait mode open
	removeNoDisplay([element]);
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
		addNoDisplay([element]);
		addNoDisplay("pic-info");
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
function startHandleDrag(e) {
	isHandleGrabbed = true;
	initialYHandle = e.touches[0].clientY;
}

function endHandleDrag(e) {
	if (isHandleGrabbed) {
		isHandleGrabbed = false;
		var currentY = e.changedTouches[0].clientY;
		if (currentY > initialYHandle) {
			showPrefInfo(true);
		} else if (currentY < initialYHandle) {
			hidePrefInfo(true);
		}
		initialYHandle = null;
	}
}

function startFullscreenSwipe(e) {
	if (e.touches.length == 1) {
		initialX = e.touches[0].clientX;
		initialY = e.touches[0].clientY;
	}
}

function moveFullscreenSwipe(e) {
	if (initialX === null) {
		return;
	}

	if (initialY === null) {
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
			} else {
				if (isPicInfoVisible && document.getElementById("pic-info-details").scrollTop == 0) {
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
	document.getElementById("site-info-popup").classList.remove("transparent");
	document.getElementById("info-popup").style.visibility = "visible";
	document.getElementById("popup-bg").classList.remove("transparent");
	document.getElementById("site-info-popup").classList.add("popup-width");
	setTimeout(() => {
		removeNoDisplay("site-info");
		document.getElementById("site-info").classList.remove("transparent");
		document.getElementById("site-info-popup").classList.add("popup-height");
	}, defaultTimeout);
}

function closeInfoPopup(forceClose) {
	if (forceClose) {
		document.getElementById("info-popup").style.visibility = "hidden";
		document.getElementById("site-info").classList.add("transparent");
		document.getElementById("site-info-popup").classList.remove("popup-height");
		addNoDisplay("site-info");
		document.getElementById("site-info-popup").classList.remove("popup-width");
		document.getElementById("site-info-popup").classList.add("transparent");
		document.getElementById("popup-bg").classList.add("transparent");
	} else {
		document.getElementById("site-info").classList.add("transparent");
		setTimeout(() => {
			document.getElementById("site-info-popup").classList.remove("popup-height");
			setTimeout(() => {
				addNoDisplay("site-info");
				document.getElementById("site-info-popup").classList.remove("popup-width");
				setTimeout(() => {
					document.getElementById("site-info-popup").classList.add("transparent");
					document.getElementById("popup-bg").classList.add("transparent");
					setTimeout(() => {
						document.getElementById("info-popup").style.visibility = "hidden";
					}, defaultTimeout);
				}, defaultTimeout);
			}, defaultTimeout);
		}, defaultTimeout);
	}
}

// Prefecture info
function spinArrow() {
	document.getElementById("pref-name-arrow").classList.toggle("arrow-down");
	document.getElementById("pref-name-arrow").classList.toggle("arrow-up");
}

function showPrefInfo(isForced) {
	isPrefInfoVisible = true;
	document.getElementById("pref-info-bg").classList.remove("transparent");
	document.getElementById("pref-info-bg").style.visibility = "visible";
	if (isForced) {
		if (document.body.scrollTop < document.getElementById("top-drawer").getBoundingClientRect().height) {
			scrollToTop(true);
		} else {
			document.getElementById("top-drawer").style.position = "sticky";
			document.getElementById("top-drawer").style.top = document.getElementById("top-bar").getBoundingClientRect().height;
			document.getElementById("pref-info-bg").classList.remove("transparent");
		}
	}
}

function hidePrefInfo(isForced) {
	isPrefInfoVisible = false;
	if (isForced) {
		var prefInfoOffset = document.getElementById("top-drawer").getBoundingClientRect().height;
		if (document.body.scrollTop <= prefInfoOffset) {
			window.scrollTo({
				top: prefInfoOffset,
				left: 0,
				behavior: 'smooth'
			});
		}
	}
	document.getElementById("pref-info-bg").classList.add("transparent");
	setTimeout(() => {
		document.getElementById("pref-info-bg").style.visibility = "hidden";
		document.getElementById("top-drawer").style.position = "relative";
		document.getElementById("top-drawer").style.top = "0";
	}, defaultTimeout);
}

function changePrefInfoVisibility(isVisible, isForced) {
	if (isPrefInfoVisible == isVisible) {
		return;
	}

	if (isVisible == undefined) {
		isVisible = !isPrefInfoVisible;
	}

	if (isVisible) {
		showPrefInfo(isForced);
	} else {
		hidePrefInfo(isForced);
	}
}

function scrollPrefInfo() {
	if (throttlePrefInfo || !isGalleryVisible) return;
	throttlePrefInfo = true;
	setTimeout(() => {
		let prefInfoOffset = document.getElementById("top-drawer").getBoundingClientRect().height / 2;
		if (isPrefInfoVisible && document.body.scrollTop > prefInfoOffset) {
			isPrefInfoVisible = false;
			hidePrefInfo(false);
		} else if (!isPrefInfoVisible && document.body.scrollTop < prefInfoOffset) {
			isPrefInfoVisible = true;
			showPrefInfo(false);
		}
		throttlePrefInfo = false;
	}, 250);
}

function openGallery() {
	scrollToTop(false);
	document.getElementById("map-page").classList.remove("transparent");
	hideLoader();
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
		document.getElementById("top-bar").style.position = "sticky";
		document.getElementById("top-bar").style.backgroundColor = "white";
		addNoDisplay(["map-page", "to-top-btn"]);
		removeNoDisplay(["gallery", "filter-btn", "map-btn", "info-btn", "pref-title-btn", "top-drawer", "pref-info"]);
		document.getElementById("pref-info-bg").style.visibility = "visible";
		document.getElementById("to-top-btn").classList.add("transparent");
	} else {
		document.getElementById("top-bar").style.position = "fixed";
		document.getElementById("top-bar").style.backgroundColor = "transparent";
		removeNoDisplay(["map-page", "to-top-btn"]);
		addNoDisplay(["gallery", "filter-btn", "map-btn", "info-btn", "pref-title-btn", "top-drawer", "pref-info"]);
		document.getElementById("pref-info-bg").style.visibility = "hidden";
		document.getElementById("to-top-btn").classList.remove("transparent");
	}
	document.getElementById("pref-info-bg").classList.remove("transparent");

	isPrefInfoVisible = isGalleryVisible;
	if (!isGalleryVisible) {
		document.getElementById("map-page").classList.add("transparent");
		openLoader();
		setTimeout(() => {
			createMap();
			setTimeout(() => {
				openGallery();
			}, 200);
		}, 50);
	}
}

function setupSite() {
	createTemplates();

	japanTitle = getBilingualText("JAPAN", "日本");
	document.getElementById("main-title").innerHTML = japanTitle;
	document.getElementById("map-instructions").innerHTML = getBilingualText(
		"Select a prefecture to see pictures from that location.", 
		"都道府県を選択して、その地域の写真を表示する。");
	document.getElementById("dates-title").innerHTML = getBilingualText("Dates visited", "訪れた日付");
	document.getElementById("cities-title").innerHTML = getBilingualText("Areas visited", "訪れた所");
	document.getElementById("description-title").innerHTML = getBilingualText("About", "都道府県について");
	document.getElementById("filter-title").innerHTML = getBilingualText("Filters", "フィルター");
	document.getElementById("keyword-title").innerHTML = getBilingualText("Keywords", "キーワード");
	document.getElementById("tags-title").innerHTML = getBilingualText("Tags", "タグ");
	document.getElementById("location-title").innerHTML = getBilingualText("Areas", "所");
	document.getElementById("clear-btn").innerHTML = getBilingualText("Clear", "クリアする");
	document.getElementById("submit-btn").innerHTML = getBilingualText("Save", "保存する");
	document.getElementById("pic-info-btn").title = getBilingualText("See picture information", "写真の情報を見る");
	document.getElementById("map-btn").title = getBilingualText("Return to map", "地図に戻る");
	document.getElementById("pref-title-btn").title = getBilingualText("Change prefecture", "都道府県を切り替える");
	document.getElementById("info-btn").title = getBilingualText("Toggle prefecture info", "都道府県の情報をトグル");
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
			var tempButton = filterTagButton.cloneNode();
			tempButton.innerHTML = getBilingualText(tag.english_name, tag.japanese_name);
			tempButton.id = tag.id + "-tag"
			tempButton.addEventListener("click", () => {
				toggleTag(tag.id);
				tempButton.classList.toggle("active");
			});
			filterTags.appendChild(tempButton);
	});

	document.getElementById("loader-btn").addEventListener("click", function () {
		setTimeout(() => {
			openGallery(true);
		}, 50);
	});
	document.getElementById("pref-drop-down-bg").addEventListener("click", function () { closePrefDropdown(); });
	document.getElementById("pref-info-bg").addEventListener("click", function () { changePrefInfoVisibility(false, true); });
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
	document.getElementById("pref-title-btn").addEventListener("click", function () { togglePrefDropdown() });
	document.getElementById("filter-btn").addEventListener("click", function () { showFilter(); });
	document.getElementById("filter-popup-bg").addEventListener("click", function () { hideFilter(true); });
	document.getElementById("filter-popup-close-btn").addEventListener("click", function () { hideFilter(false); });
	document.getElementById("clear-btn").addEventListener("click", function () { clearFilters(); });
	document.getElementById("submit-btn").addEventListener("click", function () { submitFilters(); });
	document.getElementById("pic-info-btn").addEventListener("click", function () { changePicInfoVisibility(); });
	document.getElementById("pic-info-close-btn").addEventListener("click", function () { hidePicInfo(); });
	document.getElementById("popup-bg").addEventListener("click", function () { closeInfoPopup(true); });
	document.getElementById("creator-btn").addEventListener("click", openInfoPopup);
	document.getElementById("map-btn").addEventListener("click", function () { changeGalleryVisibility(false); });
	document.getElementById("info-btn").addEventListener("click", function () { changePrefInfoVisibility(undefined, true); });
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
	document.getElementById("japan-map-mini").addEventListener("load", filterMiniMap);
	document.getElementById("japan-map").addEventListener("load", colourMap);
	document.getElementById("pref-info-handle").parentElement.addEventListener("touchstart", e => { startHandleDrag(e) }, false);
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
			}
		}
	});

	var swipeContainer = document.getElementById("fullscreen");
	swipeContainer.addEventListener("touchstart", startFullscreenSwipe, false);
	swipeContainer.addEventListener("touchmove", moveFullscreenSwipe, false);
	
	document.getElementById("pic-info-details").addEventListener("touchstart", (event) => {
		event.stopPropagation();
	});
	document.getElementById("pic-info-details").addEventListener("touchmove", (event) => {
		event.stopPropagation();
	});

	window.onscroll = function () {
		showHideFloatingBtn();
		scrollPrefInfo();
	};
}

// Loading data
function openLoader() {
	document.getElementById("top-bar").classList.add("transparent");
	document.getElementById("map-page").classList.add("transparent");
	addNoDisplay("loader-btn");
	document.getElementById("loading-screen").style.visibility = "visible";
	document.getElementById("loading-screen").classList.remove("transparent");
	for (let i = 1; i <= 9; i++) {
		document.getElementById("load" + i).style.animationIterationCount = "infinite";
	}
	document.getElementById("map-page").classList.add("transparent");
}

function hideLoader() {
	document.getElementById("top-bar").classList.remove("transparent");
	document.body.style.overflowY = "auto";
	document.getElementById("loading-screen").classList.add("transparent");
	setTimeout(() => {
		document.getElementById("loading-screen").style.visibility = "hidden";
	}, defaultTimeout);
}

function fetchData() {
	var hasError = false;

	fetch("https://raw.githubusercontent.com/kymlu/travel-memories/main/js/data.json")
		.then(response => {
			return response.json();
		}).then(d => {
			data = d;
		}).catch(error => {
			hasError = true;
			showDataLoadError();
			console.error(error);
		}).then(() => {
			if (!hasError && data != null) {
				data.forEach(region => {
					region.prefectures.forEach(pref => {
						if (pref.image_list != null) {
							pref.image_list.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
						}
					});
				});

				createPrefList();
				setTimeout(() => {
					createMap();
				}, 50);

				setTimeout(() => {
					var iterationCount = Math.ceil((new Date() - now) / 1000 / 2);
					for (let i = 1; i <= 9; i++) {
						document.getElementById("load" + i).style.animationIterationCount = iterationCount - (i == 1 ? 1 : 0);
					}
					document.getElementById("load8").addEventListener("animationend", function () {
						removeNoDisplay("loader-btn");
						setTimeout(() => {
							document.getElementById("loader-btn").classList.remove("transparent");
						}, 10);
					});
				}, 100);
			}
		});
}

function retry() {
	addNoDisplay("error-btn");
	for (let i = 1; i <= 9; i++) {
		document.getElementById("load" + i).style.animationPlayState = "running";
	}
	fetchData();
}

function showDataLoadError() {
	setTimeout(() => {
		removeNoDisplay("error-btn");
		document.getElementById("error-btn").classList.remove("transparent");
		for (let i = 1; i <= 9; i++) {
			document.getElementById("load" + i).style.animationPlayState = "paused";
		}
	}, defaultTimeout);
}

function main() {
	now = new Date();
	scrollToTop(false);
	setupSite();
	fetchData();
}

main();
