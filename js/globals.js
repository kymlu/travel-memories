import CustomHeader from "../components/header/header.js";
import MapView from "../views/map-view/map-view.js";
import GalleryView from "../views/gallery-view/gallery-view.js";
import StartView from "../views/start-view/start-view.js";
import { CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT, VIEW_NAMES } from "./constants.js";
import { addRemoveTransparent, sortImgs } from "./utils.js";
import InfoPopup from "../components/popup/info-popup/info-popup.js";
import Fullscreen from "../components/fullscreen/fullscreen.js";
import Loader from "../components/loader/loader.js";

/** @type {string} */
let appColor = null;
/** @type {any} */
let currentCountry = null;
/** @type {string} */
let currentView = VIEW_NAMES.START;

/** @type {StartView} */
let startView = null;
/** @type {MapView} */
let mapView = null;
/** @type {GalleryView} */
let galleryView = null;
let fullscreen = null;
/** @type {InfoPopup} */
let infoPopup = null;

let allCountryData = [];

// TODO: control loader here but move routing functions to router.js
/** @type {Loader} */
let loader = null;

/** @type CustomHeader */
let header = null;

// Gestures
let initialYHandle = null;
let isHandleGrabbed = false;
let grabbedHandleId = null;

export let polaroidHtmls = {
    img: null,
    txt: null
}

export function setSiteContents(
    infoPopupElement,
    mapHtml,
    galleryHtml,
    fullscreenHtml,
    imgPolaroidHtml,
    txtPolaroidHtml) {

    infoPopup = infoPopupElement;
    header = new CustomHeader();
    startView = document.querySelector("start-view");
    mapView = new MapView(mapHtml);
    fullscreen = new Fullscreen(fullscreenHtml);
    galleryView = new GalleryView(galleryHtml, fullscreen, header);
    polaroidHtmls.img = imgPolaroidHtml;
    polaroidHtmls.txt = txtPolaroidHtml;
    header.setButtonFunctions(goToStartView,
        goToMapView,
        galleryView.toggleRegionDropdown.bind(galleryView),
        galleryView.toggleRegionInfo.bind(galleryView),
        galleryView.showFilter.bind(galleryView),
        infoPopup.open.bind(infoPopup));
    // todo: might not work with fullscreen mode since fullscreen must be above header
    header.style.zIndex = 10;
    startView.style.zIndex = 1;
    mapView.style.zIndex = 1;
    galleryView.style.zIndex = 1;
    fullscreen.style.zIndex = 100;
    addRemoveTransparent([header], true);
    let pageContents = document.getElementById("views");
    document.body.insertBefore(header, pageContents);
    pageContents.appendChild(mapView);
    pageContents.appendChild(galleryView);
    pageContents.appendChild(fullscreen);
}

export function goToMapView() {
    if (isStartView()) {
        startView.hide();
    } else if (isGalleryView()) {
        galleryView.hide();
    }
    setCurrentView(VIEW_NAMES.MAP);
    mapView.show();
}

export function goToStartView(isPopped) {
    if (isMapView()) {
        mapView.hide();
    }

    setCurrentView(VIEW_NAMES.START);
    startView.show(isPopped);
}

export function goToGalleryView() {
    setCurrentView(VIEW_NAMES.GALLERY);
    galleryView.show();
}

// todo: put this logic into the galleryview
export function onSelectNewRegion(regionId, isPopped) {
    if (isMapView()) {
        mapView.hide();
        header.toggleVisibility(false);
    }

    loader = new Loader();
    document.body.append(loader);

    if (isPopped == null) {
        window.history.pushState({ rgn: regionId }, "", null);
    }

    if (regionId != undefined && regionId != null) {
        let newRegion = currentCountry.regionGroups.flatMap(x => x.regions).filter(rgn => rgn.id == regionId);
        galleryView.setNewRegion(newRegion, true);
    } else {
        let visitedRgns = currentCountry.regionGroups.flatMap(grp => grp.regions.filter(rgn => rgn.visited));
        galleryView.setNewRegion(visitedRgns, false);
    }

    setTimeout(() => {
        if (!isGalleryView()) {
            goToGalleryView();
            header.toggleVisibility(true);
        }
        loader.quickStop();
    }, DEFAULT_TIMEOUT);
}

