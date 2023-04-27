<!-- Popup -->

let isPopupVisible = false;

function changePopupVisibility(){
  isPopupVisible = !isPopupVisible;
  document.getElementById("popup").style.visibility = isPopupVisible ? "visible" : "hidden";
  document.getElementById("popup-background").style.visibility = isPopupVisible ? "visible" : "hidden";
}

document.getElementById("popup-close-btn").addEventListener("click", changePopupVisibility);
document.getElementById("popup-background").addEventListener("click", changePopupVisibility);
document.getElementById("info-button").addEventListener("click", changePopupVisibility);

document.addEventListener('keydown', function(event) {
  if(event.keyCode == 27 && isPopupVisible) {
    changePopupVisibility();
  }
})

<!-- Photo gallery -->
let selectedRegion = "";

function changeRegion(newRegion){
  selectedRegion = newRegion;
}

document.getElementById("Shiga").style.fill = "green";
document.getElementById("Shiga").style.stroke = "orange";
// Create a clone of element with id ddl_1:
let clone = document.getElementById('Shiga').cloneNode( true ); 

// Change the id attribute of the newly created element:
clone.setAttribute( 'id', "shiga2" );

clone.setAttribute("viewBox", "0 0 500 300"); 

// Append the newly created element on element p 
document.getElementById('shiga').insertAfter( clone );-->
