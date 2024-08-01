/// IMPORTS
import { DEFAULT_TIMEOUT, ATTRIBUTES } from '../../js/constants.js'
import {
	addClickListeners, addRemoveNoDisplay, addRemoveTransparent,
	getImageAddress, isPortraitMode, setBilingualProperty,
} from '../../../js/utils.js';
import PicInfo from '../pic-info/pic-info.js';

export default class Fullscreen extends HTMLElement {
	#elements;

	constructor() {
		/// VARIABLES
		// booleans
		super();
		this.isNewFullscreenInstance = true;
		this.isFullscreen = false;

		// selected pic
		this.currentPic = null;
		this.currentPicIndex = 0;
		this.visibleImages = [];

		// pic info
		this.isPicInfoVisible = true;
		this.lastSwipeTime = null;
		this.currentCountryId = null;

		// gestures
		this.initialX = null;
		this.initialY = null;

		this.picInfo = new PicInfo();

		fetch("components/fullscreen/fullscreen.html")
			.then(response => response.text())
			.then(html => {
				this.innerHTML = html;
			})
			.catch(error => {
				console.error("Error loading fullscreen.", error);
			});

		this.#elements = {

		};
	}

	connectedCallback() {
		setTimeout(() => {
			setBilingualProperty([
				["pic-info-btn", "See picture information", "写真の情報を見る"],
				["left-arrow", "Previous picture", "前の写真"],
				["right-arrow", "Next picture", "次の写真"],
			], ATTRIBUTES.TITLE);

			addClickListeners([
				["fullscreen-bg", this.close.bind(this, true)],
				["fullscreen-ctrl", this.close.bind(this, true)],
				["left-arrow", (event) => { event.stopPropagation(); }],
				["fullscreen-pic", (event) => { event.stopPropagation(); }],
				["right-arrow", (event) => { event.stopPropagation(); }],
				["left-arrow", this.changeFullscreenPicture.bind(this, false)],
				["right-arrow", this.changeFullscreenPicture.bind(this, true)]
			]);

			let swipeContainer = document.getElementById("fullscreen");
			swipeContainer.addEventListener("touchstart", this.startFullscreenSwipe, false);
			swipeContainer.addEventListener("touchmove", this.moveFullscreenSwipe, false);
			this.picInfo.style.zIndex = 10;
			this.querySelector("#fullscreen").appendChild(this.picInfo);
		}, 50);
	}

	//// FUNCTIONS
	// open and close
	/**
	 * Displays a given image in fullscreen.
	 * @param {any} imageToDisplay 
	 * @param {string} countryId 
	 */
	open(visibleImageList, imageToDisplay, countryId) {
		this.visibleImages = visibleImageList;
		this.currentPic = imageToDisplay;
		this.currentPicIndex = this.visibleImages.indexOf(this.currentPic);
		this.isNewFullscreenInstance = true;
		this.currentCountryId = countryId;
		this.setNewPicture();

		this.lastSwipeTime = new Date();

		if (isPortraitMode()) {
			this.isPicInfoVisible = false;
			this.picInfo.hide();
		}
		this.isFullscreen = true;
		document.body.style.overflowY = "hidden";
		document.getElementById("fullscreen").classList.remove("visibility-hidden");
		addRemoveTransparent(["fullscreen", "fullscreen-bg"], false);
		document.addEventListener("keydown", this.handleKeydown.bind(this));
	}

	/** 
	 * Close the 
	 * @param {boolean} forceClose - ```True``` if the user has forcefully closed fullscreen mode.
	 */
	close(forceClose) {
		document.removeEventListener("keydown", this.handleKeydown.bind(this));
		this.isFullscreen = false;
		document.body.style.overflowY = "auto";
		if (forceClose) {
			document.getElementById("fullscreen").classList.add("visibility-hidden");
			addRemoveTransparent(["fullscreen", "fullscreen-bg"], true);
		} else {
			addRemoveTransparent(["fullscreen", "fullscreen-bg"], true);
			setTimeout(() => {
				document.getElementById("fullscreen").classList.add("visibility-hidden");
			}, DEFAULT_TIMEOUT);
		}
	}

	/**
	 * @returns whether the fullscreen image viewer has opened.
	 */
	getIsFullscreen() {
		return this.isFullscreen;
	}

	/**
	 * Handles events based on the key pressed.
	 * @param {KeyboardEvent} event 
	 */
	handleKeydown(event) {
		switch (event.key) {
			case "ArrowRight":
				this.changeFullscreenPicture(true);
				break;
			case "ArrowLeft":
				this.changeFullscreenPicture(false);
				break;
			case "ArrowUp":
				this.isPicInfoVisible = true;
				this.picInfo.show();
				break;
			case "ArrowDown":
				this.isPicInfoVisible = false;
				this.picInfo.hide();
				break;
			case "Escape":
				this.close();
				break;
			default:
				break;
		}
	}

	// swiping functions
	/**
	 * Starts procedures for 
	 */
	startFullscreenSwipe(e) {
		//if (isPortraitMode()) {
		if (e.touches.length == 1) {
			this.initialX = e.touches[0].clientX;
			this.initialY = e.touches[0].clientY;
		}
		//}
	}

	moveFullscreenSwipe(e) {
		if (this.initialX === null || this.initialY === null) return;

		// if (!isPortraitMode()) {
		// 	return;
		// }

		if (e.touches.length == 1) {
			let currentX = e.touches[0].clientX;
			let currentY = e.touches[0].clientY;

			let diffX = initialX - currentX;
			let diffY = initialY - currentY;

			// horizontal swipe
			if (Math.abs(diffX) > Math.abs(diffY)) {
				if (diffX > 0) {
					this.changeFullscreenPicture(true);
				} else {
					this.changeFullscreenPicture(false);
				}
			} else if (isPortraitMode()) {
				//vertical swipe - only for showing/hiding pic info
				if (diffY > 0) {
					if (!this.isPicInfoVisible) {
						this.show();
					}
					// removed because will not work with Apple
				} else {
					if (this.isPicInfoVisible) {
						this.hide();
					}
				}
			}

			this.initialX = null;
			this.initialY = null;

			e.preventDefault();
		}
	}

	changeFullscreenPicture(isNext) {
		if (isNext) {
			if (this.currentPicIndex == this.visibleImages.length - 1) {
				this.currentPicIndex = 0;
			} else {
				this.currentPicIndex++;
			}
		} else {
			if (this.currentPicIndex == 0) {
				this.currentPicIndex = this.visibleImages.length - 1;
			} else {
				this.currentPicIndex--;
			}
		}
		this.currentPic = this.visibleImages[this.currentPicIndex];
		this.setNewPicture(isNext);
	}

	/**
	 * 
	 * @param {boolean} isNext - ```True``` if the next picture is after the current one.
	 */
	setNewPicture(isNext) {
		let src = getImageAddress(this.currentCountryId, this.currentPic.region.id, this.currentPic.fileName);

		if (this.isNewFullscreenInstance || (new Date() - this.lastSwipeTime) < 300) {
			document.getElementById("fullscreen-pic").src = src;
			this.isNewFullscreenInstance = false;
		} else {
			let nextPic = document.getElementById("fullscreen-pic-next");
			let currentPic = document.getElementById("fullscreen-pic");

			addRemoveNoDisplay([nextPic], true);
			nextPic.src = src;
			nextPic.classList.add(isNext ? "fullscreen-pic-right" : "fullscreen-pic-left");

			setTimeout(() => {
				addRemoveNoDisplay([nextPic], false);
				addRemoveTransparent([nextPic], false);
				addRemoveTransparent([currentPic], true);
				nextPic.classList.remove(isNext ? "fullscreen-pic-right" : "fullscreen-pic-left");
				currentPic.classList.add(isNext ? "fullscreen-pic-left" : "fullscreen-pic-right");

				setTimeout(() => {
					addRemoveNoDisplay([currentPic], true);
					addRemoveTransparent([currentPic], false);
					currentPic.src = src;
					currentPic.classList.remove(isNext ? "fullscreen-pic-left" : "fullscreen-pic-right");
					setTimeout(() => {
						addRemoveNoDisplay([currentPic], false);
						addRemoveNoDisplay([nextPic], true);
						addRemoveTransparent([nextPic], true);
						// nextPic.classList.remove("fullscreen-pic");
					}, 100);
				}, 100);
			}, 20);
		}
		this.lastSwipeTime = new Date();
		this.picInfo.setPicInfo(this.currentPic, this.currentCountryId);
	}
}

window.customElements.define("fullscreen-component", Fullscreen);
