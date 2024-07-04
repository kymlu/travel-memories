var favouritedTag;
/**** Googling picture info ****/
function search(searchTerm) {
	window.open("https://www.google.com/search?q=" + searchTerm);
}

function searchEnglish() {
	search(searchTermEng);
}

function searchJapanese() {
	search(searchTermJp)
}

/**** Fullscreen Picture ****/
function changeFullscreenPicture(isForward) {
	if (isForward) {
		if (visibleImgs.length > 0) {
			let ind = visibleImgs.indexOf(selectedPicInd);
			if (ind == visibleImgs.length - 1) {
				selectedPicInd = visibleImgs[0];
			} else {
				selectedPicInd = visibleImgs[ind + 1];
			}
		} else {
			if (selectedPicInd == (imgList.length - 1)) {
				selectedPicInd = 0;
			} else {
				selectedPicInd++;
			}
		}
	} else {
		if (visibleImgs.length > 0) {
			let ind = visibleImgs.indexOf(selectedPicInd);
			if (ind == 0) {
				selectedPicInd = visibleImgs[visibleImgs.length - 1];
			} else {
				selectedPicInd = visibleImgs[ind - 1];
			}
		} else {
			if (selectedPicInd == 0) {
				selectedPicInd = imgList.length - 1;
			} else {
				selectedPicInd--;
			}
		}
	}
	selectedPic = imgList[selectedPicInd];
	setFullscreenPicture(isForward);
}

