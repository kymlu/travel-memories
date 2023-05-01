// Variables
let selectedRegion = "";
let selectedPicture = null;
let isSidebarVisible = false;
let isPopupVisible = false;
let isGalleryVisible = false;
let isPictureVisible = false;
let currentFilter = "";
let data = null;

// Text
function getBilingualTitle(englishName, japaneseName){
	return englishName + " / " + japaneseName; 
}

// Popup
function changePopupVisibility(){
  isPopupVisible = !isPopupVisible;
  document.getElementById("popup").style.visibility = isPopupVisible ? "visible" : "hidden";
  document.getElementById("popup-bg").style.visibility = isPopupVisible ? "visible" : "hidden";
}
function changeGalleryVisibility(){
  isGalleryVisible = !isGalleryVisible;
  document.getElementById("japan-map").style.display = isGalleryVisible ? "none" : "block";
  document.getElementById("gallery").style.display = isGalleryVisible ? "block" : "none";
}

// Map
/*window.onload = function() {
  const svgObject = document.getElementById('japan');
  const svgDoc = svgObject.contentDocument;
  const svg = svgDoc.getElementsByTagName('svg')[0];
  svg.classList.add('pref-img');
  svg2.classList.add('locked-pref-img');
  setTimeout(() => {
    svg.classList.add('pref-img');
    svg2.classList.add('locked-pref-img');
  }, 1000);
  
  svg.setAttribute('viewBox', '600 600 650 650');
  svg.setAttribute('height', '500');
  svg.setAttribute('width', '500');
  setTimeout(()=>{
  svg.setAttribute('fill', 'pink');
  svg.setAttribute('stroke', 'pink');
  svg.setAttribute('stroke-width', '20px');
  
  
  const svg2 = document.getElementById('akita-img');
  svg2.setAttribute("fill", "blue");},100);
  
  
			var svgDoc5 = document.getElementsByTagName('object')[0].contentDocument;
			var path5 = svgDoc5.getElementById('iwate-img');
			path5.style.fill = 'purple';
			const tokyo = document.querySelector('#tokyo-img');
			tokyo.style.fill = 'peru';
  
  setTimeout(() => {
  svg.setAttribute('style', 'stroke: pink; fill: white; stroke-width: 30px;');
  svg.addEventListener('mouseover', () => {
    svg.setAttribute('style', 'fill: pink;');
  });
  svg.addEventListener('mouseout', () => {
    svg.setAttribute('style', 'fill: white;');
  });
   svg.setAttribute('pointer-events', 'none');
 });
}*/

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
		newRegionTitle.innerHTML = getBilingualTitle(region.english_name, region.japanese_name);
		newRegion.appendChild(newRegionTitle);
		region.prefectures.forEach(prefecture => {
			if (prefecture.visited){
				const newPrefecture = visitedPref.cloneNode();
				newPrefecture.innerHTML = getBilingualTitle(prefecture.english_name, prefecture.japanese_name);
				newPrefecture.addEventListener("click", function(){
					changeRegion(prefecture.english_name);
					changeSidebarVisibility();
					}, false);
				newRegion.appendChild(newPrefecture);
			} else {
				const newPrefecture = unvisitedPref.cloneNode();
				newPrefecture.innerHTML = getBilingualTitle(prefecture.english_name, prefecture.japanese_name);
				newRegion.appendChild(newPrefecture);
			}
		});
		sidebar.appendChild(newRegion);
	});
}

// Photo gallery
function changeRegion(newRegion){
// add catch error?
  selectedRegion = newRegion;
  let prefList = data.flatMap(region => region.prefectures);
  let prefData = prefList.find(pref => pref.english_name == newRegion);
  document.getElementById("pref-name").innerHTML = getBilingualTitle(prefData.english_name, prefData.japanese_name);
  document.getElementById("pref-dates").innerHTML = getBilingualTitle(prefData.dates_english, prefData.dates_japanese);
  document.getElementById("pref-desc").innerHTML = getBilingualTitle(prefData.description_english, prefData.description_japanese);
	if (!isGalleryVisible){
	  isGalleryVisible = !isGalleryVisible;
	  document.getElementById("japan-map").style.display = isGalleryVisible ? "none" : "block";
	  document.getElementById("gallery").style.display = isGalleryVisible ? "block" : "none";
	}
}

