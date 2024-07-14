import { JAPAN, TAIWAN, AUSTRALIA, NEW_ZEALAND, DAY_NAMES_EN, DAY_NAMES_JP, MONTH_NAMES } from '../../js/constants.js'
import { getBilingualText, getPictureDate,isPortraitMode, sortByEnglishName, addRemoveNoDisplay, addRemoveTransparent } from '../../../js/utility.js';
import { imgList, visibleImgs } from '../gallery/gallery.js';

var favouritedTag;
var searchTermEng = "";
var searchTermJp = "";
var isNewFullscreenInstance = true;

export var isFullscreen = false;
var selectedPic = null;
var selectedPicInd = 0;
var isPicInfoVisible = true;
var lastSwipeTime = null;
var selectedCountry = null;

/**** Googling picture info ****/
function search(searchTerm) {
	window.open("https://www.google.com/search?q=" + searchTerm);
}

export function searchEnglish() {
	search(searchTermEng);
}

export function searchJapanese() {
	search(searchTermJp)
}

/**** Fullscreen Picture ****/
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
	setNewPicture(isForward);
}

function setFullscreenInfo() {
	if (selectedPic.date) {
		let date = getPictureDate(new Date(selectedPic.date), selectedPic.offset);
		document.getElementById("fullscreen-eng-date").innerHTML = getEnglishDate(date, selectedPic.offset);
		document.getElementById("fullscreen-jp-date").innerHTML = getJapaneseDate(date, selectedPic.offset);
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

// TODO NEXT: fix fullscreen functions
export function setNewPicture(isForward) {
	document.getElementById("img-tags").replaceChildren();

	console.log(selectedPic);
	let src = selectedPic.link ?? "assets/img/" + selectedCountry + "/" + selectedPic.rgn.id + "/" + selectedPic.file_name;
	// let src = selectedPic.link ?? "assets/img/" + selectedCountry + "/" + (isSingleRegion ? rgnsList[0].id : selectedPic.rgn.id) + "/" + selectedPic.file_name;

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

export function openFullscreen(imageToDisplay, countryId) {
	selectedPic = imageToDisplay;
	selectedPicInd = imgList.indexOf(selectedPic);
	isNewFullscreenInstance = true;
	setNewPicture();
	selectedCountry = countryId;

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

/**** Fullscreen Picture Info ****/
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
	element.style.bottom = "-" + element.getBoundingClientRect().height + "px";
	element.style.marginRight = "-" + element.getBoundingClientRect().width + "px";
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