// Variables
var selectedRegion = null;
var selectedPicture = null;
var hoveredRegion = "";
var isSidebarVisible = false;
var isPopupVisible = false;
var isGalleryVisible = false;
var isPictureVisible = false;
var isPrefInfoVisible = false;
var currentFilter = "";
var data = null;

const appColor = "#be0029";

// Text
function getBilingualText(english, japanese){
	return english + " / " + japanese; 
}

// Sidebar
function changeSidebarVisibility(){
  isSidebarVisible = !isSidebarVisible;
  document.getElementById("sidebar").style.visibility = isSidebarVisible ? "visible" : "hidden";
  document.getElementById("sidebar-bg").style.visibility = isSidebarVisible ? "visible" : "hidden";
}

function createSidebar(data){
	const sidebar = document.getElementById("sidebar");
	sidebar.innerHTML = "";
	
	const regionGroup = document.createElement("div");
	regionGroup.classList.add("region-group");

	const regionTitle = document.createElement("div");
	regionTitle.classList.add("region-text");

	const visitedPref = document.createElement("div");
	visitedPref.classList.add("prefecture-text", "visited-pref-text");

	const unvisitedPref = document.createElement("div");
	unvisitedPref.classList.add("prefecture-text", "locked-pref-text");
	data.forEach(region => 
	{
		const newRegion = regionGroup.cloneNode();
		const newRegionTitle = regionTitle.cloneNode();
		newRegionTitle.innerHTML = getBilingualText(region.english_name, region.japanese_name);
		newRegion.appendChild(newRegionTitle);
		region.prefectures.forEach(prefecture => {
			if (prefecture.visited){
				const newPrefecture = visitedPref.cloneNode();
				newPrefecture.innerHTML = getBilingualText(prefecture.english_name, prefecture.japanese_name);
				newPrefecture.addEventListener("click", function(){
					changeRegion(prefecture.english_name);
					changeSidebarVisibility();
					}, false);
				newRegion.appendChild(newPrefecture);
			} else {
				const newPrefecture = unvisitedPref.cloneNode();
				newPrefecture.innerHTML = getBilingualText(prefecture.english_name, prefecture.japanese_name);
				newRegion.appendChild(newPrefecture);
			}
		});
		sidebar.appendChild(newRegion);
	});
}

