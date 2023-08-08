// Variables
var root = document.querySelector(':root');

// Loading
let isLoading = true;
let now = null;

// Data
let allData = null;
let data = null;
let countryTitle = null;
let selectedCountry = null;
let imgList = null;
let rgnsList = null;
let areaList = null;

// Booleans
let throttleRegionInfo = false;

let isPopupVisible = false;
let isToTopVisible = false;
let isGalleryVisible = false;
let isRegionInfoVisible = false;
let isFilterVisible = false;
let isSingleRgn = false;
let isNewCountry = true;
let isNewRegionDropdown = true;
let isNewRegionFilter = true;

// Fullscreen
let isFullscreen = false;
let isNewFullscreenInstance = true;
let selectedPic = null;
let selectedPicInd = 0;
let isPicInfoVisible = true;
let searchTermEng = "";
let searchTermJp = "";

// Gestures
let initialX = null;
let initialY = null;
let initialYHandle = null;
let isHandleGrabbed = false;
let grabbedHandleId = null;
let lastSwipeTime = null;

// Filters
let visibleImgs = [];
let filterFavs = false;
let filterKeyword = "";
let filterRgnsList = [];
let tempFilterRgns = [];
let filterAreasList = [];
let tempFilterAreas = [];
let filterTagsList = [];
let tempFilterTags = [];
let filterCameraList = [];
let tempFilterCameras = [];

let seeFromRgnTitle = null;

// Template elements
let polaroid, polaroidPin, polaroidPinFav, polaroidImgFrame, polaroidImg, polaroidCaption, polaroidCaptionText, polaroidCaptionContainer, polaroidDate, singleDate;
let rgnGrpGroup, rgnGrpTitle, visitedRegion, unvisitedRegion, rgnGrpDrop, rgnDrop;
let filterTagBtn, favouritedTag;

// Constants
const loadAnimationTime = 1500;
const defaultTimeout = 500;
const scrollThreshold = 100;
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

// General
function isPortraitMode(){
	return window.innerHeight > window.innerWidth;
}

function sortImgs(a, b){
	return new Date(a.date) - new Date(b.date);
}

