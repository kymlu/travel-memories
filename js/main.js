<!-- Photo gallery -->
let selectedRegion = "";

function changeRegion(newRegion){
  selectedRegion = newRegion;
}

<!--document.getElementById("Shiga").style.fill = "green";document.getElementById("Shiga").style.stroke = "orange";-->

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
