export function getPictureDate(date, picOffset) {
	// picOffset is in hours
	const localOffset = new Date().getTimezoneOffset();
	return new Date(date.getTime() - ((picOffset * -60) - localOffset) * 60000);
}

export function getBilingualText(english, japanese) {
	return english + (japanese ? (" – " + japanese) : "");
}

export function isPortraitMode() {
	return window.innerHeight > window.innerWidth;
}

export function sortByEnglishName(a, b) {
	let a1 = a.english_name.toLowerCase();
	let b1 = b.english_name.toLowerCase();

	if (a1 < b1) {
		return -1;
	}
	if (a1 > b1) {
		return 1;
	}
	return 0;
}

export function sortImgs(a, b) {
	return new Date(a.date) - new Date(b.date);
}

export function addRemoveClass(elements, className, isAdd) {
	if (elements) {
		if (typeof (elements) == 'string') {
			let element = document.getElementById(elements);
			if (element.classList) {
				if (isAdd) {
					element.classList.add(className);
				} else {
					element.classList.remove(className);
				}
			}
		} else {
			if (elements.length > 0) {
				if (typeof (elements[0]) == 'string') {
					if (isAdd) {
						elements.forEach(element => document.getElementById(element).classList.add(className));
					} else {
						elements.forEach(element => document.getElementById(element).classList.remove(className));
					}
				} else {
					if (isAdd) {
						elements.forEach(element => {
							if (element.classList) {
								element.classList.add(className);
							}
						});
					} else {
						elements.forEach(element => {
							if (element.classList) {
								element.classList.remove(className);
							}
						});
					}
				}
			}
		}
	}
}

export function addRemoveTransparent(elements, isAdd) {
	addRemoveClass(elements, "transparent", isAdd);
}

export function addRemoveNoDisplay(elements, isAdd) {
	addRemoveClass(elements, "no-display", isAdd);
}

export function flipArrow(arrow, isUp) {
	if (isUp == undefined) {
		arrow.classList.toggle("arrow-up");
		arrow.classList.toggle("arrow-down");
	} else {
		addRemoveClass(arrow, "arrow-up", isUp);
		addRemoveClass(arrow, "arrow-down", !isUp);
	}
}

export function scrollToTop(isSmooth) {
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: isSmooth ? 'smooth' : "instant"
	});
}

export function getImageAddress(countryId, regionId, fileName){
	return `assets/img/${countryId}/${regionId}/${fileName}`;
}