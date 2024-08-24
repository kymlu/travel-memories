import { ATTRIBUTES } from "./constants.js";

/**
 * Fetches the html from a given address and inserts it into the element.
 * @param {string} address 
 * @param {HTMLElement} element 
 */
export async function fetchInnerHtml(address, element) {
	fetch(address)
		.then(response => response.text())
		.then(html => {
			element.innerHTML = html;
		})
		.catch(error => {
			console.error(`Error loading ${element.tagName}.`, error);
		});;
}

/**
 * Gets the date to the appropriate timezone
 * @param {Date} date - the date in UTC
 * @param {number} timezoneOffset - the offset of the image date in hours
 * @returns The image date in the proper timezone
 */
export function getPictureDate(date, timezoneOffset) {
	const localOffset = new Date().getTimezoneOffset();
	return new Date(date.getTime() - ((timezoneOffset * -60) - localOffset) * 60000);
}

/**
 * Gets text in the format "English - Japanese"
 * @param {string | null | undefined} english - The English text.
 * @param {string | null | undefined} japanese - The Japanese text.
 * @returns 
 */
export function getBilingualText(english, japanese) {
	return (english ?? "") + (english && japanese ? " – " : "") + (japanese ?? "");
}

/**
 * Gets whether the screen orientation is portrait.
 * @returns True if the screen orientation is portrait.
 */
export function isPortraitMode() {
	return window.innerHeight > window.innerWidth;
}

/**
 * The sort function for objects with both an English and Japanese name.
 * @param {object} a - The first object
 * @param {object} b - The second object
 * @returns The sort order of the two objects.
 */
export function sortByEnglishName(a, b) {
	let a1 = a.englishName.toLowerCase();
	let b1 = b.englishName.toLowerCase();

	if (a1 < b1) {
		return -1;
	}
	if (a1 > b1) {
		return 1;
	}
	return 0;
}

/**
 * The sort function for images with a date.
 * @param {object} a - The first object
 * @param {object} b - The second object
 * @returns The sort order of the two objects.
 */
export function sortImgs(a, b) {
	return new Date(a.date) - new Date(b.date);
}

/**
 * Adds or removes a specified class from element(s)' class lists.
 * @param {string | string[] | Element[]} elements - an element name, a list of element names, or a list of element objects.
 * @param {string} className - the name of the class to add or remove.
 * @param {boolean} isAdd -  ```True``` if adding, ```False``` if removing.
 */
export function addRemoveClass(elements, className, isAdd) {
	if (elements) {
		// edit single element by name
		if (typeof (elements) == 'string') {
			let element = document.getElementById(elements);
			if (element?.classList) {
				if (isAdd) {
					element.classList.add(className);
				} else {
					element.classList.remove(className);
				}
			}
		} else {
			if (elements.length > 0) {
				elements.forEach(element => {
					var e = typeof element == "string" ? document.getElementById(element) : element;
					if (isAdd) {
						e?.classList?.add(className);
					} else {
						e?.classList?.remove(className);
					}
				});
			}
		}
	}
}

/**
 * Adds or removes the "transparent" class.
 * @param {string | string[] | Element[]} elements - an element name, a list of element names, or a list of element objects.
 * @param {boolean} isAdd -  ```True``` if adding, ```False``` if removing.
 */
export function addRemoveTransparent(elements, isAdd) {
	addRemoveClass(elements, "transparent", isAdd);
}

/**
 * Adds or removes the "no-display" class.
 * @param {string | string[] | Element[]} elements - an element name, a list of element names, or a list of element objects.
 * @param {boolean} isAdd -  ```True``` if adding, ```False``` if removing.
 */
export function addRemoveNoDisplay(elements, isAdd) {
	addRemoveClass(elements, "no-display", isAdd);
}

/**
 * Flips an arrow element up or down.
 * @param {HTMLElement} arrow
 * @param {boolean} isUp - ```True``` if arrow should point up, ```False``` if arrow should point down, undefined if meant to toggle.
 */
export function flipArrow(arrow, isUp) {
	if (isUp == undefined) {
		arrow.classList.toggle("arrow-up");
		arrow.classList.toggle("arrow-down");
	} else {
		addRemoveClass([arrow], "arrow-up", isUp);
		addRemoveClass([arrow], "arrow-down", !isUp);
	}
}

/**
 * @param {boolean} isSmooth - ```True``` if scroll should be smooth, ```False``` if instant.
 */
export function scrollToTop(isSmooth) {
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: isSmooth ? 'smooth' : "instant"
	});
}

/**
 * @param {string} countryId 
 * @param {string} regionId 
 * @param {string} fileName 
 * @returns the address of the requested image.
 */
export function getImageAddress(countryId, regionId, fileName) {
	return `assets/img/${countryId}/${regionId}/${fileName}`;
}

export function setBilingualProperty(elements, property) {
	elements.forEach(([element, englishText, japaneseText]) => {
		try {
			if (typeof element == "string") {
				element = document.getElementById(element);
			}
			if (property == ATTRIBUTES.INNERHTML) {
				element.innerHTML = getBilingualText(englishText, japaneseText);
			} else if (property == ATTRIBUTES.TITLE) {
				element.title = getBilingualText(englishText, japaneseText);
			} else {
				throw new Error(`Invalid property type ${property}.`);
			}
		} catch (error) {
			console.error(error);
		}
	});
}

export function addClickListeners(elements) {
	elements.forEach(([element, callback]) => {
		try {
			if (typeof element == "string") {
				document.getElementById(element).addEventListener("click", callback);
			} else {
				element.addEventListener("click", callback);
			}
		} catch (error) {
			console.error(error);
		}
	});
}