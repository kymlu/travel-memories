let isPopupVisible = false;

function changePopupVisibility(){
  isPopupVisible = !isPopupVisible;
  document.getElementById("popup").style.display = isPopupVisible ? "visible" : "hidden";
}
