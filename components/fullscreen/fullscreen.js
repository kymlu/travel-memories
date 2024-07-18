import { JAPAN, TAIWAN, DAY_NAMES_EN, DAY_NAMES_JP, MONTH_NAMES, TAGS } from '../../js/constants.js'
import {
	getBilingualText, getPictureDate, getImageAddress, isPortraitMode, 
	sortByEnglishName, addRemoveNoDisplay, addRemoveTransparent
} from '../../../js/utility.js';
import { visibleImages } from '../gallery/gallery.js';

//// VARIABLES
// booleans
var isNewFullscreenInstance = true;
export var isFullscreen = false;

// selected pic
var currentPic = null;
var currentPicIndex = 0;

// pic info
var isPicInfoVisible = true;
var favouritedTag;
var searchTermEng = "";
var searchTermJp = "";
var lastSwipeTime = null;
var selectedCountry = null;

// gestures
var initialX = null;
var initialY = null;

//// FUNCTIONS
// initialization
export function initializeFullscreen() {
	// favourited tag in fullscreen
	favouritedTag = document.createElement("div");
	favouritedTag.classList.add("img-tag");
	favouritedTag.innerHTML = getBilingualText("Favourited", "お気に入り");
	let tempStar = document.createElement("span");
	tempStar.classList.add("in-btn-icon");
	tempStar.style.marginRight = "5px";
	tempStar.innerHTML = "&#xf005";
	favouritedTag.prepend(tempStar);
}

