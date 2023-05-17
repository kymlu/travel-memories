/* To implement
	- transition when selecting a prefecture (text) in mobile
	- transition after selecting a prefecture to view pictures
	- transition between fullscreen pictures when tapping the arrows?
	- little icon to represent each prefecture
	- draggable handlebar
	- separate sections for each language in polaroid
*/

// Variables
let isLoading = true;
let selectedPref = null;
let selectedPicture = null;
let selectedPictureIndex = 0;
let hoveredRegion = "";
let isPopupVisible = false;
let isGalleryVisible = false;
let isFullscreen = false;
let isPrefInfoVisible = false;
let prefInfoOffset = 0;
let prefInfoArrowRotation = 0;
let throttleScroll = false;
let isPicInfoVisible = true;
let currentFilter = "";
let data = null;

let initialX = null;
let initialY = null;

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let branch, leftBranch, leftPoint, rightBranch, rightPoint;
let polaroid, polaroidImgFrame, polaroidImg, polaroidCaption, polaroidCaptionText, polaroidDate, singleDate;

let appColor = "#be0029";

// Text
function getBilingualText(english, japanese) {
	return english + "・" + japanese;
}

function getEnglishDate(date, isFullDate){
	return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + (isFullDate ? " " + date.getHours().toString().padStart(2, "0") + ":"+ date.getMinutes().toString().padStart(2, "0") : "");
}

function getJapaneseDate(date, isFullDate){
	return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" +date.getDate() + "日" + (isFullDate ? " " + date.getHours().toString().padStart(2, "0") + ":"+ date.getMinutes().toString().padStart(2, "0") : "");
}

// Prefecture List

function createPrefList(data) {
	const prefList = document.getElementById("pref-list");
	prefList.innerHTML = "";

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
function createMap(data) {
	const svgObj = document.getElementById("japan-map");
	const svgDoc = svgObj.contentDocument;

	const prefList = data.flatMap(region => region.prefectures);
	prefList.forEach(pref => {
		const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
		if (pref.visited) {
			prefImg.setAttribute("transition", "opacity 0.3s ease-in-out");
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
				/*document.getElementById("main-title").style.opacity = "0%";
				setTimeout(()=>{
					document.getElementById("main-title").innerHTML = getBilingualText(pref.english_name, pref.japanese_name);
					document.getElementById("main-title").style.opacity = "100%";
				}, 300);*/
			});

			prefImg.addEventListener("mouseout", () => {
				prefImg.setAttribute("opacity", "100%");
				hoveredRegion = "";
				document.getElementById("main-title").innerHTML = "JAPAN・日本";
				/*document.getElementById("main-title").style.opacity = "0%";
				setTimeout(()=>{
					document.getElementById("main-title").innerHTML = "JAPAN / 日本";
					document.getElementById("main-title").style.opacity = "100%";
				}, 300);*/
			});
		} else {
			prefImg.setAttribute("fill", "lightgray");
		}
	});
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

function closeMapTransition() {
	const prefList = data.flatMap(region => region.prefectures);
	var shuffledList = shuffle(prefList);

	const svgObj = document.getElementById("japan-map");
	const svgDoc = svgObj.contentDocument;
	shuffledList.forEach(pref => {
		if (pref.english_name != selectedPref.english_name) {
			setTimeout(() => {
				const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
				prefImg.setAttribute("opacity", "0%");
			}, 100);
		}
	});
}

// Photo gallery
function createTemplates(){
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
	polaroid.classList.add("opacity-transition");
	
	polaroidImgFrame = document.createElement("div");
	polaroidImgFrame.classList.add("polaroid-img");
	polaroidImg = document.createElement("img");
	polaroidImg.style.width = "100%"
	
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

function editMiniMap(){
	const svgObj = document.getElementById("japan-map-mini");
	svgObj.data = "img/japan.svg";
	svgObj.addEventListener("load", function () {
		const svgDoc = svgObj.contentDocument;
		if (svgDoc) {
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
			}
			);
			const japanImg = svgDoc.getElementById("japan-img");
			japanImg.setAttribute("viewBox", selectedPref.viewbox);
		}
	});
}

