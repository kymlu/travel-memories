/* To implement
	- transition when selecting a prefecture (text) in mobile
	- transition after selecting a prefecture to view pictures
	- transition between fullscreen pictures when tapping the arrows?
	- little icon to represent each prefecture
	- draggable handlebar
	- add picture info
	- add tags
	- add filters for town, tags
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
let isGalleryVisible = false;
let isFullscreen = false;
let isPrefInfoVisible = false;
let throttlePrefInfo = false;
let isPicInfoVisible = true;
let currentFilter = "";
let data = null;
let japanTitle = null;
let now = null;
let isHandleGrabbed = false;
let grabbedHandleId = null;
let searchTerm = ["", ""];
let isNewFullscreenInstance = true;
let lastSwipeTime = null;

const defaultTimeout = 500;

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
		"id": "attraction",
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

let branch, leftBranch, leftPoint, rightBranch, rightPoint;
let polaroid, polaroidImgFrame, polaroidImg, polaroidCaption, polaroidCaptionText, polaroidDate, singleDate;

let appColor = "#be0029";

// Text
function getBilingualText(english, japanese) {
	return english + " — " + japanese;
}

function getPictureDate(date, picOffset){
	const localOffset = now.getTimezoneOffset();
	return new Date(date.getTime() + (picOffset - localOffset) * 60000);
}

function getEnglishDate(date, isFullDate) {
	return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + (isFullDate ? " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + ":" + date.getSeconds().toString().padStart(2, "0") : "");
}

function getJapaneseDate(date, isFullDate) {
	return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日" + (isFullDate ? " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + ":" + date.getSeconds().toString().padStart(2, "0") : "");
}

// Prefecture List
function createPrefList() {
	const prefList = document.getElementById("pref-list");
	prefList.replaceChildren();

	const regionGroup = document.createElement("div");
	regionGroup.classList.add("region-group");

	const regionTitle = document.createElement("div");
	regionTitle.classList.add("region-text");

	const visitedPref = document.createElement("div");
	visitedPref.classList.add("prefecture-text", "visited-pref-text");

	const unvisitedPref = document.createElement("div");
	unvisitedPref.classList.add("prefecture-text", "locked-pref-text");
	data.forEach(region => {
		const newPref = regionGroup.cloneNode();
		const newPrefTitle = regionTitle.cloneNode();
		newPrefTitle.innerHTML = getBilingualText(region.english_name, region.japanese_name);
		newPrefTitle.title = getBilingualText("See images from this prefecture", "この地域の写真を表示する");
		newPref.appendChild(newPrefTitle);
		region.prefectures.forEach(prefecture => {
			if (prefecture.visited) {
				const prefNode = visitedPref.cloneNode();
				prefNode.innerHTML = getBilingualText(prefecture.english_name, prefecture.japanese_name);
				prefNode.addEventListener("click", function () {
					selectPref(prefecture);
				}, false);
				newPref.appendChild(prefNode);
			} else {
				const prefNode = unvisitedPref.cloneNode();
				prefNode.innerHTML = getBilingualText(prefecture.english_name, prefecture.japanese_name);
				newPref.appendChild(prefNode);
			}
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
			// CSS won't work on documents
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

// Photo gallery
function createTemplates() {
	// sample branch
	branch = document.createElement("hr");
	branch.classList.add("timeline-branch");

	// sample left branch
	leftBranch = document.createElement("div");
	leftBranch.classList.add("timeline-branch-grp", "left");
	leftPoint = document.createElement("div");
	leftPoint.classList.add("timeline-point", "left");
	leftBranch.appendChild(branch.cloneNode());
	leftBranch.appendChild(leftPoint);

	// sample right branch
	rightBranch = document.createElement("div");
	rightBranch.classList.add("timeline-branch-grp", "right");
	rightPoint = document.createElement("div");
	rightPoint.classList.add("timeline-point", "right");
	rightBranch.appendChild(branch.cloneNode());
	rightBranch.appendChild(rightPoint);

	// sample polaroid
	polaroid = document.createElement("div");
	polaroid.classList.add("polaroid-frame");
	polaroid.classList.add("opacity-transform-transition");
	polaroid.classList.add("transparent");
	polaroid.title = getBilingualText("Expand image", "画像を拡大する");

	var polaroidPin = document.createElement("div");
	polaroidPin.classList.add("polaroid-pin");
	var polaroidPinShine = document.createElement("div");
	polaroidPinShine.classList.add("polaroid-pin-shine");
	polaroidPin.appendChild(polaroidPinShine);
	polaroid.appendChild(polaroidPin);

	polaroidImgFrame = document.createElement("div");
	polaroidImgFrame.classList.add("polaroid-img");
	polaroidImg = document.createElement("img");

	polaroidCaption = document.createElement("div");
	polaroidCaption.classList.add("polaroid-caption");
	polaroidDate = document.createElement("div");
	polaroidDate.classList.add("polaroid-date");
	singleDate = document.createElement("div");
	singleDate.classList.add("date-text");
	polaroidCaptionText = document.createElement("div");
	polaroidCaptionText.classList.add("caption-text");
	polaroidCaptionText.classList.add("one-line-text");
}

function filterMiniMap() {
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
	const japanImg = svgDoc.getElementById("japan-img");
	japanImg.setAttribute("viewBox", selectedPref.viewbox);
	svgObj.classList.remove("transparent");
}

function editMiniMap() {
	const svgObj = document.getElementById("japan-map-mini");
	svgObj.classList.add("transparent");
	setTimeout(() => {	
		svgObj.data = "img/japan.svg";
	}, 50);
}

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
	let isLeft = true;
	let leftColumn = document.getElementById("left-column");
	leftColumn.replaceChildren();
	let rightColumn = document.getElementById("right-column");
	rightColumn.replaceChildren();

	// add pictures
	if (selectedPref.image_list.length > 0) {
		let direction = 2; // 0, 1 = left; 2, 3 = right
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
			let polCaptionTextEn = polaroidCaptionText.cloneNode();
			let polCaptionTextJp = polaroidCaptionText.cloneNode();

			// append elements in correct order
			pol.appendChild(polImgFrame);
			polImgFrame.appendChild(polImg);
			pol.appendChild(polCaption);
			polCaption.appendChild(polDate);
			polDate.appendChild(polDateEn);
			polDate.appendChild(polDateJp);
			polCaption.appendChild(polCaptionTextEn);
			polCaption.appendChild(polCaptionTextJp);

			// rotate picture
			pol.classList.add("rotate-" + ((direction % 3 >= 1) ? "right-" : "left-") + angle);

			// add info
			let date = getPictureDate(new Date(img.date), -540);
			polDateEn.innerHTML = getEnglishDate(date, false);
			polDateJp.innerHTML = getJapaneseDate(date, false);
			polCaptionTextEn.innerHTML = img.description_english;
			polCaptionTextJp.innerHTML = img.description_japanese;

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
			if (isLeft) {
				leftColumn.appendChild(leftBranch.cloneNode(true));
				pol.classList.add("gallery-left");
				gallery.appendChild(pol);
			} else {
				rightColumn.appendChild(rightBranch.cloneNode(true));
				pol.classList.add("gallery-right");
				gallery.appendChild(pol);
			}

			// change iterators
			isLeft = !isLeft;
			if (isLeft) {
				angle++;
				if (angle > 4) {
					angle = 1;
				}
			}
			direction = (direction + 1) % 4;
		});
	} else {
		document.getElementById("timeline").style.display = "none";
		gallery.innerHTML = "Pictures coming soon!"
	}
}

function selectPref(newPref) {
	selectedPref = newPref;
	document.getElementById("pref-info").scrollTo({
		top: 0,
		left: 0,
	});

	document.getElementById("pref-name-arrow").classList.add("arrow-down");
	document.getElementById("pref-name-arrow").classList.remove("arrow-up");
	editMiniMap(newPref);
	
	//To do: add transition from home to pref pages	

	document.getElementById("pref-dates").innerHTML = getBilingualText(selectedPref.dates_english, selectedPref.dates_japanese);
	document.getElementById("pref-cities").innerHTML = selectedPref.areas.map(area => {
		return getBilingualText(area.english_name, area.japanese_name);
	}
	).sort().join(" | ");
	document.getElementById("pref-desc-eng").innerHTML = selectedPref.description_english;
	document.getElementById("pref-desc-jp").innerHTML = selectedPref.description_japanese;
	document.getElementById("pref-name").innerHTML = getBilingualText(selectedPref.english_name, selectedPref.japanese_name);

	createGallery();
	changeGalleryVisibility(true);
}

function changeGalleryFilter(newFilter) {
	if (newFilter == currentFilter) {
		currentFilter = "";
	} else {
		if (currentFilter != "") {
			document.getElementById(currentFilter + "-txt").style.display = "none";
		}
		currentFilter = newFilter;
	}
}

function changeFullscreenPicture(isForward) {
	if (isForward) {
		if (selectedPictureIndex == (selectedPref.image_list.length - 1)) {
			selectedPictureIndex = 0;
		} else {
			selectedPictureIndex++;
		}
	} else {
		if (selectedPictureIndex == 0) {
			selectedPictureIndex = selectedPref.image_list.length - 1;
		} else {
			selectedPictureIndex--;
		}
	}
	selectedPicture = selectedPref.image_list[selectedPictureIndex];
	setFullscreenPicture(isForward);
}

function search(searchTerm) {
	window.open("https://www.google.com/search?q=" + searchTerm);
}

function searchEnglish() {
	search(searchTerm[0]);
}

function searchJapanese() {
	search(searchTerm[1])
}

function setFullscreenPicture(isForward) {
	document.getElementById("search-eng").removeEventListener("click", searchEnglish);
	document.getElementById("search-jp").removeEventListener("click", searchJapanese);
	document.getElementById("tags").replaceChildren();

	var src = selectedPicture.link ?? "img/" + selectedPref.english_name.toLowerCase() + "/" + selectedPicture.file_name;

	if (isNewFullscreenInstance || (new Date() - lastSwipeTime) < 300) {
		document.getElementById("fullscreen-pic").src = src;
		isNewFullscreenInstance = false;
	} else {
		var nextPic = document.getElementById("fullscreen-pic-next");
		var currentPic = document.getElementById("fullscreen-pic");
		
		nextPic.style.display = "none";
		nextPic.src = src;
		nextPic.classList.add(isForward ? "fullscreen-pic-out-left":"fullscreen-pic-out-right");

		setTimeout(() => {
			nextPic.style.display = "block";
			nextPic.classList.remove("transparent");
			nextPic.classList.remove(isForward ? "fullscreen-pic-out-left":"fullscreen-pic-out-right");
			currentPic.classList.add(isForward ? "fullscreen-pic-out-right" : "fullscreen-pic-out-left");
			currentPic.classList.add("transparent");

			setTimeout(() => {
				currentPic.style.display = "none";
				currentPic.src = src;
				currentPic.classList.remove(isForward ? "fullscreen-pic-out-right" : "fullscreen-pic-out-left");
				currentPic.classList.remove("transparent");
				setTimeout(() => {
					currentPic.style.display = "block";
					nextPic.style.display = "none";
					//nextPic.classList.add("transparent");
					nextPic.classList.remove("fullscreen-pic-in");
				}, 100);
			}, 100);
		}, 20);

		lastSwipeTime = new Date();
	}

	let date = getPictureDate(new Date(selectedPicture.date), -540);
	document.getElementById("fullscreen-eng-date").innerHTML = getEnglishDate(date, true);
	document.getElementById("fullscreen-jp-date").innerHTML = getJapaneseDate(date, true);

	let area = selectedPref.areas.find(function (area) { return area.id == selectedPicture.city });
	searchTerm[0] = (selectedPicture.location_english ? (selectedPicture.location_english + ", ") : "") + area.english_name;
	document.getElementById("fullscreen-eng-city").innerHTML = searchTerm[0];
	document.getElementById("search-eng").addEventListener("click", searchEnglish);
	searchTerm[1] = area.japanese_name + (selectedPicture.location_japanese ? ("、" + selectedPicture.location_japanese + "") : "");
	document.getElementById("fullscreen-jp-city").innerHTML = searchTerm[1];
	document.getElementById("search-jp").addEventListener("click", searchJapanese);

	document.getElementById("fullscreen-eng-caption").innerHTML = selectedPicture.description_english;
	document.getElementById("fullscreen-jp-caption").innerHTML = selectedPicture.description_japanese;

	document.getElementById("camera-info").innerHTML = (selectedPicture.camera_model ? selectedPicture.camera_model + " ": "");
	document.getElementById("lens-info").innerHTML = (selectedPicture.lens ? selectedPicture.lens + " ": "");
	
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

	selectedPicture.tags.forEach(tag => {
		tempElement = document.createElement("div");
		tempElement.classList.add("img-tag");
		var tempTag = tags.find(function (t) {return t.id == tag});
		tempElement.innerHTML = getBilingualText(tempTag.english_name, tempTag.japanese_name);
		document.getElementById("tags").appendChild(tempElement);
	})
}

function openFullscreen() {
	// set up not visible by default
	if (window.innerHeight > window.innerWidth) {
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

// Source: https://stackoverflow.com/questions/53192433/how-to-detect-swipe-in-javascript
function startHandleDrag(e, id) {
	isHandleGrabbed = true;
	grabbedHandleId = id;
	initialYHandle = e.touches[0].clientY;
};
function endHandleDrag(e) {
	if (isHandleGrabbed) {
		isHandleGrabbed = false;
		var currentY = e.changedTouches[0].clientY;
		if (currentY > initialYHandle) {
			if (grabbedHandleId == "pic-info-handle") {
				hidePicInfo();
			} else if (grabbedHandleId == "pref-info-handle") {
				showPrefInfo(true);
			}
		} else if (currentY < initialYHandle) {
			if (grabbedHandleId == "pic-info-handle") {
				showPicInfo();
			} else if (grabbedHandleId == "pref-info-handle") {
				hidePrefInfo(true);
			}
		}
		initialYHandle = null;
	}
};

function startFullscreenSwipe(e) {
	initialX = e.touches[0].clientX;
	initialY = e.touches[0].clientY;
};

function moveFullscreenSwipe(e) {
	if (initialX === null) {
		return;
	}

	if (initialY === null) {
		return;
	}

	var currentX = e.touches[0].clientX;
	var currentY = e.touches[0].clientY;

	var diffX = initialX - currentX;
	var diffY = initialY - currentY;

	if (Math.abs(diffX) > Math.abs(diffY)) {
		if (diffX > 0) {
			changeFullscreenPicture(false);
		} else {
			changeFullscreenPicture(true);
		}
	} else {
		if (diffY > 0) {
			if (!isPicInfoVisible) {
				showPicInfo();
			}
		} else {
			if (isPicInfoVisible) {
				hidePicInfo();
			}
		}
	}

	initialX = null;
	initialY = null;

	e.preventDefault();
};


// Popup
function openInfoPopup() {
	isPopupVisible = true;
	document.getElementById("site-info-popup").classList.remove("transparent");
	document.getElementById("info-popup").style.visibility = "visible";
	document.getElementById("popup-bg").classList.remove("transparent");
	document.getElementById("site-info-popup").classList.add("popup-width");
	setTimeout(() => {
		document.getElementById("site-info").style.display = "block";
		document.getElementById("site-info").classList.remove("transparent");
		document.getElementById("site-info-popup").classList.add("popup-height");
	}, defaultTimeout);
}

function closeInfoPopup(forceClose) {
	if (forceClose) {
		document.getElementById("info-popup").style.visibility = "hidden";
		document.getElementById("site-info").classList.add("transparent");
		document.getElementById("site-info-popup").classList.remove("popup-height");
		document.getElementById("site-info").style.display = "none";
		document.getElementById("site-info-popup").classList.remove("popup-width");
		document.getElementById("site-info-popup").classList.add("transparent");
		document.getElementById("popup-bg").classList.add("transparent");
	} else {
		document.getElementById("site-info").classList.add("transparent");
		setTimeout(() => {
			document.getElementById("site-info-popup").classList.remove("popup-height");
			setTimeout(() => {
				document.getElementById("site-info").style.display = "none";
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
	spinArrow();
	if (isForced) {
		if (document.body.scrollTop < document.getElementById("top-drawer").getBoundingClientRect().height) {
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: 'smooth'
			});
		} else {
			document.getElementById("top-drawer").style.position = "sticky";
			document.getElementById("top-drawer").style.top = document.getElementById("top-bar").getBoundingClientRect().height;
			document.getElementById("pref-info-bg").classList.remove("transparent");
		}
	}
}

function hidePrefInfo(isForced) {
	isPrefInfoVisible = false;
	spinArrow();
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

function showPicInfo() {
	isPicInfoVisible = true;
	document.getElementById("pic-info").style.display="flex";
	var element = document.getElementById("pic-info-drawer");
	//TODO: transition on first portrait mode open
	element.style.display = "flex";
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
		element.style.display = "none";
		document.getElementById("pic-info").style.display="none";
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

function openGallery() {
	window.scrollTo(0, 0);
	document.getElementById("top-bar").classList.remove("transparent");
	document.getElementById("map-page").classList.remove("transparent");
	document.getElementById("loading-screen").classList.add("transparent");
	document.body.style.overflowY = "auto";
	setTimeout(() => {
		document.getElementById("loading-screen").style.visibility = "hidden";
	}, defaultTimeout);
}

function changeGalleryVisibility(isVisible) {
	window.scrollTo(0, 0);
	if (isVisible == undefined) {
		isGalleryVisible = !isGalleryVisible;
	} else {
		isGalleryVisible = isVisible;
	}
	document.getElementById("top-bar").style.position = isGalleryVisible ? "sticky" : "fixed";
	document.getElementById("top-bar").style.backgroundColor = isGalleryVisible ? "white" : "transparent";
	document.getElementById("map-page").style.display = isGalleryVisible ? "none" : "flex";
	document.getElementById("gallery").style.display = isGalleryVisible ? "flex" : "none";
	document.getElementById("timeline").style.display = isGalleryVisible ? "inline-grid" : "none";
	document.getElementById("map-btn").style.display = isGalleryVisible ? "block" : "none";
	document.getElementById("pref-name").style.display = isGalleryVisible ? "block" : "none";
	document.getElementById("pref-name-arrow").style.display = isGalleryVisible ? "block" : "none";
	document.getElementById("top-drawer").style.display = isGalleryVisible ? "block" : "none";
	document.getElementById("pref-info-bg").style.visibility = isGalleryVisible ? "visible" : "hidden";
	document.getElementById("pref-info-bg").classList.remove("transparent");
	document.getElementById("pref-info").style.display = isGalleryVisible ? "flex" : "none";
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

function openLoader() {
	document.getElementById("top-bar").classList.add("transparent");
	document.getElementById("map-page").classList.add("transparent");
	document.getElementById("loader-btn").style.display = "none";
	document.getElementById("loading-screen").style.visibility = "visible";
	document.getElementById("loading-screen").classList.remove("transparent");
	for (let i = 1; i <= 9; i++) {
		document.getElementById("load" + i).style.animationIterationCount = "infinite";
	}
	document.getElementById("map-page").classList.add("transparent");
}

function fetchData() {
	var hasError = false;

	fetch("https://raw.githubusercontent.com/kymlu/travel-memories/main/js/data.json")
		.then(response => {
			return response.json();
		}).then(d => {
			data = d;
			// data = [];
			// d.forEach(region => {
			// 	const prefectures = region.prefectures.map(prefecture => {
			// 		if (prefecture.image_list) {
			// 			const images = prefecture.image_list.map(image => Object.assign(new Image(), image));
			// 			region.image_list = images;
			// 		}
			// 		return Object.assign(new Prefecture(), region);
			// 	});
			// 	region.prefectures = prefectures;
			// 	const newRegion = Object.assign(new Region(), region);
			// 	data.push(newRegion);
			// });
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
						document.getElementById("loader-btn").style.display = "block";
						setTimeout(() => {
							document.getElementById("loader-btn").classList.remove("transparent");
						}, 10);
					});
				}, 100);
			}
		});
}

function retry() {
	document.getElementById("error-btn").style.display = "none";
	for (let i = 1; i <= 9; i++) {
		document.getElementById("load" + i).style.animationPlayState = "running";
	}
	fetchData();
}

function setupSite() {
	japanTitle = getBilingualText("JAPAN", "日本");
	document.getElementById("main-title").innerHTML = japanTitle;
	document.getElementById("dates-title").innerHTML = getBilingualText("Dates visited", "訪れた日付");
	document.getElementById("cities-title").innerHTML = getBilingualText("Cities and significant places visited", "訪れた都市・名所");
	document.getElementById("description-title").innerHTML = getBilingualText("Description etc.", "説明など");
	document.getElementById("pic-info-btn").title = getBilingualText("See picture information", "写真の情報を見る");
	document.getElementById("map-btn").title = getBilingualText("Return to map", "地図に戻る");
	document.getElementById("pref-title").title = getBilingualText("Toggle prefecture info", "都道府県の情報をトグル");
	document.getElementById("info-btn").title = getBilingualText("About the site", "このサイトについて");
	document.getElementById("map-instructions").innerHTML = getBilingualText("Select a prefecture to see pictures from that location, or click here to see all pictures", "都道府県を選択して、その地域の写真を表示する。または、こちらを選択して、全部の写真を表示する。");
	document.getElementById("left-arrow").title = getBilingualText("Previous picture", "前の写真");
	document.getElementById("right-arrow").title = getBilingualText("Next picture", "次の写真");
	document.getElementById("search-eng").title = getBilingualText("Google in English", "英語でググる");
	document.getElementById("search-jp").title = getBilingualText("Google in Japanese", "日本語でググる");

	document.getElementById("loader-btn").addEventListener("click", function () {
		setTimeout(() => {
			openGallery(true);
		}, 50);
	});
	document.getElementById("pref-info-bg").addEventListener("click", function () { changePrefInfoVisibility(false, true); });
	document.getElementById("info-popup-close-btn").addEventListener("click", function () { closeInfoPopup(false); });
	document.getElementById("site-info-popup").addEventListener("click", (event) => {
		event.stopPropagation();
	});
	document.getElementById("pic-info-btn").addEventListener("click", function () { changePicInfoVisibility(); });
	document.getElementById("pic-info-close-btn").addEventListener("click", function () { hidePicInfo(); });
	document.getElementById("popup-bg").addEventListener("click", function () { closeInfoPopup(true); });
	document.getElementById("info-btn").addEventListener("click", openInfoPopup);
	document.getElementById("map-btn").addEventListener("click", function () { changeGalleryVisibility(false); });
	document.getElementById("pref-title").addEventListener("click", function () { changePrefInfoVisibility(undefined, true); });
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
	document.getElementById("map-instructions").addEventListener("click", openInfoPopup);
	let drawers = Array.from(document.getElementsByClassName("drawer-handle"));
	drawers.forEach(handle => {
		handle.parentElement.addEventListener("touchstart", e => { startHandleDrag(e, handle.parentElement.id) }, false);
	});
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

	var swipeContainer = document.getElementById("fullscreen-gallery");
	swipeContainer.addEventListener("touchstart", startFullscreenSwipe, false);
	swipeContainer.addEventListener("touchmove", moveFullscreenSwipe, false);

	window.onscroll = function () { scrollPrefInfo() };

	createTemplates();
}

function showDataLoadError() {
	setTimeout(() => {
		document.getElementById("error-btn").style.display = "block";
		document.getElementById("error-btn").classList.remove("transparent");
		for (let i = 1; i <= 9; i++) {
			document.getElementById("load" + i).style.animationPlayState = "paused";
		}
	}, defaultTimeout);
}

function main() {
	now = new Date();
	window.scrollTo(0, 0);
	setupSite();
	fetchData();
}

main();
