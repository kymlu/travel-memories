import BaseElement from '../../js/base-element.js';
import { DEFAULT_TIMEOUT, ATTRIBUTES } from '../../js/constants.js'
import {
	addClickListeners, toggleNoDisplay, toggleTransparent,
	fetchInnerHtml,
	getImageAddress, isPortraitMode, setBilingualProperty,
} from '../../js/utils.js';
import PicInfo from './components/pic-info/pic-info.js';

/** The Fullscreen View. */
export default class Fullscreen extends BaseElement {
	constructor() {
		// booleans
		super();
		this.isNewFullscreenInstance = true;
		this.isFullscreen = false;
		this.isChangingPicture = false;

		// selected pic
		this.currentPic = null;
		this.currentPicIndex = 0;
		this.visibleImages = [];

		// pic info
		this.lastSwipeTime = null;
		this.currentCountryId = null;

		// gestures
		this.initialX = null;
		this.initialY = null;

		/** @type PicInfo */
		this.picInfo = null;
	}

	connectedCallback() {
		fetchInnerHtml("views/fullscreen/fullscreen.html", this, true)
			.then(() => {
				this._elements = {
					view: this.queryByClassName("wrapper"),
					control: this.queryById("main-control"),
					background: this.queryByClassName("popup-bg"),
					picture: this.queryById("current-pic"),
					nextPicture: this.queryById("next-pic"),
					leftArrow: this.queryById("left-arrow"),
					rightArrow: this.queryById("right-arrow"),
					picInfoButton: this.queryById("pic-info-btn")
				};
				this.picInfo = this.shadowRoot.querySelector("pic-info");
				setBilingualProperty([
					[this._elements.picInfoButton, "See picture information", "写真の情報を見る"],
					[this._elements.leftArrow, "Previous picture", "前の写真"],
					[this._elements.rightArrow, "Next picture", "次の写真"],
				], ATTRIBUTES.TITLE);

				addClickListeners([
					[this._elements.background, this.close.bind(this, true)],
					[this._elements.control, this.close.bind(this, true)],
					[this._elements.picInfoButton, this.picInfo.toggleVisibility.bind(this.picInfo, null)],
					[this._elements.leftArrow, (event) => { event.stopPropagation(); }],
					[this._elements.picture, (event) => { event.stopPropagation(); }],
					[this._elements.rightArrow, (event) => { event.stopPropagation(); }],
					[this._elements.leftArrow, this.changePicture.bind(this, false)],
					[this._elements.rightArrow, this.changePicture.bind(this, true)]
				]);

				this._elements.view.addEventListener("touchstart", this.startFullscreenSwipe.bind(this), false);
				this._elements.view.addEventListener("touchmove", this.moveFullscreenSwipe.bind(this), false);
				this.close(true);
			});
	}

	/// FUNCTIONS
	// open and close
	/**
	 * Displays a given image in fullscreen.
	 * @param {object[]} visibleImageList 
	 * @param {object} imageToDisplay 
	 * @param {string} countryId 
	 */
	open(visibleImageList, imageToDisplay, countryId) {
		toggleNoDisplay([this], false);
		this.visibleImages = visibleImageList;
		this.currentPic = imageToDisplay;
		this.currentPicIndex = this.visibleImages.indexOf(this.currentPic);
		this.isNewFullscreenInstance = true;
		this.currentCountryId = countryId;
		this.isChangingPicture = false;
		this.setNewPicture();

		this.lastSwipeTime = new Date();

		if (isPortraitMode()) {
			this.picInfo.hide(true);
		}

		this.isFullscreen = true;
		document.body.style.overflowY = "hidden";
		toggleTransparent([this._elements.view, this._elements.background], false);
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
			toggleTransparent([this._elements.view, this._elements.background], true);
			toggleNoDisplay([this], true);
		} else {
			toggleTransparent([this._elements.view, this._elements.background], true);
			setTimeout(() => {
				toggleNoDisplay([this], true);
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
				this.picInfo.show();
				break;
			case "ArrowDown":
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
	 * @param {TouchEvent} e 
	 */
	startFullscreenSwipe(e) {
		if (e.touches.length == 1) {
			this.initialX = e.touches[0].clientX;
			this.initialY = e.touches[0].clientY;
		}
	}

	/**
	 * Procedures when in the middle of swiping.
	 * @param {TouchEvent} e 
	 */
	moveFullscreenSwipe(e) {
		if (this.initialX === null || this.initialY === null) return;

		if (e.touches.length == 1) {
			let currentX = e.touches[0].clientX;
			let currentY = e.touches[0].clientY;

			let diffX = this.initialX - currentX;
			let diffY = this.initialY - currentY;

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
					if (!this.picInfo.getIsVisible()) {
						this.picInfo.show();
					}
				} else {
					if (this.picInfo.getIsVisible()) {
						this.picInfo.hide();
					}
				}
			}

			this.initialX = null;
			this.initialY = null;

			e.preventDefault();
		}
	}

	/**
	 * Determine the next picture and set it.
	 * @param {boolean} isMovingRight ```True``` if the next picture is to the right of the current one.
	 */
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
	 * Sets the new picture in the view.
	 * @param {boolean} isMovingRight ```True``` if the next picture is to the right of the current one.
	 */
	setNewPicture(isMovingRight) {
		let src = getImageAddress(this.currentCountryId, this.currentPic.region.id, this.currentPic.fileName);

		if (this.isNewFullscreenInstance || (new Date() - this.lastSwipeTime) < 300) {
			this._elements.picture.src = src;
			this.isNewFullscreenInstance = false;
			setTimeout(() => {
				this.isChangingPicture = false;
			}, 50);
		} else {
			let nextPic = this._elements.nextPicture;
			let currentPic = this._elements.picture;

			toggleNoDisplay([nextPic], true);
			nextPic.src = src;
			nextPic.classList.add(isMovingRight ? "right" : "left");

			setTimeout(() => {
				toggleNoDisplay([nextPic], false);
				toggleTransparent([nextPic], false);
				toggleTransparent([currentPic], true);
				nextPic.classList.remove(isMovingRight ? "right" : "left");
				currentPic.classList.add(isMovingRight ? "left" : "right");

				setTimeout(() => {
					toggleNoDisplay([currentPic], true);
					toggleTransparent([currentPic], false);
					currentPic.src = src;
					currentPic.classList.remove(isMovingRight ? "left" : "right");
					setTimeout(() => {
						toggleNoDisplay([currentPic], false);
						toggleNoDisplay([nextPic], true);
						toggleTransparent([nextPic], true);
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