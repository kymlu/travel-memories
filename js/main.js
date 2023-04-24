let isPopupVisible = false;

function changePopupVisibility(){
  isPopupVisible = !isPopupVisible;
  document.getElementById("popup").style.display = isPopupVisible ? "block" : "none"; // Get the HTML template
}
