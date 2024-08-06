/// IMPORTS
import { DEFAULT_TIMEOUT, ATTRIBUTES } from '../../js/constants.js'
import {
	addClickListeners, addRemoveNoDisplay, addRemoveTransparent,
	getImageAddress, isPortraitMode, setBilingualProperty,
} from '../../../js/utils.js';
import PicInfo from '../pic-info/pic-info.js';

/** The Fullscreen View. */
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
		this.isChangingPicture = false;
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
	}

	connectedCallback() {
		setTimeout(() => {
			this.#elements = {
				view: this.querySelector("#fullscreen"),
				background: this.querySelector(".popup-bg"),
				picture: this.querySelector("#fullscreen-pic"),
				nextPicture: this.querySelector("#fullscreen-pic-next"),
				leftArrow: this.querySelector("#left-arrow"),
				rightArrow: this.querySelector("#right-arrow"),
			};
			setTimeout(() => {
				setBilingualProperty([
					["pic-info-btn", "See picture information", "写真の情報を見る"],
					[this.#elements.leftArrow, "Previous picture", "前の写真"],
					[this.#elements.rightArrow, "Next picture", "次の写真"],
				], ATTRIBUTES.TITLE);

				addClickListeners([
					[this.#elements.background, this.close.bind(this, true)],
					["fullscreen-ctrl", this.close.bind(this, true)],
					[this.#elements.leftArrow, (event) => { event.stopPropagation(); }],
					[this.#elements.picture, (event) => { event.stopPropagation(); }],
					[this.#elements.rightArrow, (event) => { event.stopPropagation(); }],
					[this.#elements.leftArrow, this.changePicture.bind(this, false)],
					[this.#elements.rightArrow, this.changePicture.bind(this, true)]
				]);

				this.#elements.view.addEventListener("touchstart", this.startFullscreenSwipe, false);
				this.#elements.view.addEventListener("touchmove", this.moveFullscreenSwipe, false);
				this.picInfo.style.zIndex = 10;
				this.#elements.view.appendChild(this.picInfo);
			}, 50);
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
		this.isChangingPicture = false;
		this.setNewPicture();

		this.lastSwipeTime = new Date();

		if (isPortraitMode()) {
			this.isPicInfoVisible = false;
			this.picInfo.hide(true);
		}
		this.isFullscreen = true;
		document.body.style.overflowY = "hidden";
		this.#elements.view.classList.remove("visibility-hidden");
		addRemoveTransparent([this.#elements.view, this.#elements.background], false);
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
			this.#elements.view.classList.add("visibility-hidden");
			addRemoveTransparent([this.#elements.view, this.#elements.background], true);
		} else {
			addRemoveTransparent([this.#elements.view, this.#elements.background], true);
			setTimeout(() => {
				this.#elements.view.classList.add("visibility-hidden");
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
				if (!this.isChangingPicture) {
					this.changePicture(true);
				}
				break;
			case "ArrowLeft":
				if (!this.isChangingPicture) {
					this.changePicture(false);
				}
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
	 * Starts procedures for swiping in fullscreen
	 */
	startFullscreenSwipe(e) {
		if (e.touches.length == 1) {
			this.initialX = e.touches[0].clientX;
			this.initialY = e.touches[0].clientY;
		}
	}

	moveFullscreenSwipe(e) {
		if (this.initialX === null || this.initialY === null) return;

		if (e.touches.length == 1) {
			let currentX = e.touches[0].clientX;
			let currentY = e.touches[0].clientY;

			let diffX = initialX - currentX;
			let diffY = initialY - currentY;

			// horizontal swipe
			if (Math.abs(diffX) > Math.abs(diffY)) {
				if (diffX > 0) {
					this.changePicture(true);
				} else {
					this.changePicture(false);
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

	changePicture(isMovingRight) {
		this.isChangingPicture = true;
		if (isMovingRight) {
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
		this.setNewPicture(isMovingRight);
	}

	/**
	 * 
	 * @param {boolean} isMovingRight - ```True``` if the next picture is after the current one.
	 */
	setNewPicture(isMovingRight) {
		let src = getImageAddress(this.currentCountryId, this.currentPic.region.id, this.currentPic.fileName);

		if (this.isNewFullscreenInstance || (new Date() - this.lastSwipeTime) < 300) {
			this.#elements.picture.src = src;
			this.isNewFullscreenInstance = false;
			this.isChangingPicture = false;
		} else {
			let nextPic = this.#elements.nextPicture;
			let currentPic = this.#elements.picture;

			addRemoveNoDisplay([nextPic], true);
			nextPic.src = src;
			nextPic.classList.add(isMovingRight ? "fullscreen-pic-right" : "fullscreen-pic-left");

			setTimeout(() => {
				addRemoveNoDisplay([nextPic], false);
				addRemoveTransparent([nextPic], false);
				addRemoveTransparent([currentPic], true);
				nextPic.classList.remove(isMovingRight ? "fullscreen-pic-right" : "fullscreen-pic-left");
				currentPic.classList.add(isMovingRight ? "fullscreen-pic-left" : "fullscreen-pic-right");

				setTimeout(() => {
					addRemoveNoDisplay([currentPic], true);
					addRemoveTransparent([currentPic], false);
					currentPic.src = src;
					currentPic.classList.remove(isMovingRight ? "fullscreen-pic-left" : "fullscreen-pic-right");
					setTimeout(() => {
						addRemoveNoDisplay([currentPic], false);
						addRemoveNoDisplay([nextPic], true);
						addRemoveTransparent([nextPic], true);
						this.isChangingPicture = false;
					}, 100);
				}, 100);
			}, 0);
		}
		this.lastSwipeTime = new Date();
		this.picInfo.setPicInfo(this.currentPic, this.currentCountryId);
	}
}

window.customElements.define("fullscreen-component", Fullscreen);
