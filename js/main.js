// Variables
var selectedRegion = null;
var selectedPicture = null;
var hoveredRegion = "";
var isSidebarVisible = false;
var isPopupVisible = false;
var isGalleryVisible = false;
var isFullscreen = false;
var isPrefInfoVisible = false;
var isPicInfoVisible = true;
var currentFilter = "";
var data = null;

const appColor = "#be0029";

// Text
function getBilingualText(english, japanese) {
	return english + " / " + japanese;
}

// Sidebar
function changeSidebarVisibility() {
	// isSidebarVisible = !isSidebarVisible;
	// document.getElementById("sidebar").style.visibility = isSidebarVisible ? "visible" : "hidden";
	// document.getElementById("sidebar-bg").style.visibility = isSidebarVisible ? "visible" : "hidden";
}

function createSidebar(data) {
	// const sidebar = document.getElementById("sidebar");
	// sidebar.innerHTML = "";
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
		const newRegion = regionGroup.cloneNode();
		const newRegionTitle = regionTitle.cloneNode();
		newRegionTitle.innerHTML = getBilingualText(region.english_name, region.japanese_name);
		newRegion.appendChild(newRegionTitle);
		region.prefectures.forEach(prefecture => {
			if (prefecture.visited) {
				const newPrefecture = visitedPref.cloneNode();
				newPrefecture.innerHTML = getBilingualText(prefecture.english_name, prefecture.japanese_name);
				newPrefecture.addEventListener("click", function () {
					changeRegion(prefecture);
					changeSidebarVisibility();
				}, false);
				newRegion.appendChild(newPrefecture);
			} else {
				const newPrefecture = unvisitedPref.cloneNode();
				newPrefecture.innerHTML = getBilingualText(prefecture.english_name, prefecture.japanese_name);
				newRegion.appendChild(newPrefecture);
			}
		});
		// sidebar.appendChild(newRegion);
		prefList.appendChild(newRegion);
	});
}

// Map
function createMap(data) {
	setTimeout(() => {
		const svgObj = document.getElementById('japan-map');
		const svgDoc = svgObj.contentDocument;

		const prefList = data.flatMap(region => region.prefectures);
		console.log(svgObj, svgDoc);
		prefList.forEach(pref => {
			const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
			if (pref.visited) {
				prefImg.setAttribute('transition', 'opacity 0.3s ease-in-out');
				prefImg.setAttribute('fill', appColor);
				prefImg.setAttribute('stroke', 'none');
				prefImg.setAttribute('cursor', 'pointer');
				prefImg.setAttribute('transition', 'opacity 0.3 ease-in-out');
				prefImg.addEventListener("click", function () {
					changeRegion(pref);
					document.getElementById("main-title").innerHTML = getBilingualText(pref.english_name, pref.japanese_name);
				});
				prefImg.addEventListener('mouseover', () => {
					prefImg.setAttribute('opacity', '50%');
					hoveredRegion = pref.english_name;
					document.getElementById("main-title").innerHTML = getBilingualText(pref.english_name, pref.japanese_name);
					/*document.getElementById("main-title").style.opacity = "0%";
					setTimeout(()=>{
						document.getElementById("main-title").innerHTML = getBilingualText(pref.english_name, pref.japanese_name);
						document.getElementById("main-title").style.opacity = "100%";
					}, 300);*/
				});

				prefImg.addEventListener('mouseout', () => {
					prefImg.setAttribute('opacity', '100%');
					hoveredRegion = "";
					document.getElementById("main-title").innerHTML = "JAPAN / 日本";
					/*document.getElementById("main-title").style.opacity = "0%";
					setTimeout(()=>{
						document.getElementById("main-title").innerHTML = "JAPAN / 日本";
						document.getElementById("main-title").style.opacity = "100%";
					}, 300);*/
				});
			} else {
				prefImg.setAttribute('fill', 'lightgray');
			}
		});
	}, 1000);
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

	const svgObj = document.getElementById('japan-map');
	const svgDoc = svgObj.contentDocument;
	shuffledList.forEach(pref => {
		if (pref.english_name != selectedRegion.english_name) {
			setTimeout(() => {
				const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
				prefImg.setAttribute('opacity', '0%');
			}, 100);
		}
	});
}