function setCurrentView(pageName) {
    currentView = pageName;
    header.onChangeView();
}

export function getCurrentView() {
    return currentView;
}

export function isStartView() {
    return currentView == VIEW_NAMES.START;
}

export function isMapView() {
    return currentView == VIEW_NAMES.MAP;
}

export function isGalleryView() {
    return currentView == VIEW_NAMES.GALLERY;
}

/**
 * Gets the current app colour.
 * @returns the current app colour.
 */
export function getAppColor() {
    return appColor;
}

export function setAllCountryData(data) {
    allCountryData = data;
    startView.initialize();
}

export function getAllCountryData() {
    return allCountryData;
}

export function setCurrentCountry(countryId, countryColor) {
    header.toggleVisibility(false);
    if (countryId == null) {
        currentCountry = null;
        header.toggleVisibility(true);
    } else {
        currentCountry = allCountryData.find(country => country.id == countryId);
        currentCountry.regionGroups.forEach(rgnGrp => {
            rgnGrp.regions.forEach(rgn => {
                if (rgn.imageList != null) {
                    rgn.imageList.sort(sortImgs);
                }
            });
        });
        setAppColor(countryColor);
        loader = new Loader();
        document.body.append(loader);

        mapView.handleNewCountry();
        galleryView.handleNewCountry();

        setTimeout(() => {
            loader.stop(mapView.show.bind(mapView));
            loader.addEventListener(CUSTOM_EVENT_TYPES.LOADING_COMPLETE, (function () {
                loader.remove();
                header.toggleVisibility(true);
                setCurrentView(VIEW_NAMES.MAP);
            }).bind(this));
        }, 1200);
    }
}

/**
 * Sets the new app colour.
 * @param {string} newColor - the new colour to set.
 */
export function setAppColor(newColor) {
    let root = document.querySelector(':root');
    root.style.setProperty('--main-color', getComputedStyle(root).getPropertyValue(newColor));
    let temp = getComputedStyle(root).getPropertyValue("--main-color").split(", ");
    appColor = `rgb(${temp[0]}, ${temp[1]}, ${temp[2]})`;
}

/**
 * Gets the current country.
 * @returns the current country.
 */
export function getCurrentCountry() {
    return currentCountry;
}

/**
 * @returns ```True``` if a country is currently selected.
 */
export function isCountrySelected() {
    return currentCountry != null;
}

/**
 * Initializes the touch event for elements on screen with handles.
 * @param {TouchEvent} e - the touch event.
 * @param {string} handleId - the id of the handle element.
 */
// TODO: move??
export function startHandleDrag(e, handleId) {
    if (isPortraitMode()) {
        isHandleGrabbed = true;
        grabbedHandleId = handleId
        initialYHandle = e.touches[0].clientY;
    }
}

/// FUNCTIONS
/**
 * Determines appropriate behaviour when user releases a handle on screen.
 * @link https://stackoverflow.com/questions/53192433/how-to-detect-swipe-in-javascript
 * @param {TouchEvent} e - the touch event.
 */
export function endHandleDrag(e) {
    if (isPortraitMode()) {
        if (isHandleGrabbed && grabbedHandleId) {
            isHandleGrabbed = false;
            let currentY = e.changedTouches[0].clientY;
            if (currentY > initialYHandle) {
                if (grabbedHandleId == "pic-info-handle") {
                    Fullscreen.hidePicInfo();
                } else if (grabbedHandleId == "rgn-info-handle") {
                    GalleryView.showRegionInfo(true);
                }
            } else if (currentY < initialYHandle) {
                if (grabbedHandleId == "rgn-info-handle") {
                    GalleryView.hideRegionInfo(true);
                }
            }
            initialYHandle = null;
            grabbedHandleId = null;
        }
    }
}