function setFullscreenInfo() {
	if (selectedPic.date) {
		let date = getPictureDate(new Date(selectedPic.date), selectedPic.offset);
		document.getElementById("fullscreen-eng-date").innerHTML = getEnglishDate(date, true, selectedPic.offset);
		document.getElementById("fullscreen-jp-date").innerHTML = getJapaneseDate(date, true, selectedPic.offset);
	} else {
		document.getElementById("fullscreen-eng-date").innerHTML = "Unknown date";
		document.getElementById("fullscreen-jp-date").innerHTML = "不明な日付";
	}
	let area = areaList.find(function (area) { return area.id == selectedPic.area });
	searchTermEng = (selectedPic.location_english ?
		(selectedPic.location_english + ", ") :
		selectedCountry == JAPAN && selectedPic.location_japanese ? (selectedPic.location_japanese + ", ") :
			selectedCountry == TAIWAN && selectedPic.location_chinese ? (selectedPic.location_chinese + ", ") :
				"") + (area.english_name ?? "");
	document.getElementById("fullscreen-eng-city").innerHTML = searchTermEng;
	searchTermJp = (area.japanese_name ?? area.english_name ?? "") + (selectedPic.location_japanese ? ("　" + selectedPic.location_japanese) :
		(selectedCountry == TAIWAN && selectedPic.location_chinese) ? ("　" + selectedPic.location_chinese) :
			selectedPic.location_english ? ("　" + selectedPic.location_english) : "");
	document.getElementById("fullscreen-jp-city").innerHTML = searchTermJp;


	if (selectedPic.description_english) {
		addRemoveNoDisplay("fullscreen-eng-caption", false);
		document.getElementById("fullscreen-eng-caption").innerHTML = selectedPic.description_english;
	} else {
		addRemoveNoDisplay("fullscreen-eng-caption", true);
	}
	if (selectedPic.description_japanese) {
		addRemoveNoDisplay("fullscreen-jp-caption", false);
		document.getElementById("fullscreen-jp-caption").innerHTML = selectedPic.description_japanese;
	} else {
		addRemoveNoDisplay("fullscreen-jp-caption", true);
	}

	if (selectedPic.camera_model) {
		addRemoveNoDisplay("camera-info", false);
		document.getElementById("camera-info").innerHTML = selectedPic.camera_model;
	} else {
		addRemoveNoDisplay("camera-info", true);
	}

	if (selectedPic.lens) {
		addRemoveNoDisplay("lens-info", false);
		document.getElementById("lens-info").innerHTML = selectedPic.lens;
	} else {
		addRemoveNoDisplay("lens-info", true);
	}

	document.getElementById("technical-info").replaceChildren();
	let tempElement = null;
	if (selectedPic.f_stop) {
		tempElement = document.createElement("div");
		tempElement.innerHTML = "\u0192/" + selectedPic.f_stop;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if (selectedPic.shutter_speed) {
		tempElement = document.createElement("div");
		tempElement.innerHTML = selectedPic.shutter_speed;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if (selectedPic.iso) {
		tempElement = document.createElement("div");
		tempElement.innerHTML = "iso " + selectedPic.iso;
		document.getElementById("technical-info").appendChild(tempElement);
	}
	if (tempElement == null) {
		addRemoveNoDisplay("technical-info", true);
	} else {
		addRemoveNoDisplay("technical-info", false);
	}

	selectedPic.tags.map(x => { return TAGS.find(function (t) { return t.id == x }) })
		.sort(sortByEnglishName)
		.forEach(tag => {
			tempElement = document.createElement("div");
			tempElement.classList.add("img-tag");
			tempElement.innerHTML = getBilingualText(tag.english_name, tag.japanese_name);
			document.getElementById("img-tags").appendChild(tempElement);
		});

	if (selectedPic.is_favourite) {
		document.getElementById("img-tags").appendChild(favouritedTag);
	}
}

function setFullscreenPicture(isForward) {
	document.getElementById("img-tags").replaceChildren();

	let src = selectedPic.link ?? "assets/img/" + selectedCountry + "/" + (isSingleRegion ? rgnsList[0].id : selectedPic.rgn.id) + "/" + selectedPic.file_name;

	if (isNewFullscreenInstance || (new Date() - lastSwipeTime) < 300) {
		document.getElementById("fullscreen-pic").src = src;
		isNewFullscreenInstance = false;
	} else {
		let nextPic = document.getElementById("fullscreen-pic-next");
		let currentPic = document.getElementById("fullscreen-pic");

		addRemoveNoDisplay([nextPic], true);
		nextPic.src = src;
		nextPic.classList.add(isForward ? "fullscreen-pic-right" : "fullscreen-pic-left");

		setTimeout(() => {
			addRemoveNoDisplay([nextPic], false);
			addRemoveTransparent([nextPic], false);
			addRemoveTransparent([currentPic], true);
			nextPic.classList.remove(isForward ? "fullscreen-pic-right" : "fullscreen-pic-left");
			currentPic.classList.add(isForward ? "fullscreen-pic-left" : "fullscreen-pic-right");

			setTimeout(() => {
				addRemoveNoDisplay([currentPic], true);
				addRemoveTransparent([currentPic], false);
				currentPic.src = src;
				currentPic.classList.remove(isForward ? "fullscreen-pic-left" : "fullscreen-pic-right");
				setTimeout(() => {
					addRemoveNoDisplay([currentPic], false);
					addRemoveNoDisplay([nextPic], true);
					addRemoveTransparent([nextPic], true);
					nextPic.classList.remove("fullscreen-pic-in");
				}, 100);
			}, 100);
		}, 20);
	}
	lastSwipeTime = new Date();
	setFullscreenInfo();
}

function openFullscreen() {
	if (isPortraitMode()) {
		isPicInfoVisible = false;
		addRemoveTransparent("pic-info", true);
		hidePicInfo();
		setTimeout(() => {
			addRemoveTransparent("pic-info", false);
		}, DEFAULT_TIMEOUT);
	}
	isFullscreen = true;
	document.body.style.overflowY = "hidden";
	document.getElementById("fullscreen").style.visibility = "visible";
	addRemoveTransparent(["fullscreen", "fullscreen-bg"], false);
}

function closeFullscreen(forceClose) {
	isFullscreen = false;
	document.body.style.overflowY = "auto";
	if (forceClose) {
		document.getElementById("fullscreen").style.visibility = "hidden";
		addRemoveTransparent(["fullscreen", "fullscreen-bg"], true);
	} else {
		addRemoveTransparent(["fullscreen", "fullscreen-bg"], true);
		setTimeout(() => {
			document.getElementById("fullscreen").style.visibility = "hidden";
		}, DEFAULT_TIMEOUT);
	}
}

/**** Fullscreen Picture Info ****/
function showPicInfo() {
	isPicInfoVisible = true;
	addRemoveNoDisplay("pic-info", false);
	let element = document.getElementById("pic-info-drawer");
	//TODO: transition on first portrait mode open
	addRemoveNoDisplay([element], false);
	setTimeout(() => {
		element.style.bottom = "0";
		element.style.marginRight = "0px";
	}, 20);
}

function hidePicInfo() {
	isPicInfoVisible = false;
	let element = document.getElementById("pic-info-drawer");
	element.style.bottom = "-" + element.getBoundingClientRect().height + "px";
	element.style.marginRight = "-" + element.getBoundingClientRect().width + "px";
	setTimeout(() => {
		addRemoveNoDisplay([element], true);
		addRemoveNoDisplay("pic-info", true);
	}, DEFAULT_TIMEOUT);
}

function changePicInfoVisibility(isVisible) {
	if (isVisible == undefined) {
		isVisible = !isPicInfoVisible;
	}

	if (isVisible) {
		showPicInfo();
	} else {
		hidePicInfo();
	}
}