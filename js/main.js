// Data 
let data = null;
fetch('js/data.json')
  .then(response => { console.log(response); response.json();})
  .then(d => {data = d; 
              console.log(d);})
  .catch(error => {console.error(error); });
  
function getBilingualTitle(englishName, japaneseName){
	return englishName + " / " + japaneseName; 
}

// Popup

let isPopupVisible = false;

function changePopupVisibility(){
  isPopupVisible = !isPopupVisible;
  document.getElementById("popup").style.visibility = isPopupVisible ? "visible" : "hidden";
  document.getElementById("popup-bg").style.visibility = isPopupVisible ? "visible" : "hidden";
}

document.getElementById("popup-close-btn").addEventListener("click", changePopupVisibility);
document.getElementById("popup-bg").addEventListener("click", changePopupVisibility);
document.getElementById("info-btn").addEventListener("click", changePopupVisibility);

document.addEventListener('keydown', function(event) {
  if(event.keyCode == 27 && isPopupVisible) {
    changePopupVisibility();
  }
})

// Map
window.onload = function() {
  const svgObject = document.getElementById('japan');
  const svgDoc = svgObject.contentDocument;
  const svg = svgDoc.getElementsByTagName('svg')[0];
  //svg.classList.add('pref-img');
  //svg2.classList.add('locked-pref-img');
  //setTimeout(() => {
    //svg.classList.add('pref-img');
    //svg2.classList.add('locked-pref-img');
  //}, 1000);
  
  /*svg.setAttribute('viewBox', '600 600 650 650');
  svg.setAttribute('height', '500');
  svg.setAttribute('width', '500');*/
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
  
  /*setTimeout(() => {
  svg.setAttribute('style', 'stroke: pink; fill: white; stroke-width: 30px;');
  svg.addEventListener('mouseover', () => {
    svg.setAttribute('style', 'fill: pink;');
  });
  svg.addEventListener('mouseout', () => {
    svg.setAttribute('style', 'fill: white;');
  });
   svg.setAttribute('pointer-events', 'none');
 });*/
}

// Sidebar

let isSidebarVisible = false;
function changeSidebarVisibility(){
  isSidebarVisible = !isSidebarVisible;
  document.getElementById("sidebar").style.visibility = isSidebarVisible ? "visible" : "hidden";
  document.getElementById("sidebar-bg").style.visibility = isSidebarVisible ? "visible" : "hidden";
}
document.getElementById("sidebar-btn").addEventListener("click", changeSidebarVisibility);
document.getElementById("sidebar-bg").addEventListener("click", changeSidebarVisibility);

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
	newRegionTitle.innerHTML = getBilingualTitle(region.englishName, region.japaneseName);
	newRegion.appendChild(newRegionTitle);
	region.prefectures.forEach(prefecture => {
		if (prefecture.visited){
			const newPrefecture = visitedPref.cloneNode();
			newPrefecture.innerHTML = getBilingualTitle(prefecture.englishName, prefecture.japaneseName);
			newPrefecture.addEventListener("click", function(){
				changeRegion(prefecture.englishName);
				}, false);
			newRegion.appendChild(newPrefecture);
		} else {
			const newPrefecture = unvisitedPref.cloneNode();
			newPrefecture.innerHTML = getBilingualTitle(prefecture.englishName, prefecture.japaneseName);
			newRegion.appendChild(newPrefecture);
		}
	});
	document.getElementById("sidebar").appendChild(newRegion);
});

// Photo gallery
let selectedRegion = "";

function changeRegion(newRegion){
  selectedRegion = newRegion;
}

//document.getElementById("Shiga").style.fill = "green";
//document.getElementById("Shiga").style.stroke = "orange";
// Create a clone of element with id ddl_1:
let clone = document.getElementById('Shiga').cloneNode( true ); 
//let clone = document.getElementById('japan').cloneNode( true ); 
// Change the id attribute of the newly created element:
clone.setAttribute( 'id', "shiga2" );

//document.body.appendChild( clone );
//clone.setAttribute("viewBox", "0 0 500 300"); 
// Append the newly created element on element p 
//document.getElementById('shiga').insertAfter( clone );