function changeGalleryFilter(newFilter){
	if(currentFilter != ""){
		document.getElementById(currentFilter + "-txt").style.display = none;
	}
	
	if(newFilter == currentFilter){
		currentFilter = "";
	} else {
		currentFilter = newFilter;
		document.getElementById(newFilter + "-txt").style.display = inline;
	}
}

function changeSelectedPicture(newPicture){
	
}

function changePictureVisibility(){
	isPictureVisible = !isPictureVisible;
}

//document.getElementById("Shiga").style.fill = "green";
//document.getElementById("Shiga").style.stroke = "orange";
// Create a clone of element with id ddl_1:
//let clone = document.getElementById('Shiga').cloneNode( true ); 
//let clone = document.getElementById('japan').cloneNode( true ); 
// Change the id attribute of the newly created element:
//clone.setAttribute( 'id', "shiga2" );

//document.body.appendChild( clone );
//clone.setAttribute("viewBox", "0 0 500 300"); 
// Append the newly created element on element p 
//document.getElementById('shiga').insertAfter( clone );

function main(){
	document.getElementById("sidebar-btn").addEventListener("click", changeSidebarVisibility);
	document.getElementById("sidebar-bg").addEventListener("click", changeSidebarVisibility);
	
	fetch('js/data.json')
	  .then(response => { 
	  	console.log(response); 
		return response.json();})
	  .then(d => {data = d; 
	  		// console.log(d);
			createSidebar(d);
		})
	  .catch(error => {console.error(error); });
	  
	document.getElementById("popup-close-btn").addEventListener("click", changePopupVisibility);
	document.getElementById("popup-bg").addEventListener("click", changePopupVisibility);
	document.getElementById("info-btn").addEventListener("click", changePopupVisibility);
	//document.getElementById("switch-btn").addEventListener("click", changeGalleryVisibility);
	const div1 = document.createElement("div");
	div1.innerHTML = "Pic of prefecture・都道府県の写真"
	div1.id = "pref-pic"
	const div2 = document.createElement("div");
	div2.innerHTML = "Name of prefecture・都道府県"
	div2.id = "pref-name"
	const div3 = document.createElement("div");
	div3.innerHTML = "Dates visited・日付"
	div3.id = "pref-dates"
	const div4 = document.createElement("div");
	div4.innerHTML = "Cities visited・町"
	div4.id = "pref-cities"
	const div5 = document.createElement("div");
	div5.innerHTML = "Description etc.・説明など"
	div5.id = "pref-desc"
	document.getElementById("pref-info").appendChild(div1);
	document.getElementById("pref-info").appendChild(div2);
	document.getElementById("pref-info").appendChild(div3);
	document.getElementById("pref-info").appendChild(div4);
	document.getElementById("pref-info").appendChild(div5);

	document.addEventListener('keydown', function(event) {
	  if(event.keyCode == 27 && isPopupVisible) {
	    changePopupVisibility();
	  }
	})
  
	document.getElementById("filter-food").addEventListener("hover", function(event) {console.log("food"); document.getElementById("filter-food-txt").style.display = "inline";});
	document.getElementById("filter-food").addEventListener("click", function(event) {console.log("food2"); changeGalleryFilter("filter-food");});
	
	document.getElementById("filter-nat").addEventListener("hover", function(event) {console.log("nature"); document.getElementById("filter-nat-txt").style.display = "inline";});
	document.getElementById("filter-nat").addEventListener("click", function(event) {console.log("nature2"); changeGalleryFilter("filter-nat");});
	
	document.getElementById("filter-art").addEventListener("hover", function(event) {console.log("art"); document.getElementById("filter-art-txt").style.display = "inline";});
	document.getElementById("filter-art").addEventListener("click", function(event) {console.log("art2"); changeGalleryFilter("filter-art");});
	
	document.getElementById("filter-attr").addEventListener("hover", function(event) {console.log("attractions"); document.getElementById("filter-attr-txt").style.display = "inline";});
	document.getElementById("filter-attr").addEventListener("click", function(event) {console.log("attractions2"); changeGalleryFilter("filter-attr");});
	
	document.getElementById("filter-myst").addEventListener("hover", function(event) {console.log("mystery"); document.getElementById("filter-myst-txt").style.display = "inline";});
	document.getElementById("filter-myst").addEventListener("click", function(event) {console.log("mystery2"); changeGalleryFilter("filter-myst");});
}

  
  main();