function sortByEnglishName(a, b){
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

function flipArrow(arrow, isUp){
	if (isUp == undefined){
		arrow.classList.toggle("arrow-up");
		arrow.classList.toggle("arrow-down");
	} else {
		addRemoveClass(arrow, "arrow-up", isUp);
		addRemoveClass(arrow, "arrow-down", !isUp);
	}
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

function getEnglishDate(date, isFullDate, picOffset) {
	var hours = date.getHours();
	return (isFullDate ? dayNamesEn[date.getDay()] +", " : "") +
		monthNames[date.getMonth()] + " " + 
		date.getDate() + ", " + 
		date.getFullYear() + 
		(isFullDate ? 
			" " + (hours > 12 ? hours - 12 : hours).toString() + ":" + 
			date.getMinutes().toString().padStart(2, "0") + ":" + 
			date.getSeconds().toString().padStart(2, "0")  + 
			(hours >= 12 ? " PM" : " AM") + 
			(picOffset > 0 ? " +" : " -") + 
			Math.floor(picOffset) + ":" + 
			String((picOffset - Math.floor(picOffset)) * 60).padStart(2, "0")
			: "");
}

function getJapaneseDate(date, isFullDate, picOffset) {
	var hours = date.getHours();
	return date.getFullYear() + "年" + 
		(date.getMonth() + 1) + "月" + 
		date.getDate() + "日" + 
		(isFullDate ? 
			"（" + dayNamesJp[date.getDay()] + "）" +
			(hours >= 12 ? "午後" : "午前") + 
			(hours > 12 ? hours - 12 : hours).toString() + ":" + 
			date.getMinutes().toString().padStart(2, "0") + ":" + 
			date.getSeconds().toString().padStart(2, "0")  + 
			(picOffset >= 0 ? "+" : "") + 
			Math.floor(picOffset) + ":" + 
			String((picOffset - Math.floor(picOffset)) * 60).padStart(2, "0")
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
	if (document.body.scrollTop > scrollThreshold) {
		if(isGalleryVisible && !isToTopVisible){
			flipArrow([btn], true);
			addRemoveNoDisplay([btn], false);
			addRemoveTransparent([btn], false);
			btn.title = totop;
			isToTopVisible = true;
		} else if (!isGalleryVisible){
			flipArrow([btn], true);
			btn.title = totop;
		}
	} else if (document.body.scrollTop <= scrollThreshold) {
		if (isGalleryVisible && isToTopVisible) {
			flipArrow([btn], true);
			addRemoveTransparent([btn], true);
			setTimeout(() => { addRemoveNoDisplay([btn], true); }, defaultTimeout)
			isToTopVisible = false;
		} else if (!isGalleryVisible) {
			var pageHeight = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
				document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );

			if (window.innerHeight + scrollThreshold < pageHeight){
				addRemoveNoDisplay([btn], false);
				flipArrow([btn], false);
				btn.title = down;
			} else {
				addRemoveNoDisplay([btn], true);
			}
		}
	}
}

// Official Region List
function createRgnList() {
	const rgnList = document.getElementById("rgn-list");
	rgnList.replaceChildren();

	const dropDownRgnList = document.getElementById("rgn-drop-down");
	dropDownRgnList.replaceChildren();

	if(data.show_unofficial_regions){
		rgnGrpGroup.classList.remove("none");
	} else {
		rgnGrpGroup.classList.add("none");
	}

	// Iterate each unofficial and official region, sort by visited/not visited
	data.region_groups.filter(grp => grp.regions.filter(rgn => rgn.visited).length > 0).forEach(rgnGrp => {
		const newRgnGrp = rgnGrpGroup.cloneNode();
		var ddURegion = rgnGrpDrop.cloneNode();

		if(data.show_unofficial_regions){
			const newRgnTitle = rgnGrpTitle.cloneNode();
			newRgnTitle.innerHTML = getBilingualText(rgnGrp.english_name, rgnGrp.japanese_name);
			newRgnGrp.appendChild(newRgnTitle);
			ddURegion.innerHTML = getBilingualText(rgnGrp.english_name, rgnGrp.japanese_name);
			ddURegion.id = rgnGrp.english_name + "-dropdown";
			dropDownRgnList.appendChild(ddURegion);
		}

		rgnGrp.regions.filter(rgn => rgn.visited).forEach(rgn => {
			var ddRgn = rgnDrop.cloneNode();
			ddRgn.innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
			ddRgn.id = rgn.id + "-dropdown";
			ddRgn.title = seeFromRgnTitle;
			if (rgn.visited) {
				const rgnNode = visitedRegion.cloneNode();
				rgnNode.innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
				rgnNode.title = seeFromRgnTitle;
				rgnNode.addEventListener("click", function () {
					selectRgn(rgn.id);
				}, false);
				newRgnGrp.appendChild(rgnNode);

				ddRgn.classList.add("visited-rgn-text");
				ddRgn.addEventListener("click", function () {
					selectRgn(rgn.id);
				}, false);
			} else {
				const rgnNode = unvisitedRegion.cloneNode();
				rgnNode.innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
				newRgnGrp.appendChild(rgnNode);
				ddRgn.classList.add("locked-rgn-text");
			}
			
			dropDownRgnList.appendChild(ddRgn);
			});
		rgnList.appendChild(newRgnGrp);
	});
}

// Official region selector dropdown
function toggleRgnDropdown() {
	document.getElementById("rgn-drop-down-container").classList.toggle("no-display");
	flipArrow(document.getElementById("rgn-name-arrow"));
	if(isNewRegionDropdown && isSingleRgn){
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
	svgObj.data = "img/country/"+ selectedCountry +".svg";
}

// Photo gallery
function createTemplates() {
	// sample polaroid
	polaroid = document.createElement("div");
	polaroid.classList.add("polaroid-frame", "opacity-transform-transition");
	addRemoveTransparent([polaroid], true);
	polaroid.classList.add("pic-rotate")
	polaroid.title = getBilingualText("Expand image", "画像を拡大する");

	// polaroid pin
	polaroidPin = document.createElement("div");
	polaroidPin.classList.add("polaroid-pin");

	var polaroidPinShine = document.createElement("div");
	polaroidPinShine.classList.add("polaroid-pin-shine");
	polaroidPin.appendChild(polaroidPinShine);

	polaroidPinFav = polaroidPin.cloneNode(true);

	var polaroidPinStar = document.createElement("div");
	polaroidPinStar.classList.add("polaroid-pin-star");
	polaroidPinStar.innerHTML = "&#xf005";
	polaroidPinFav.appendChild(polaroidPinStar);
	
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
	polaroidCaptionText.classList.add("caption-text", "one-line-text");
	polaroidCaptionContainer = document.createElement("div");
	polaroidCaptionContainer.classList.add("polaroid-caption-text-container");

	// filters
	filterTagBtn = document.createElement("button");
	filterTagBtn.classList.add("filter-opt");

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

	visitedRegion = document.createElement("button");
	visitedRegion.classList.add("rgn-txt", "visited-rgn-text", "highlight-btn", "txt-btn");

	unvisitedRegion = document.createElement("div");
	unvisitedRegion.classList.add("rgn-txt", "locked-rgn-text");

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
				if (!isSingleRgn){
					if(rgn.visited){
						rgnImg.setAttribute("fill", appColor);
					} else {
						rgnImg.setAttribute("fill", "lightgrey");
					}
					rgnImg.setAttribute("stroke", "none");
				} else if(rgn.id != rgnsList[0].id) {
					rgnImg.setAttribute("fill", "none");
					rgnImg.setAttribute("stroke", "none");
				} else {
					rgnImg.setAttribute("fill", appColor);
					rgnImg.setAttribute("stroke", "none");
				}
		});

		// show the map
		const countryImg = svgDoc.getElementById(selectedCountry + "-img");
		if (isSingleRgn) { 
			countryImg.setAttribute("viewBox", rgnsList[0].viewbox);
		}
	} catch (error) { 
		console.error(error); 
	} finally {
		setTimeout(() => {
			addRemoveTransparent([svgObj], false);
			hideLoader();
		}, defaultTimeout / 2);
	}
}

