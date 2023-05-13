// Variables
let selectedRegion = null;
let selectedPicture = null;
let selectedPictureIndex = 0;
let hoveredRegion = "";
let isSidebarVisible = false;
let isPopupVisible = false;
let isGalleryVisible = false;
let isFullscreen = false;
let isPrefInfoVisible = false;
let isPicInfoVisible = true;
let currentFilter = "";
let data = null;

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let branch, leftBranch, leftPoint, rightBranch, rightPoint;
let polaroid, polaroidImgFrame, polaroidImg, polaroidCaption, polaroidCaptionText, polaroidDate, singleDate;

let appColor = "#be0029";

// Text
function getBilingualText(english, japanese) {
	return english + " / " + japanese;
}

function getEnglishDate(date){
	return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function getJapaneseDate(date){
	return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" +date.getDate() + "日";
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
		//console.log(svgObj, svgDoc);
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

function changeRegion(newRegion) {
	selectedRegion = newRegion;
	
	window.scrollTo(0, 0);

	const svgObj = document.getElementById('japan-map-mini');
	svgObj.data = "img/japan.svg"; //Fix? -> will only execute below once as is
	svgObj.addEventListener('load', function () {
		const svgDoc = svgObj.contentDocument;
		if (svgDoc) {
			const prefList = data.flatMap(region => region.prefectures);
			//console.log(svgObj, svgDoc);
			prefList.forEach(pref => {
				const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
				if (pref.english_name != selectedRegion.english_name) {
					prefImg.setAttribute('fill', 'none');
					prefImg.setAttribute('stroke', 'none');
				} else {
					prefImg.setAttribute('fill', appColor);
					prefImg.setAttribute('stroke', 'none');
				}
			}
			);
			const japanImg = svgDoc.getElementById("japan-img");
			japanImg.setAttribute("viewBox", selectedRegion.viewbox);
		}
	});

	// add catch error?
	/*if(!isGalleryVisible){
		closeMapTransition();
	}*/	

	document.getElementById("pref-dates").innerHTML = getBilingualText(selectedRegion.dates_english, selectedRegion.dates_japanese);
	document.getElementById("pref-desc").innerHTML = getBilingualText(selectedRegion.description_english, selectedRegion.description_japanese);
	document.getElementById("pref-name").innerHTML = getBilingualText(selectedRegion.english_name, selectedRegion.japanese_name);
	if (!isGalleryVisible) {
		changeGalleryVisibility();
	}
	
	let isLeft = true;
	let leftColumn = document.getElementById("left-column");
	leftColumn.innerHTML = "";
	let rightColumn = document.getElementById("right-column");
	rightColumn.innerHTML = "";
	if (selectedRegion.image_list.length > 0) {
		let i = 0;
		let angleI = 3
		selectedRegion.image_list.forEach(img => {
			let pol = polaroid.cloneNode();
			let randRotation = (Math.round(Math.random() * 8) % 8) + 4;
			pol.style.transform = "rotate(" + (angleI >= 2 ? "" : "-") + randRotation +"deg)";
			let polImgFrame = polaroidImgFrame.cloneNode();
			let polImg = polaroidImg.cloneNode();
			let polCaption = polaroidCaption.cloneNode();
			let polDate = polaroidDate.cloneNode();
			let polDateEn = singleDate.cloneNode();
			let polDateJp = singleDate.cloneNode();
			let polCaptionTextEn = polaroidCaptionText.cloneNode();
			let polCaptionTextJp = polaroidCaptionText.cloneNode();
			pol.appendChild(polImgFrame);
			polImgFrame.appendChild(polImg);
			pol.appendChild(polCaption);
			polCaption.appendChild(polDate);
			polDate.appendChild(polDateEn);
			polDate.appendChild(polDateJp);
			polCaption.appendChild(polCaptionTextEn);
			polCaption.appendChild(polCaptionTextJp);
			let date = new Date(img.date);
			polDateEn.innerHTML = getEnglishDate(date);
			polDateJp.innerHTML = getJapaneseDate(date);
			polCaptionTextEn.innerHTML = img.description_english;
			polCaptionTextJp.innerHTML = img.description_japanese;
			pol.addEventListener("click", function(){
				selectedPicture = img;
				selectedPictureIndex = i;
				setFullscreenPicture();
				changeFullscreen();
			});
			polImg.onload = function() {
				if(this.width > this.height){
					polImg.style.height = "100%";
					polImg.style.width = "auto";
				}
			}
			polImg.src = img.link;

			if(isLeft){
				leftColumn.appendChild(leftBranch.cloneNode(true));
				leftColumn.appendChild(pol);
			} else {
				rightColumn.appendChild(rightBranch.cloneNode(true));
				rightColumn.appendChild(pol);
			}
			isLeft = !isLeft;
			i++;
			angleI = (angleI + 1) % 4;
		});
	} else {
		leftColumn.innerHTML = "Pictures coming soon!"
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

function changeFullscreenPicture(isForward) {
	if (isForward){
		selectedPictureIndex = (selectedPictureIndex + 1) % selectedRegion.image_list.length;
	} else {
		selectedPictureIndex = (selectedPictureIndex - 1) % selectedRegion.image_list.length;
	}
	selectedPicture = selectedRegion.image_list[selectedPictureIndex];
	setFullscreenPicture();
}

function setFullscreenPicture(){
	document.getElementById("fullscreen-pic").src = selectedPicture.link;
	let date = new Date(selectedPicture.date);
	document.getElementById("fullscreen-date").innerHTML = getBilingualText(getEnglishDate(date), getJapaneseDate(date));
	let area = selectedRegion.areas.find(function(area){return area.id == selectedPicture.city});
	document.getElementById("fullscreen-city").innerHTML = getBilingualText(area.english_name, area.japanese_name);
	document.getElementById("fullscreen-eng-caption").innerHTML = selectedPicture.description_english;
	document.getElementById("fullscreen-jp-caption").innerHTML = selectedPicture.description_japanese;
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
	document.getElementById("top-bar").style.position = isGalleryVisible ? "sticky" : "absolute";
	document.getElementById("top-bar").style.boxShadow = isGalleryVisible ? "box-shadow: 0 8px 10px -10px #00000050;" : "none";
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
			data.forEach(region => {
				region.prefectures.forEach(pref => {
					if (pref.image_list != null){
						pref.image_list.sort(function (a, b) {return new Date(a.date) - new Date(b.date);});
					}
				});
			});
			createSidebar(data);
			createMap(data);
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
	document.getElementById("fullscreen-bg").addEventListener("click", changeFullscreen);
	document.getElementById("left-arrow").addEventListener("click", function(){changeFullscreenPicture(false);});
	document.getElementById("right-arrow").addEventListener("click", function(){changeFullscreenPicture(true);});

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && isPopupVisible) {
			changePopupVisibility();
		}
	});

	createTemplates();

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