// open and close
export function openFullscreen(imageToDisplay, countryId) {
	currentPic = imageToDisplay;
	currentPicIndex = visibleImages.indexOf(currentPic);
	isNewFullscreenInstance = true;
	selectedCountry = countryId;
	setNewPicture();

	lastSwipeTime = new Date();

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

export function closeFullscreen(forceClose) {
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

// seaching functions
// TODO: potentially get user's default search enging
function search(searchTerm) {
	window.open(`https://www.google.com/search?q=${searchTerm}`);
}

export function searchEnglish() {
	search(searchTermEng);
}

export function searchJapanese() {
	search(searchTermJp)
}

// swiping functions
export function startFullscreenSwipe(e) {
	if (isPortraitMode()) {
		if (e.touches.length == 1) {
			initialX = e.touches[0].clientX;
			initialY = e.touches[0].clientY;
		}
	}
}

export function moveFullscreenSwipe(e) {
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

// 
export function changeFullscreenPicture(isForward) {
	if (isForward) {
		if (currentPicIndex == visibleImages.length - 1) {
			currentPicIndex = 0;
		} else {
			currentPicIndex++;
		}
	} else {
		if (currentPicIndex == 0) {
			currentPicIndex = visibleImages.length - 1;
		} else {
			currentPicIndex--;
		}
	}
	currentPic = visibleImages[currentPicIndex];
	setNewPicture(isForward);
}

function setFullscreenInfo() {
	// get dates
	if (currentPic.date) {
		let date = getPictureDate(new Date(currentPic.date), currentPic.offset);
		document.getElementById("fullscreen-eng-date").innerHTML = getEnglishDate(date, currentPic.offset);
		document.getElementById("fullscreen-jp-date").innerHTML = getJapaneseDate(date, currentPic.offset);
	} else {
		document.getElementById("fullscreen-eng-date").innerHTML = "Unknown date";
		document.getElementById("fullscreen-jp-date").innerHTML = "不明な日付";
	}
	let area = currentPic.area;

	// English text for searching
	searchTermEng = (currentPic.location_english ?
		(`${currentPic.location_english}, `) :
		selectedCountry == JAPAN && currentPic.location_japanese ? (`${currentPic.location_japanese}, `) :
			selectedCountry == TAIWAN && currentPic.location_chinese ? (`${currentPic.location_chinese}, `) :
				"") + (area.english_name ?? "");
	document.getElementById("fullscreen-eng-city").innerHTML = searchTermEng;

	// Japanese text for searching
	searchTermJp = (area.japanese_name ?? area.english_name ?? "") + (currentPic.location_japanese ? (`　${currentPic.location_japanese}`) :
		(selectedCountry == TAIWAN && currentPic.location_chinese) ? ("　" + currentPic.location_chinese) :
			currentPic.location_english ? (`　${currentPic.location_english}`) : "");
	document.getElementById("fullscreen-jp-city").innerHTML = searchTermJp;

	// image description
	if (currentPic.description_english) {
		addRemoveNoDisplay("fullscreen-eng-caption", false);
		document.getElementById("fullscreen-eng-caption").innerHTML = currentPic.description_english;
	} else {
		addRemoveNoDisplay("fullscreen-eng-caption", true);
	}
	if (currentPic.description_japanese) {
		addRemoveNoDisplay("fullscreen-jp-caption", false);
		document.getElementById("fullscreen-jp-caption").innerHTML = currentPic.description_japanese;
	} else {
		addRemoveNoDisplay("fullscreen-jp-caption", true);
	}

	// image exif info
	if (currentPic.camera_model) {
		addRemoveNoDisplay("camera-info", false);
		document.getElementById("camera-info").innerHTML = currentPic.camera_model;
	} else {
		addRemoveNoDisplay("camera-info", true);
	}

	if (currentPic.lens) {
		addRemoveNoDisplay("lens-info", false);
		document.getElementById("lens-info").innerHTML = currentPic.lens;
	} else {
		addRemoveNoDisplay("lens-info", true);
	}

	let technicalInfoElement = document.getElementById("technical-info");
	technicalInfoElement.replaceChildren();
	let tempElement = null;
	if (currentPic.f_stop) {
		tempElement = document.createElement("div");
		tempElement.innerHTML = `\u0192/${currentPic.f_stop}`;
		technicalInfoElement.appendChild(tempElement);
	}
	if (currentPic.shutter_speed) {
		tempElement = document.createElement("div");
		tempElement.innerHTML = currentPic.shutter_speed;
		technicalInfoElement.appendChild(tempElement);
	}
	if (currentPic.iso) {
		tempElement = document.createElement("div");
		tempElement.innerHTML = `iso ${currentPic.iso}`;
		technicalInfoElement.appendChild(tempElement);
	}
	if (tempElement == null) {
		addRemoveNoDisplay("technical-info", true);
	} else {
		addRemoveNoDisplay("technical-info", false);
	}

	// add tags
	currentPic.tags.map(x => { return TAGS.find(function (t) { return t.id == x }) })
		.sort(sortByEnglishName)
		.forEach(tag => {
			tempElement = document.createElement("div");
			tempElement.classList.add("img-tag");
			tempElement.innerHTML = getBilingualText(tag.english_name, tag.japanese_name);
			document.getElementById("img-tags").appendChild(tempElement);
		});

	if (currentPic.is_favourite) {
		document.getElementById("img-tags").appendChild(favouritedTag);
	}
}

export function setNewPicture(isForward) {
	document.getElementById("img-tags").replaceChildren();

	let src = getImageAddress(selectedCountry, currentPic.region.id, currentPic.file_name);

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

// picture info
export function showPicInfo() {
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

export function hidePicInfo() {
	isPicInfoVisible = false;
	let element = document.getElementById("pic-info-drawer");
	element.style.bottom = `-${element.getBoundingClientRect().height}px`;
	element.style.marginRight = `-${element.getBoundingClientRect().width}px`;
	setTimeout(() => {
		addRemoveNoDisplay([element], true);
		addRemoveNoDisplay("pic-info", true);
	}, DEFAULT_TIMEOUT);
}

export function changePicInfoVisibility(isVisible) {
	if (isVisible == undefined) {
		isVisible = !isPicInfoVisible;
	}

	if (isVisible) {
		showPicInfo();
	} else {
		hidePicInfo();
	}
}

// format dates according to language
function getEnglishDate(date, picOffset) {
	let hours = date.getHours();
	return DAY_NAMES_EN[date.getDay()] + ", " +
		MONTH_NAMES[date.getMonth()] + " " +
		date.getDate() + ", " +
		date.getFullYear() +
		" " + (hours > 12 ? hours - 12 : hours).toString() + ":" +
		date.getMinutes().toString().padStart(2, "0") + ":" +
		date.getSeconds().toString().padStart(2, "0") +
		(hours >= 12 ? " PM" : " AM") +
		(picOffset > 0 ? " +" : " -") +
		Math.floor(picOffset) + ":" +
		String((picOffset - Math.floor(picOffset)) * 60).padStart(2, "0");
}

function getJapaneseDate(date, picOffset) {
	let hours = date.getHours();
	return date.getFullYear() + "年" +
		(date.getMonth() + 1) + "月" +
		date.getDate() + "日" +
		"（" + DAY_NAMES_JP[date.getDay()] + "）" +
		(hours >= 12 ? "午後" : "午前") +
		(hours > 12 ? hours - 12 : hours).toString() + ":" +
		date.getMinutes().toString().padStart(2, "0") + ":" +
		date.getSeconds().toString().padStart(2, "0") +
		(picOffset >= 0 ? "+" : "") +
		Math.floor(picOffset) + ":" +
		String((picOffset - Math.floor(picOffset)) * 60).padStart(2, "0");
}