function editMiniMap() {
	const svgObj = document.getElementById("country-map-mini");
	addRemoveTransparent([svgObj], true);
	setTimeout(() => {
		svgObj.data = "img/country/" + selectedCountry + ".svg";
	}, 1000);
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
				if(img){
					const src = img.getAttribute("img-src");
					img.setAttribute("src", src);
				}
				setTimeout(() => {
					addRemoveTransparent([thisPolaroid], false);
				}, 75);
				observer.disconnect();
			}
		});
	});
	obs.observe(target);
}

function createPolaroidBase(img){
	// clone all relevant nodes
	let pol = polaroid.cloneNode(true);

	lazyLoadPolaroid(pol);

	return pol;
}

function createPolaroidImg(img) {
	var pol = createPolaroidBase(img);
	let polImgFrame = polaroidImgFrame.cloneNode();
	let polImg = polaroidImg.cloneNode();
	let polCaption = polaroidCaption.cloneNode();
	let polDate = polaroidDate.cloneNode();
	let polDateEn = singleDate.cloneNode();
	let polDateJp = singleDate.cloneNode();
	let polCaptionText = polaroidCaptionContainer.cloneNode();
	let polCaptionTextEn = polaroidCaptionText.cloneNode();
	let polCaptionTextJp = polaroidCaptionText.cloneNode();

	if(img.is_favourite) {
		pol.appendChild(polaroidPinFav.cloneNode(true));
	} else {
		pol.appendChild(polaroidPin.cloneNode(true));
	}

	pol.appendChild(polImgFrame);
	polImgFrame.appendChild(polImg);
	pol.appendChild(polCaption);
	polCaption.appendChild(polDate);
	polDate.appendChild(polDateEn);
	polDate.appendChild(polDateJp);
	polCaption.appendChild(polCaptionText);
	polCaptionText.appendChild(polCaptionTextEn);
	polCaptionText.appendChild(polCaptionTextJp);

	// add info
	if(img.date){
		let date = getPictureDate(new Date(img.date), img.offset);
		polDateEn.innerHTML = getEnglishDate(date, false, img.offset);
		polDateJp.innerHTML = getJapaneseDate(date, false, img.offset);
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
	
	// image
	polImg.setAttribute("img-src", img.link ?? "img/" + selectedCountry + "/" + (isSingleRgn ? rgnsList[0].id : img.rgn.id) + "/" + img.file_name);

	// listeners
	pol.addEventListener("click", function () {
		selectedPic = img;
		selectedPicInd = imgList.indexOf(selectedPic);
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
		setTimeout(() => {
			addRemoveTransparent(polImg, false);			
		}, defaultTimeout);
	}

	return pol;
}

function createPolaroidBlank(rgn){
	var pol = createPolaroidBase();
	pol.title = seeFromRgnTitle;
	
	let polImgFrame = polaroidImgFrame.cloneNode();
	polImgFrame.classList.add("blank");
	polImgFrame.innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
	pol.appendChild(polImgFrame);
	pol.isBlank = true;
	pol.rgnId = rgn.id;

	pol.addEventListener("click", function () {
		selectRgn(rgn.id)
	});

	return pol;
}

function changePolaroidAngle(isLeft, angle){
	isLeft = !isLeft;
	if (isLeft) {
		angle++;
		if (angle > 4) {
			angle = 1;
		}
	}
	return [isLeft, angle];
}

function createGallery() {
	// clear existing
	let gallery = document.getElementById("gallery");
	gallery.replaceChildren();
	let isLeft = false;

	// add pictures
	if (imgList.length > 0) {
		let angle = 1; // 1-4 for the rotation class
		let prevRgn = null;
		imgList.forEach(img => {
			if(!isSingleRgn && (prevRgn == null || prevRgn != img.rgn.id)){
				prevRgn = img.rgn.id;
				var div = createPolaroidBlank(img.rgn);
				// rotate picture
				div.classList.add((isLeft ? "left-" : "right-") + angle);

				// add to screen
				gallery.appendChild(div);

				// change iterators
				var tempAngle = changePolaroidAngle(isLeft, angle); 
				isLeft = tempAngle[0];
				angle = tempAngle[1];
			}
			var pol = createPolaroidImg(img);

			// rotate picture
			pol.classList.add((isLeft ? "left-" : "right-") + angle);

			// add to screen
			gallery.appendChild(pol);

			// change iterators
			var tempAngle = changePolaroidAngle(isLeft, angle); 
			isLeft = tempAngle[0];
			angle = tempAngle[1];
		});
	} else {
		gallery.innerHTML = getBilingualText("No pictures available","写真はありません");
	}
}

// filtering
function setupFilters(){
	if(isSingleRgn){
		addRemoveNoDisplay("filter-rgns", true);
		addRemoveNoDisplay("filter-areas", false);
		var filterAreas = document.getElementById("filter-areas-list");
		filterAreas.replaceChildren();
		areaList.sort(sortByEnglishName).forEach(area => {
			var tempBtn = filterTagBtn.cloneNode();
			tempBtn.id = area.id + "-tag";
			tempBtn.innerHTML = getBilingualText(area.english_name, area.japanese_name);
			tempBtn.addEventListener("click", () => {
				toggleFilter(area.id, tempFilterAreas);
				tempBtn.classList.toggle("active");
			});
			filterAreas.appendChild(tempBtn);
		});
		
		if(areaList.length > 10) {
			toggleFilterGrp("areas", false);
		} else {
			toggleFilterGrp("areas", true);
		}
	} else {
		addRemoveNoDisplay("filter-rgns", false);
		addRemoveNoDisplay("filter-areas", true);
		var filterRgns = document.getElementById("filter-rgns-list");
		filterRgns.replaceChildren();
		rgnsList.sort(sortByEnglishName).forEach(rgn => {
			var tempBtn = filterTagBtn.cloneNode();
			tempBtn.id = rgn.id + "-tag";
			tempBtn.innerHTML = getBilingualText(rgn.english_name, rgn.japanese_name);
			tempBtn.addEventListener("click", () => {
				toggleFilter(rgn.id, tempFilterRgns);
				tempBtn.classList.toggle("active");
			});
			filterRgns.appendChild(tempBtn);
		});
	
		if(rgnsList.length > 10) {
			toggleFilterGrp("rgns", false);
		} else {
			toggleFilterGrp("rgns", true);
		}
	}
	var filterTags = Array.from(document.getElementById("filter-tags-list").getElementsByClassName("filter-opt"));
	var presentTags = new Set(imgList.flatMap(x => {return x.tags}));
	filterTags.forEach(tag => {
		var id = tag.id.replace("-tag", "");
		if(presentTags.has(id)){
			addRemoveNoDisplay([tag], false);
		} else {
			addRemoveNoDisplay([tag], true);
		}
		tag.classList.remove("active");
	});

	if(presentTags.length > 10) {
		toggleFilterGrp("tags", false);
	} else {
		toggleFilterGrp("tags", true);
	}

	var filterCameras = document.getElementById("filter-camera-list");
	filterCameras.replaceChildren();
	var cameraSet = new Set(imgList.map(x => {return x.camera_model})
		.sort()
		.filter(x => x));
	cameraSet.forEach(camera => {
		var tempBtn = filterTagBtn.cloneNode();
		tempBtn.id = camera + "-tag";
		tempBtn.innerHTML = camera;
		tempBtn.addEventListener("click", () => {
			toggleFilter(camera, tempFilterCameras);
			tempBtn.classList.toggle("active");
		});
		filterCameras.appendChild(tempBtn);
	});

	if(cameraSet.length > 10) {
		toggleFilterGrp("camera", false);
	} else {
		toggleFilterGrp("camera", true);
	}
}

function toggleFilter(id, array) {
	if(array.includes(id)){
		array.splice(array.indexOf(id), 2);
	} else {
		array.push(id);
	}
}

function showFilter() {
	if(isNewRegionFilter){
		document.getElementById("filters").scrollTo({
			top: 0,
			left: 0,
		});
		isNewRegionFilter = false;
	}
	isFilterVisible = true;
	addRemoveTransparent(["img-filter-popup", "filter-popup-bg"], false);
	document.getElementById("filter-popup").style.visibility = "visible";
	document.getElementById("img-filter-popup").classList.add("popup-width");
	setTimeout(() => {
		addRemoveNoDisplay("filters", false);
		addRemoveTransparent("filters", false);
		document.getElementById("img-filter-popup").classList.add("popup-height");
	}, defaultTimeout);

	document.getElementById("filter-fav-input").checked = filterFavs;
	document.getElementById("filter-kw-input").value = filterKeyword;
	tempFilterRgns = filterRgnsList.slice();
	tempFilterAreas = filterAreasList.slice();
	tempFilterTags = filterTagsList.slice();
	tempFilterCameras = filterCameraList.slice();
	Array.from(document.getElementById("filter-rgns-list").getElementsByClassName("filter-opt"))
		.forEach(tag => {
			if (tempFilterRgns.includes(tag.id.replace("-tag", ""))) {
				tag.classList.add("active");
			} else {
				tag.classList.remove("active");
			}
		});
	Array.from(document.getElementById("filter-areas-list").getElementsByClassName("filter-opt"))
		.forEach(tag => {
			if (tempFilterAreas.includes(tag.id.replace("-tag", ""))) {
				tag.classList.add("active");
			} else {
				tag.classList.remove("active");
			}
		});
	Array.from(document.getElementById("filter-tags-list").getElementsByClassName("filter-opt"))
		.forEach(tag => {
			if (tempFilterTags.includes(tag.id.replace("-tag", ""))) {
				tag.classList.add("active");
			} else {
				tag.classList.remove("active");
			}
		});
	Array.from(document.getElementById("filter-camera-list").getElementsByClassName("filter-opt"))
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

function toggleFilterGrp(group, showGrp){
	var headerBtn = document.getElementById("filter-" + group + "-header").querySelector("button");
	if(showGrp == undefined){
		flipArrow(headerBtn);
		document.getElementById("filter-" + group + "-list").classList.toggle("no-display");
	} else if (showGrp) {
		flipArrow([headerBtn], true);
		addRemoveNoDisplay("filter-" + group + "-list", false);
	} else {
		flipArrow([headerBtn], false);
		addRemoveNoDisplay("filter-" + group + "-list", true);
	}
}

function checkEmptyKeywordInput(){
	setTimeout(() => {
		if (document.getElementById("filter-kw-input").value == ""){
			addRemoveNoDisplay("filter-kw-clear-btn", true);
		} else if (document.getElementById("filter-kw-clear-btn").classList.contains("no-display")) {
			addRemoveNoDisplay("filter-kw-clear-btn", false);
		}
	}, 10);
}

function clearKeyword() {
	document.getElementById("filter-kw-input").value = "";
	checkEmptyKeywordInput();
}

function clearFilters() {
	document.getElementById("filter-fav-input").checked = false;

	clearKeyword();
	tempFilterRgns = [];
	tempFilterAreas = [];
	tempFilterTags = [];
	tempFilterCameras = [];
	Array.from(document.getElementById("filter-rgns-list").getElementsByClassName("active"))
	.forEach(tag => {
		tag.classList.remove("active");
	});
	Array.from(document.getElementById("filter-areas-list").getElementsByClassName("active"))
	.forEach(tag => {
		tag.classList.remove("active");
	});
	Array.from(document.getElementById("filter-tags-list").getElementsByClassName("active"))
	.forEach(tag => {
		tag.classList.remove("active");
	});
	Array.from(document.getElementById("filter-camera-list").getElementsByClassName("active"))
	.forEach(tag => {
		tag.classList.remove("active");
	});
}

function doesTextIncludeKeyword(text){
	return text && text.toLowerCase().includes(filterKeyword.toLowerCase());
}

function includeImage(img) {
	let region = isSingleRgn ? rgnsList[0] : rgnsList.find(x => x.id == img.rgn.id);
	let area = areaList.find(x => {return x.id == img.area;});
	let tempTags = tags.filter(tag => img.tags.includes(tag.id) && (doesTextIncludeKeyword(tag.english_name) || doesTextIncludeKeyword(tag.japanese_name)));
	return (!filterFavs || img.is_favourite) && (filterKeyword == "" ||
		doesTextIncludeKeyword(img.description_english) ||
		doesTextIncludeKeyword(img.description_japanese) ||
		doesTextIncludeKeyword(img.location_english) ||
		doesTextIncludeKeyword(img.location_japanese) ||
		doesTextIncludeKeyword(img.location_chinese) ||
		doesTextIncludeKeyword(region?.english_name) ||
		doesTextIncludeKeyword(region?.japanese_name) ||
		doesTextIncludeKeyword(area?.english_name) ||
		doesTextIncludeKeyword(area?.japanese_name) || 
		doesTextIncludeKeyword(img.camera_model) || 
		tempTags.length > 0) &&
		(filterRgnsList.length == 0 || filterRgnsList.includes(region.id)) &&
		(filterAreasList.length == 0 || filterAreasList.includes(area.id)) &&
		(filterTagsList.length == 0 || filterTagsList.filter(value => img.tags.includes(value)).length > 0) &&
		(filterCameraList.length == 0 || filterCameraList.includes(img.camera_model));
}

function filterImages() {
	let angle = 1; // 1-4 for the rotation class
	isLeft = false;
	visibleImgs = [];

	if(document.getElementById("none")){
		document.getElementById("none").remove();
	}
	var allPolaroids = Array.from(document.getElementsByClassName("polaroid-frame"));

	var lastShownRgn = null;
	var prevRgn = null;
	var prevRgnCardInd = null;
	var rgnCt = 0;

	var polInd = 0;
	var imgInd = 0;
	allPolaroids.forEach(pol => {
		if (pol.isBlank){
			if(pol.rgnId != prevRgn){
				addRemoveNoDisplay([pol], false);
				if(rgnCt == 0 && prevRgnCardInd != null){
					// if the previous region has nothing, remove the previous card
					addRemoveNoDisplay([allPolaroids[prevRgnCardInd]], true);

					// if the one before that has something and is the same, remove the current card. Last shown card remains the same.
					if (lastShownRgn == pol.rgnId) addRemoveNoDisplay([pol], true);

				} else if(rgnCt > 0 && prevRgnCardInd != null) {
					// if the previous region has something, that is the last shown card
					lastShownRgn = prevRgn;
					rgnCt = 0;
				} else {
					rgnCt = 0;
				}
				prevRgn = pol.rgnId;
				prevRgnCardInd = polInd;
			} else {
				addRemoveNoDisplay([pol], true);
			}
		} else if(includeImage(imgList[imgInd])){
			addRemoveNoDisplay([pol], false);
			visibleImgs.push(imgInd);
			rgnCt++;
			imgInd++;
		} else {
			addRemoveNoDisplay([pol], true);
			imgInd++;
		}
		
		polInd++;
	});

	if(prevRgnCardInd && rgnCt == 0) addRemoveNoDisplay([allPolaroids[prevRgnCardInd]], true);

	allPolaroids.filter(pol => !pol.classList.contains("no-display"))
		.forEach(pol => {
		var classList = Array.from(pol.classList).filter(className => {return className.includes("left") || className.includes("right")});
			
		if ((classList.filter(className => className.includes("left")).length > 0 && !isLeft) ||
			(classList.filter(className => className.includes("right")).length > 0 && isLeft)) {
			pol.classList.remove(classList[0]);
			pol.classList.add((isLeft ? "left-" : "right-") + angle);
		}
		
		var tempAngle = changePolaroidAngle(isLeft, angle); 
		isLeft = tempAngle[0];
		angle = tempAngle[1];
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
	filterFavs = document.getElementById("filter-fav-input").checked;
	filterKeyword = document.getElementById("filter-kw-input").value;
	filterRgnsList = tempFilterRgns.slice();
	filterAreasList = tempFilterAreas.slice();
	filterTagsList = tempFilterTags.slice();
	filterCameraList = tempFilterCameras.slice();
	filterImages();
	hideFilter(true);
}

// Searching picture location
function search(searchTerm) {
	window.open("https://www.google.com/search?q=" + searchTerm);
}

function searchEnglish() {
	search(searchTermEng);
}

function searchJapanese() {
	search(searchTermJp)
}

// Fullscreen picture
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
			if (selectedPicInd == (imgList.length - 1)) {
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
				selectedPicInd = imgList.length - 1;
			} else {
				selectedPicInd--;
			}
		}
	}
	selectedPic = imgList[selectedPicInd];
	setFullscreenPicture(isForward);
}

function setFullscreenInfo(){
	if(selectedPic.date){
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
						selectedCountry == japan && selectedPic.location_japanese ? (selectedPic.location_japanese + ", ") : 
						selectedCountry == taiwan && selectedPic.location_chinese ? (selectedPic.location_chinese + ", ") : 
						"") + (area.english_name ?? "");
	document.getElementById("fullscreen-eng-city").innerHTML = searchTermEng;
	searchTermJp = (area.japanese_name ?? area.english_name ?? "") + (selectedPic.location_japanese ? ("　" + selectedPic.location_japanese) : 
						(selectedCountry == taiwan && selectedPic.location_chinese) ? ("　" + selectedPic.location_chinese) : 
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
	if(tempElement == null){
		addRemoveNoDisplay("technical-info", true);
	} else {
		addRemoveNoDisplay("technical-info", false);
	}
	
	selectedPic.tags.map(x => { return tags.find(function (t) { return t.id == x }) })
		.sort(sortByEnglishName)
		.forEach(tag => {
			tempElement = document.createElement("div");
			tempElement.classList.add("img-tag");
			tempElement.innerHTML = getBilingualText(tag.english_name, tag.japanese_name);
			document.getElementById("img-tags").appendChild(tempElement);
		});

	if(selectedPic.is_favourite){
		document.getElementById("img-tags").appendChild(favouritedTag);
	}
}

function setFullscreenPicture(isForward) {
	//document.getElementById("search-eng").removeEventListener("click", searchEnglish);
	//document.getElementById("search-jp").removeEventListener("click", searchJapanese);
	document.getElementById("img-tags").replaceChildren();

	var src = selectedPic.link ?? "img/" + selectedCountry + "/" + (isSingleRgn ? rgnsList[0].id : selectedPic.rgn.id) + "/" + selectedPic.file_name;

	if (isNewFullscreenInstance || (new Date() - lastSwipeTime) < 300) {
		document.getElementById("fullscreen-pic").src = src;
		isNewFullscreenInstance = false;
	} else {
		var nextPic = document.getElementById("fullscreen-pic-next");
		var currentPic = document.getElementById("fullscreen-pic");
		
		addRemoveNoDisplay([nextPic], true);
		nextPic.src = src;
		nextPic.classList.add(isForward ? "fullscreen-pic-right":"fullscreen-pic-left");

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
					showRegionInfo(true);
				}
			} else if (currentY < initialYHandle) {
				if(grabbedHandleId == "rgn-info-handle"){
					hideRegionInfo(true);
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

// Site info popup
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

function goToGithub(){
	window.open("https://github.com/kymlu/travel-memories");
}


// Official region info
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

// Show and hide pages
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

function changeMainColor(newColor){
	root.style.setProperty('--main-color', getComputedStyle(root).getPropertyValue(newColor));
	var temp = getComputedStyle(root).getPropertyValue("--main-color").split(", ");
	appColor = "rgb("+ temp [0] +", "+ temp [1] +", "+ temp [2] +")";
}

function selectRgn(rgnId) {
	showLoader();
	if (!isNewCountry && isSingleRgn) {
		document.getElementById(rgnsList[0].id + "-dropdown").classList.remove("active");
	}

	isNewCountry = false;
	isNewRegionDropdown = true;
	isNewRegionFilter = true;

	isSingleRgn = rgnId != undefined && rgnId != null;
	
	if (isSingleRgn){
		var newRegion = data.region_groups.flatMap(x => x.regions).filter(rgn => rgn.id == rgnId)[0];
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
		var visitedRgns = data.region_groups.flatMap(grp => grp.regions.filter(rgn => rgn.visited));
		imgList = visitedRgns.flatMap(rgn => {
			return rgn.image_list.map(img => ({ ...img, rgn: {
				"id": rgn.id,
				"english_name": rgn.english_name,
				"japanese_name": rgn.japanese_name
			}}));
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

	editMiniMap();

	flipArrow("rgn-name-arrow", false);
	setupFilters();
	clearFilters();
	filterFavs = false;
	filterKeyword = "";
	visibleImgs = [];
	filterRgnsList = [];
	filterAreasList = [];
	filterTagsList = [];
	filterCameraList = [];
	createGallery();
	setTimeout(() => {
		changeGalleryVisibility(true);
	}, defaultTimeout);
}

function selectCountry(country, countryColor){
	now = new Date();
	document.getElementById("load-icon").src = "img/icons/" + allData.filter(x => {return x.id == country})[0].symbol + ".svg";
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

// Data loading and setup
function setupSite() {
	[["dates-title", "Dates visited", "訪れた日付"],
		["filter-title", "Filters", "フィルター"],
		["filter-fav-title", "Favourites", "お気に入り"],
		["filter-kw-title", "Keyword", "キーワード"],
		["filter-tags-title", "Tags", "タグ"],
		["filter-camera-title", "Camera", "カメラ"],
		["filter-areas-title", "Areas", "クリアする"],
		["filter-clear-btn", "Clear", "所"],
		["filter-submit-btn", "Save", "保存する"]]
		.forEach(element => {
			document.getElementById(element[0]).innerHTML = getBilingualText(element[1], element[2]);
		});

	document.getElementById("filter-fav-label").childNodes[0].textContent = getBilingualText("Filter favourites", "お気に入りだけを表示する");

	[["pic-info-btn", "See picture information", "写真の情報を見る"],
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

	var filterTags = document.getElementById("filter-tags-list");
	tags.sort(sortByEnglishName).forEach(tag => {
			var tempBtn = filterTagBtn.cloneNode();
			tempBtn.innerHTML = getBilingualText(tag.english_name, tag.japanese_name);
			tempBtn.id = tag.id + "-tag"
			tempBtn.addEventListener("click", () => {
				toggleFilter(tag.id, tempFilterTags);
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
		addRemoveNoDisplay(document.getElementById("loading-screen"), true);
		isLoading = false;
	});

	
	document.getElementById("rgn-drop-down-bg").addEventListener("click", closeRgnDropdown);
	document.getElementById("rgn-info-bg").addEventListener("click", function () { changeRegionInfoVisibility(false, true); });
	document.getElementById("popup-bg").addEventListener("click", function () { closeInfoPopup(true); });
	document.getElementById("site-info-close-btn").addEventListener("click", function () { closeInfoPopup(false); });
	document.getElementById("site-info-popup").addEventListener("click", (event) => {
		event.stopPropagation();
	});
	document.getElementById("to-top-btn").addEventListener("click", function () {
		if (document.body.scrollTop > scrollThreshold) {
			scrollToTop(true);
		} else {
			scrollDown();
		}
	});
	document.getElementById("map-instructions").addEventListener("click", function () { selectRgn(); });
	document.getElementById("rgn-title-btn").addEventListener("click", toggleRgnDropdown);
	document.getElementById("creator-btn").addEventListener("click", openInfoPopup);
	document.getElementById("globe-btn").addEventListener("click", showStartScreen);
	document.getElementById("map-btn").addEventListener("click", function () { changeGalleryVisibility(false); });
	document.getElementById("info-btn").addEventListener("click", function () { changeRegionInfoVisibility(undefined, true); });
	
	document.getElementById("filter-btn").addEventListener("click", showFilter);
	document.getElementById("filter-popup-bg").addEventListener("click", function () { hideFilter(true); });
	document.getElementById("filter-popup-close-btn").addEventListener("click", function () { hideFilter(false); });
	document.getElementById("filter-kw-input").addEventListener("input", checkEmptyKeywordInput);
	document.getElementById("filter-kw-clear-btn").addEventListener("click", clearKeyword);
	document.getElementById("filter-rgns-header").addEventListener("click", function () { toggleFilterGrp("rgns", undefined); });
	document.getElementById("filter-areas-header").addEventListener("click", function () { toggleFilterGrp("areas", undefined); });
	document.getElementById("filter-tags-header").addEventListener("click", function () { toggleFilterGrp("tags", undefined); });
	document.getElementById("filter-camera-header").addEventListener("click", function () { toggleFilterGrp("camera", undefined); });
	document.getElementById("filter-clear-btn").addEventListener("click", clearFilters);
	document.getElementById("filter-submit-btn").addEventListener("click", submitFilters);
	
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
		if(!isLoading){
			showHideFloatingBtn();
			scrollRegionInfo();
		}
	};
}

function filterCountryData() {
	if (allData != null && selectedCountry != null) {
		data = allData.find(country => {return country.id == selectedCountry;})
		data.region_groups.forEach(rgnGrp => {
			rgnGrp.regions.forEach(rgn => {
				if (rgn.image_list != null) {
					rgn.image_list.sort(sortImgs);
				}
			});
		});

		countryTitle = getBilingualText(data.english_name, data.japanese_name);
		document.getElementById("main-title").innerHTML = countryTitle;
		document.getElementById("map-instructions").innerHTML = getBilingualText(
			"Select a " + data.official_region_name_english + " to see pictures from that area, or click here to see all pictures.", 
			data.official_region_name_japanese + "を選択して、その地域の写真を表示する。または、ここをクリックして、すべての写真を表示する。");
		document.getElementById("rgn-title-btn").title = getBilingualText("Change " + data.official_region_name_english, data.official_region_name_japanese + "を切り替える");
		document.getElementById("filter-rgns-title").innerHTML = getBilingualText(data.official_region_name_english, data.official_region_name_japanese);
		document.getElementById("info-btn").title = getBilingualText("Toggle "  + data.official_region_name + " info", data.official_region_name_japanese + "の情報をトグル");
		seeFromRgnTitle = getBilingualText("See images from this " + data.official_region_name_english, "この地域の写真を表示する");

		createRgnList();
		setTimeout(() => {
			createMap();
		}, 50);
	}
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
	}, defaultTimeout);
}

// Loading data
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
	}, defaultTimeout);
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
		}, defaultTimeout);
	}, defaultTimeout);
}

function stopLoader(){
	setTimeout(() => {
		var iterationCount = Math.ceil((new Date() - now) / loadAnimationTime);
		for (let i = 0; i <= 8; i++) {
			document.getElementById("load" + i).style.animationIterationCount = iterationCount;
		}
	}, 100);
}

// Start screen
function highlightCountry(abbreviation, isHover){
	addRemoveTransparent(abbreviation + "-start-icon-c", isHover);
	var icons = Array.from(document.getElementById(abbreviation + "-start-icon").getElementsByTagName("img"));
	addRemoveClass(icons, "animated", isHover);
}

function createStartScreen(){
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

		var btnn = btn.cloneNode();
		btnn.id = "start-btn-" + abb;
		btnn.classList.add(abb);
		btnn.addEventListener("click", function () {
			selectCountry(country.id, '--'+ abb +'-color');
		});

		var engTxt = text.cloneNode();
		engTxt.innerHTML = country.english_name;
		var jpTxt = text.cloneNode();
		jpTxt.innerHTML = country.japanese_name;
		var iconn = icon.cloneNode();
		iconn.id = abb + "-start-icon";
		var imgWhite = img.cloneNode();
		imgWhite.id = abb + "-start-icon-w";
		imgWhite.src = "img/icons/" + country.symbol + "_white.svg";
		var imgColor = img.cloneNode();
		imgColor.id = abb + "-start-icon-c";
		imgColor.src = "img/icons/" + country.symbol + ".svg";
		imgColor.classList.add("opacity-transition");

		btnn.addEventListener("mouseover", function () {
			highlightCountry(abb, true);
		});
		btnn.addEventListener("touchstart", function () {
			highlightCountry(abb, true);
		});
		btnn.addEventListener("mouseout", function () {
			highlightCountry(abb, false);
		});
		btnn.addEventListener("touchend", function () {
			highlightCountry(abb, false);
		});

		btnn.appendChild(engTxt);
		btnn.appendChild(iconn);
		btnn.appendChild(jpTxt);
		iconn.appendChild(imgWhite);
		iconn.appendChild(imgColor);

		document.getElementById("start-screen").appendChild(btnn);
	});
}

function showFirstStartScreen(){
	document.getElementById("load8").addEventListener("animationend", showStartScreen);
	stopLoader();
}

function showStartScreen(){
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

function main() {
	now = new Date();
	scrollToTop(false);
	createTemplates();
	setupSite();
	fetchData();
}

main();