// Photo gallery
function changeRegion(newRegion) {
	window.scrollTo(0, 0);

	const svgObj = document.getElementById('japan-map-mini');
	svgObj.data = "img/japan.svg"; //Fix? -> will only execute below once as is
	svgObj.addEventListener('load', function () {
		const svgDoc = svgObj.contentDocument;
		if (svgDoc) {
			const prefList = data.flatMap(region => region.prefectures);
			console.log(svgObj, svgDoc);
			prefList.forEach(pref => {
				const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
				if (pref.english_name != newRegion.english_name) {
					prefImg.setAttribute('fill', 'none');
					prefImg.setAttribute('stroke', 'none');
				} else {
					prefImg.setAttribute('fill', appColor);
					prefImg.setAttribute('stroke', 'none');
				}
			}
			);
			const japanImg = svgDoc.getElementById("japan-img");
			japanImg.setAttribute("viewBox", newRegion.viewbox);
		}
	});

	document.addEventListener("DOMContentLoaded", function () {
		const img = document.getElementById('picture1');
		img.onload = function () {
			EXIF.getData(this, function () {
				const dateTaken = this.exifdata.DateTimeOriginal;
				console.log(dateTaken); // prints the date the photo was taken in string format
			});
		};}
	);

	// add catch error?
	selectedRegion = newRegion;
	/*if(!isGalleryVisible){
		closeMapTransition();
	}*/	
	document.getElementById("pref-dates").innerHTML = getBilingualText(selectedRegion.dates_english, selectedRegion.dates_japanese);
	document.getElementById("pref-desc").innerHTML = getBilingualText(selectedRegion.description_english, selectedRegion.description_japanese);
	document.getElementById("pref-name").innerHTML = getBilingualText(selectedRegion.english_name, selectedRegion.japanese_name);
	if (!isGalleryVisible) {
		changeGalleryVisibility();
	}
	if (newRegion.image_list.length > 0) {
		let pic = document.getElementById("picture2");
		pic.src = newRegion.image_list[0].link;
		EXIF.getData(pic, function () {
			const dateTaken = this.exifdata.DateTimeOriginal;
			console.log(dateTaken); // prints the date the photo was taken in string format
		});
	}
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

function changeSelectedPicture(newPicture) {

}

function changeFullscreen() {
	isFullscreen = !isFullscreen;
	document.getElementById("fullscreen").style.visibility = isFullscreen ? "visible" : "hidden";
	document.getElementById("fullscreen-bg").style.visibility = isFullscreen ? "visible" : "hidden";
}

// Popup
function changePopupVisibility() {
	isPopupVisible = !isPopupVisible;
	document.getElementById("popup").style.visibility = isPopupVisible ? "visible" : "hidden";
	document.getElementById("popup-bg").style.visibility = isPopupVisible ? "visible" : "hidden";
}

function changePrefInfoVisibility() {
	isPrefInfoVisible = !isPrefInfoVisible;
	document.getElementById("pref-info").style.display = isPrefInfoVisible ? "flex" : "none";
	document.getElementById("pref-name-btn-down").style.display = isPrefInfoVisible ? "block" : "none";
	document.getElementById("pref-name-btn-up").style.display = isPrefInfoVisible ? "none" : "block";
}

function changePicInfoVisibility() {
	isPicInfoVisible = !isPicInfoVisible;
	document.getElementById("pic-info").style.display = isPicInfoVisible ? "flex" : "none";
}

function changeGalleryVisibility() {
	isGalleryVisible = !isGalleryVisible;
	document.getElementById("japan").style.display = isGalleryVisible ? "none" : "flex";
	document.getElementById("gallery").style.display = isGalleryVisible ? "block" : "none";
	document.getElementById("map-btn").style.display = isGalleryVisible ? "block" : "none";
	// document.getElementById("sidebar-btn").style.display = isGalleryVisible ? "none" : "block";
	/*document.getElementById("filter-bar").style.display = isGalleryVisible ? "flex" : "none";*/
	document.getElementById("pref-name").style.display = isGalleryVisible ? "block" : "none";
	document.getElementById("pref-name-btn-down").style.display = isGalleryVisible ? "block" : "none";
	document.getElementById("pref-name-btn-up").style.display = "none";
	document.getElementById("pref-info").style.display = isGalleryVisible ? "flex" : "none";
	isPrefInfoVisible = isGalleryVisible ? true : false;
	// document.getElementById("filter-btn").style.display = isGalleryVisible ? "block" : "none";
	if (!isGalleryVisible) {
		createMap(data);
	}
}

function main() {
	fetch('https://raw.githubusercontent.com/kymlu/travel-memories/main/js/data.json')
		.then(response => {
			return response.json();
		})
		.then(d => {
			data = d;
			createSidebar(d);
			createMap(d);
		})
		.catch(error => { console.error(error); });

	// document.getElementById("sidebar-btn").addEventListener("click", changeSidebarVisibility);
	// document.getElementById("sidebar-bg").addEventListener("click", changeSidebarVisibility);

	document.getElementById("popup-close-btn").addEventListener("click", changePopupVisibility);
	document.getElementById("popup").addEventListener("click", (event) => {
		event.stopPropagation();
	});
	document.getElementById("pic-info-btn").addEventListener("click", changePicInfoVisibility);
	document.getElementById("popup-bg").addEventListener("click", changePopupVisibility);
	document.getElementById("info-btn").addEventListener("click", changePopupVisibility);
	document.getElementById("map-btn").addEventListener("click", changeGalleryVisibility);
	document.getElementById("pref-name-btn-up").addEventListener("click", changePrefInfoVisibility);
	document.getElementById("pref-name-btn-down").addEventListener("click", changePrefInfoVisibility);
	document.getElementById("picture1").addEventListener("click", changeFullscreen);
	document.getElementById("fullscreen-bg").addEventListener("click", changeFullscreen);

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && isPopupVisible) {
			changePopupVisibility();
		}
	});

	// TODO: figure out pref info behaviour
	// window.addEventListener('scroll', function() {
	// 	var element = document.getElementById('pref-info');
	// 	var rect = element.getBoundingClientRect();
	// 	if (rect.bottom < 0 || rect.top > window.innerHeight) {
	// 	  // element is off the page
	// 	} else {
	// 	  // element is on the page

	// 	}
	//   });
}


main();