// Based on: https://www.codepel.com/vanilla-javascript/javascript-image-loaded/
// The lazy loading observer
function lazyLoad(target) {
	const obs = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const thisPolaroid = entry.target;
				const img = thisPolaroid.querySelector(".polaroid-img").getElementsByTagName("img")[0];				const src = img.getAttribute("img-src");
				img.setAttribute("src", src);
				thisPolaroid.style.opacity = "100%";
				observer.disconnect();
			}
		});
	});
	obs.observe(target);
}

function createGallery(){
	// clear existing
	let gallery = document.getElementById("gallery");
	gallery.innerHTML = "";
	let isLeft = true;
	let leftColumn = document.getElementById("left-column");
	leftColumn.innerHTML = "";
	let rightColumn = document.getElementById("right-column");
	rightColumn.innerHTML = "";

	// add pictures
	if (selectedPref.image_list.length > 0) {
		let direction = 2; // 0, 1 = left; 2, 3 = right
		let angle = 1; // 1-4 for the rotation class
		selectedPref.image_list.forEach(img => {
			// clone all relevant nodes
			let pol = polaroid.cloneNode();
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
			let date = new Date(img.date);
			polDateEn.innerHTML = getEnglishDate(date, false);
			polDateJp.innerHTML = getJapaneseDate(date, false);
			polCaptionTextEn.innerHTML = img.description_english;
			polCaptionTextJp.innerHTML = img.description_japanese;

			// listeners
			pol.addEventListener("click", function(){
				selectedPicture = img;
				selectedPictureIndex = selectedPref.image_list.indexOf(selectedPicture);
				setFullscreenPicture();
				openFullscreen();
			});
			polImg.onload = function() {
				if(this.width > this.height){
					polImg.style.height = "100%";
					polImg.style.width = "auto";
				}
			}

			polImg.setAttribute("img-src", img.link);
			lazyLoad(pol);

			// add to screen
			if(isLeft){
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
			if(isLeft){
				angle++;
				if(angle > 4){
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
	prefInfoArrowRotation = 0;
	document.getElementById("pref-name-arrow").style.transform = "rotate(0deg)";

	editMiniMap(newPref);

	//To do: add transition from home to pref pages	

	document.getElementById("pref-dates").innerHTML = getBilingualText(selectedPref.dates_english, selectedPref.dates_japanese);
	document.getElementById("pref-cities").innerHTML = selectedPref.areas.map(area => 
		{
			return getBilingualText(area.english_name, area.japanese_name);
		}
	).sort().join(" | ");
	document.getElementById("pred-desc-eng").innerHTML = selectedPref.description_english;
	document.getElementById("pred-desc-jp").innerHTML = selectedPref.description_japanese;
	document.getElementById("pref-name").innerHTML = getBilingualText(selectedPref.english_name, selectedPref.japanese_name);
	changeGalleryVisibility(true);
	createGallery();
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
	if (isForward){
		if(selectedPictureIndex == (selectedPref.image_list.length - 1)){
			selectedPictureIndex = 0;
		} else {
			selectedPictureIndex++;
		}
	} else {
		if(selectedPictureIndex == 0){
			selectedPictureIndex = selectedPref.image_list.length - 1;
		} else {
			selectedPictureIndex--;
		}
	}
	selectedPicture = selectedPref.image_list[selectedPictureIndex];
	setFullscreenPicture();
}

function setFullscreenPicture(){
	document.getElementById("fullscreen-pic").src = selectedPicture.link;
	let date = new Date(selectedPicture.date);
	document.getElementById("fullscreen-eng-date").innerHTML = getEnglishDate(date, true);
	document.getElementById("fullscreen-jp-date").innerHTML = getJapaneseDate(date, true);
	let area = selectedPref.areas.find(function(area){return area.id == selectedPicture.city});
	document.getElementById("fullscreen-eng-city").innerHTML = area.english_name;
	document.getElementById("fullscreen-jp-city").innerHTML = area.japanese_name;
	document.getElementById("fullscreen-eng-caption").innerHTML = selectedPicture.description_english;
	document.getElementById("fullscreen-jp-caption").innerHTML = selectedPicture.description_japanese;
}

function openFullscreen(){
	isFullscreen = true;
	document.getElementById("fullscreen").style.visibility = "visible";
	document.getElementById("fullscreen").style.opacity = "100%";
	document.getElementById("fullscreen-bg").style.opacity = "30%";
}

function closeFullscreen(forceClose){
	isFullscreen = false;
	if(forceClose){
		document.getElementById("fullscreen").style.visibility = "hidden";
		document.getElementById("fullscreen").style.opacity = "0%";
		document.getElementById("fullscreen-bg").style.opacity = "0%";
		// document.getElementById("site-info-popup").style.height = "10vh";
		// document.getElementById("site-info").style.display = "none";
		// document.getElementById("site-info-popup").style.width = "0vw";
		// document.getElementById("site-info-popup").style.opacity = "0%";
		// document.getElementById("popup-bg").style.opacity = "0%";
	} else {
		document.getElementById("fullscreen").style.opacity = "0%";
		document.getElementById("fullscreen-bg").style.opacity = "0%";
		setTimeout(() => {
			document.getElementById("fullscreen").style.visibility = "hidden";
		}, 500);
	}
}

// Source: https://stackoverflow.com/questions/53192433/how-to-detect-swipe-in-javascript
function startTouch(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
};

function moveTouch(e) {
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
        changeFullscreenPicture(true);
      } else {
        changeFullscreenPicture(false);
      }  
    }

    initialX = null;
    initialY = null;

    e.preventDefault();
};


// Popup
function openInfoPopup(){
	isPopupVisible = true;
	document.getElementById("site-info-popup").style.opacity = "100%";
	document.getElementById("info-popup").style.visibility = "visible";
	document.getElementById("popup-bg").style.opacity = "30%";
	document.getElementById("site-info-popup").style.width = (screen.orientation.type =="portrait-secondary"|| screen.orientation.type =="portrait-primary") ? "80vw" : "50vw";
	setTimeout(() => {
		document.getElementById("site-info").style.display = "block";
		document.getElementById("site-info").style.opacity = "100%";
		document.getElementById("site-info-popup").style.height = (screen.orientation.type =="portrait-secondary"|| screen.orientation.type =="portrait-primary") ? "70vh": "50vh";
	}, 500);
}

function closeInfoPopup(forceClose){
	if(forceClose){
		document.getElementById("info-popup").style.visibility = "hidden";
		document.getElementById("site-info").style.opacity = "0%";
		document.getElementById("site-info-popup").style.height = "10vh";
		document.getElementById("site-info").style.display = "none";
		document.getElementById("site-info-popup").style.width = "0vw";
		document.getElementById("site-info-popup").style.opacity = "0%";
		document.getElementById("popup-bg").style.opacity = "0%";
	} else {
		document.getElementById("site-info").style.opacity = "0%";
		setTimeout(() => {
			document.getElementById("site-info-popup").style.height = "10vh";
			setTimeout(() => {
				document.getElementById("site-info").style.display = "none";
				document.getElementById("site-info-popup").style.width = "0vw";
				setTimeout(() => {
					document.getElementById("site-info-popup").style.opacity = "0%";
					document.getElementById("popup-bg").style.opacity = "0%";
					setTimeout(() => {
						document.getElementById("info-popup").style.visibility = "hidden";
					}, 500);
				}, 500);
			}, 500);
		}, 500);
	}
}

// Prefecture info
function changePrefInfoVisibility(isVisible) {
	if(isPrefInfoVisible == isVisible){
		return;
	}
	if(isVisible == undefined){
		isPrefInfoVisible = !isPrefInfoVisible;
	} else {
		isPrefInfoVisible = isVisible;
	}
	prefInfoArrowRotation += 180;
	if(!isPrefInfoVisible){
		document.getElementById("pref-info-bg").style.opacity = "0%";
		document.getElementById("pref-info").style.top = "-" + (document.getElementById("pref-info").getBoundingClientRect().height + prefInfoOffset) + "px";
		document.getElementById("pref-name-arrow").style.transform = "rotate(" + prefInfoArrowRotation + "deg)";
		setTimeout(() => {
			document.getElementById("pref-info").style.display = "none";
			document.getElementById("pref-info-bg").style.visibility = "hidden";
		}, 500);
	} else {
		document.getElementById("pref-info-bg").style.opacity = "30%";
		document.getElementById("pref-info-bg").style.visibility = "visible";
		document.getElementById("pref-info").style.display = "flex";
		setTimeout(() => {
			document.getElementById("pref-info").style.top = prefInfoOffset + "px";
			document.getElementById("pref-name-arrow").style.transform = "rotate("+ prefInfoArrowRotation +"deg)";
		}, 10);
	}
}

// bug: when scroll up quickly, does not show animation
function scrollPrefInfo() {
	if (throttleScroll || !isGalleryVisible) return;
	throttleScroll = true;
	setTimeout(() => { 
		if (isPrefInfoVisible && document.body.scrollTop > 150) {
			changePrefInfoVisibility(false);
		}
		// } else if (!isPrefInfoVisible && document.body.scrollTop <= 150) {
		// 	changePrefInfoVisibility(true);
		// }
		throttleScroll = false;
	}, 500);
}

function changePicInfoVisibility() {
	isPicInfoVisible = !isPicInfoVisible;
	document.getElementById("pic-info").style.display = isPicInfoVisible ? "flex" : "none";
}

function resetTopbar() {
	prefInfoOffset = document.getElementById("top-bar").getBoundingClientRect().height;
	if(isGalleryVisible){
		document.getElementById("pref-info").style.top = prefInfoOffset + "px";
	}
}

function changeGalleryVisibility(isVisible) {
	window.scrollTo(0, 0);
	if(isVisible == undefined){
		isGalleryVisible = !isGalleryVisible;
	} else {
		isGalleryVisible = isVisible;
	}
	resetTopbar();
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
	document.getElementById("pref-info").style.display = isGalleryVisible ? "flex" : "none";
	document.getElementById("pref-info").style.top = prefInfoOffset + "px";
	isPrefInfoVisible = isGalleryVisible ? true : false;
	if (!isGalleryVisible) {
		createMap(data);
	}
}

function openGallery(){
	document.getElementById("top-bar").style.display = "flex";
	document.getElementById("map-page").style.display = "flex";
	document.getElementById("loading-screen").style.opacity = "0%";
	setTimeout(() => {
		document.body.style.overflowY = "auto";
		document.getElementById("loading-screen").style.visibility = "hidden";
	}, 1000);
}

function main() {
	window.scrollTo(0, 0);
	document.getElementById("top-bar").style.display = "none";
	document.getElementById("map-page").style.display = "none";

	fetch("https://raw.githubusercontent.com/kymlu/travel-memories/main/js/data.json")
		.then(response => {
			return response.json();
		})
		.then(d => {
			data = d;
			data.forEach(region => {
				region.prefectures.forEach(pref => {
					if (pref.image_list != null){
						pref.image_list.sort(function (a, b) {return new Date(a.date) - new Date(b.date);});
					}
				});
			});
			createPrefList(data);
			createMap(data);
		})
		.catch(error => { console.error(error); });

	document.getElementById("pref-info-bg").addEventListener("click", function(){changePrefInfoVisibility(false);});
	document.getElementById("info-popup-close-btn").addEventListener("click", function(){closeInfoPopup(false);});
	document.getElementById("info-popup-close-btn").addEventListener("click", function(){closeInfoPopup(false);});
	document.getElementById("site-info-popup").addEventListener("click", (event) => {
		event.stopPropagation();
	});
	document.getElementById("pic-info-btn").addEventListener("click", changePicInfoVisibility);
	document.getElementById("popup-bg").addEventListener("click", function(){closeInfoPopup(true);});
	document.getElementById("info-btn").addEventListener("click", openInfoPopup);
	document.getElementById("map-btn").addEventListener("click", function(){changeGalleryVisibility(false);});
	document.getElementById("pref-title").addEventListener("click", function(){changePrefInfoVisibility();});
	document.getElementById("fullscreen-bg").addEventListener("click", function(){closeFullscreen(true)});
	document.getElementById("left-arrow").addEventListener("click", function(){changeFullscreenPicture(false);});
	document.getElementById("right-arrow").addEventListener("click", function(){changeFullscreenPicture(true);});

	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape"){
			if (isPopupVisible) {
				closeInfoPopup(true);
			} else if (isFullscreen){
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
	swipeContainer.addEventListener("touchstart", startTouch, false);
	swipeContainer.addEventListener("touchmove", moveTouch, false);

	window.onscroll = function() {scrollPrefInfo()};
	window.onresize = function() {resetTopbar();}

	createTemplates();

	setTimeout(() => {
		document.getElementById("loader").style.animationIterationCount = "1";
		document.getElementById("loader").addEventListener("animationend", function(){
			document.getElementById("loader").style.cursor = "pointer";
			document.getElementById("loader-text").style.opacity = "100%";
			document.getElementById("loader").addEventListener("click", openGallery);
		});
	}, 1000);
}

main();
