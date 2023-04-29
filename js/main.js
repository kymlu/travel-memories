// Data 
let data = null;
fetch('data.json')
  .then(response => response.json())
  .then(d => {data = d; 
              document.getElementById("sidebar").style.backgroundColor = 'yellowgreen';
              console.log(d);})
  .catch(error => {console.error(error); 
                   document.getElementById("sidebar").style.backgroundColor = 'coral';})

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
  const svgObject = document.getElementById('shiga');
  const svgDoc = svgObject.contentDocument;
  const svg = svgDoc.getElementsByTagName('svg')[0];
  svg.classList.add('pref-img');
  
  const svgObject2 = document.getElementById('aomori');
  const svgDoc2 = svgObject2.contentDocument;
  const svg2 = svgDoc2.getElementsByTagName('svg')[0];
  svg2.classList.add('locked-pref-img');
  /*svg.setAttribute('viewBox', '600 600 650 650');
  svg.setAttribute('height', '500');
  svg.setAttribute('width', '500');*/
  svg.setAttribute('fill', 'pink');
  svg.setAttribute('stroke', 'pink');
  svg.setAttribute('stroke-width', '20px');
  
  svg2.setAttribute('fill', 'yellow');
  svg2.setAttribute('stroke', 'yellow');
  svg2.setAttribute('stroke-width', '20px');
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