// Map
function createMap(data){
	setTimeout(()=>{
	console.log("create map!");
	const svgObj = document.getElementById('japan-map');
	const svgDoc = svgObj.contentDocument;
	
	const prefList = data.flatMap(region => region.prefectures);
	prefList.forEach(pref => {
		const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
		if(pref.visited) {
			prefImg.setAttribute('transition', 'opacity 0.3s ease-in-out');
			prefImg.setAttribute('fill', appColor);
			prefImg.setAttribute('stroke', 'none');
			prefImg.setAttribute('cursor', 'pointer');
			prefImg.setAttribute('opacity', 'visibility 0.3 ease-in-out');
			prefImg.addEventListener("click", function(){
				changeRegion(pref);		
				document.getElementById("main-title").innerHTML = getBilingualText(pref.english_name, pref.japanese_name);
			});  
			prefImg.addEventListener('mouseover', () => {
				prefImg.setAttribute('opacity', '50%');
				hoveredRegion = pref.english_name;
				document.getElementById("main-title").innerHTML = getBilingualText(pref.english_name, pref.japanese_name);
			  });

			prefImg.addEventListener('mouseout', () => {
				prefImg.setAttribute('opacity', '100%');
				hoveredRegion = "";
				document.getElementById("main-title").innerHTML = "JAPAN / 日本";
			  });

		} else {
			prefImg.setAttribute('fill', 'lightgray');
		}
	});
	}, 100);
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function closeMapTransition(){
	const prefList = data.flatMap(region => region.prefectures);
	var shuffledList = shuffle(prefList);
	
	const svgObj = document.getElementById('japan-map');
	const svgDoc = svgObj.contentDocument;
	shuffledList.forEach(pref => {
		if(pref.english_name != selectedRegion.english_name){
			setTimeout(() => {
				const prefImg = svgDoc.getElementById(pref.english_name.toLowerCase() + "-img");
				prefImg.setAttribute('opacity', '0%');}, 100);
		}
	});
}

// Photo gallery
function changeRegion(newRegion){
// add catch error?
	console.log("change region");
  selectedRegion = newRegion;
	//closeMapTransition();
  document.getElementById("pref-name").innerHTML = getBilingualText(selectedRegion.english_name, selectedRegion.japanese_name);
  document.getElementById("pref-dates").innerHTML = getBilingualText(selectedRegion.dates_english, selectedRegion.dates_japanese);
  document.getElementById("pref-desc").innerHTML = getBilingualText(selectedRegion.description_english, selectedRegion.description_japanese);
  document.getElementById("pref-name-btn").innerHTML = getBilingualText(selectedRegion.english_name, selectedRegion.japanese_name);
	if (!isGalleryVisible){
		changeGalleryVisibility();
	}
}

function changeGalleryFilter(newFilter){
	if(newFilter == currentFilter){
		currentFilter = "";
	} else {
		if(currentFilter != ""){
			document.getElementById(currentFilter + "-txt").style.display = "none";
		}
		currentFilter = newFilter;
	}
}

function changeSelectedPicture(newPicture){
	
}

function changePictureVisibility(){
	isPictureVisible = !isPictureVisible;
}

// Popup
function changePopupVisibility(){
  isPopupVisible = !isPopupVisible;
  document.getElementById("popup").style.visibility = isPopupVisible ? "visible" : "hidden";
  document.getElementById("popup-bg").style.visibility = isPopupVisible ? "visible" : "hidden";
}

function changePrefInfoVisibility(){
	isPrefInfoVisible = !isPrefInfoVisible;
	document.getElementById("pref-info").style.visibility = isPopupVisible ? "visible" : "hidden";
}

function changeGalleryVisibility(){
  isGalleryVisible = !isGalleryVisible;
  document.getElementById("japan").style.display = isGalleryVisible ? "none" : "block";
  document.getElementById("gallery").style.display = isGalleryVisible ? "block" : "none";
  document.getElementById("switch-btn").style.display = isGalleryVisible ? "block" : "none";
  document.getElementById("filter-bar").style.display = isGalleryVisible ? "flex" : "none";
  document.getElementById("pref-name-btn").style.display = isGalleryVisible ? "block" : "none";
	if (!isGalleryVisible){
		createMap(data);
	}
}

function main(){
	fetch('js/data.json')
		  .then(response => { 
			console.log(response); 
			return response.json();})
		  .then(d => {data = d; 
				console.log(d);
			      createSidebar(d);
			      setTimeout(()=>{createMap(d);}, 1000);
			})
		  .catch(error => {console.error(error); });
	
	document.getElementById("sidebar-btn").addEventListener("click", changeSidebarVisibility);
	document.getElementById("sidebar-bg").addEventListener("click", changeSidebarVisibility);
	  
	document.getElementById("popup-close-btn").addEventListener("click", changePopupVisibility);
	document.getElementById("popup-bg").addEventListener("click", changePopupVisibility);
	document.getElementById("info-btn").addEventListener("click", changePopupVisibility);
	document.getElementById("switch-btn").addEventListener("click", changeGalleryVisibility);
	document.getElementById("pref-name-btn").addEventListener("click", changePrefInfoVisibility);
	
	const div1 = document.createElement("div");
	div1.innerHTML = "Pic of prefecture・都道府県の写真";
	div1.id = "pref-pic";
	const div2 = document.createElement("div");
	div2.innerHTML = "Name of prefecture・都道府県";
	div2.id = "pref-name";
	const div3 = document.createElement("div");
	div3.innerHTML = "Dates visited・日付";
	div3.id = "pref-dates";
	const div4 = document.createElement("div");
	div4.innerHTML = "Cities visited・町";
	div4.id = "pref-cities";
	const div5 = document.createElement("div");
	div5.innerHTML = "Description etc.・説明など";
	div5.id = "pref-desc";
	document.getElementById("pref-info").appendChild(div1);
	document.getElementById("pref-info").appendChild(div2);
	document.getElementById("pref-info").appendChild(div3);
	document.getElementById("pref-info").appendChild(div4);
	document.getElementById("pref-info").appendChild(div5);

	document.addEventListener('keydown', function(event) {
	  if(event.keyCode == 27 && isPopupVisible) {
	    changePopupVisibility();
	  }
	});
	document.getElementById("filter-food").addEventListener("mouseover", function(event) {document.getElementById("filter-food-txt").style.display = "inline";});
	document.getElementById("filter-food").addEventListener("mouseout", function(event) {if(currentFilter != "filter-food"){document.getElementById("filter-food-txt").style.display = "none";}});
	document.getElementById("filter-food").addEventListener("click", function(event) {changeGalleryFilter("filter-food");});
	
	document.getElementById("filter-nat").addEventListener("mouseover", function(event) {document.getElementById("filter-nat-txt").style.display = "inline";});
	document.getElementById("filter-nat").addEventListener("mouseout", function(event) {if(currentFilter != "filter-nat"){document.getElementById("filter-nat-txt").style.display = "none";}});
	document.getElementById("filter-nat").addEventListener("click", function(event) {changeGalleryFilter("filter-nat");});
	
	document.getElementById("filter-art").addEventListener("mouseover", function(event) {document.getElementById("filter-art-txt").style.display = "inline";});
	document.getElementById("filter-art").addEventListener("mouseout", function(event) {if(currentFilter != "filter-art"){document.getElementById("filter-art-txt").style.display = "none";}});
	document.getElementById("filter-art").addEventListener("click", function(event) {changeGalleryFilter("filter-art");});
	
	document.getElementById("filter-attr").addEventListener("mouseover", function(event) {document.getElementById("filter-attr-txt").style.display = "inline";});
	document.getElementById("filter-attr").addEventListener("mouseout", function(event) {if(currentFilter != "filter-attr"){document.getElementById("filter-attr-txt").style.display = "none";}});
	document.getElementById("filter-attr").addEventListener("click", function(event) {changeGalleryFilter("filter-attr");});
	
	document.getElementById("filter-myst").addEventListener("mouseover", function(event) {document.getElementById("filter-myst-txt").style.display = "inline";});
	document.getElementById("filter-myst").addEventListener("mouseout", function(event) {if(currentFilter != "filter-myst"){document.getElementById("filter-myst-txt").style.display = "none";}});
	document.getElementById("filter-myst").addEventListener("click", function(event) {changeGalleryFilter("filter-myst");});
}

  
  main();
