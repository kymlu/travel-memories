let isPopupVisible = false;

function changePopupVisibility(){
  isPopupVisible = !isPopupVisible;
  document.getElementById("popup").isVisible = isPopupVisible; // Get the HTML template
}
