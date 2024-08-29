import { CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT, VIEW_NAMES } from "./constants.js";
import { sortImgs } from "./utils.js";
import CustomHeader from "../components/header/header.js";
import InfoPopup from "../components/popup/info-popup/info-popup.js";
import GalleryView from "../views/gallery-view/gallery-view.js";
import MapView from "../views/map-view/map-view.js";
import StartView from "../views/start-view/start-view.js";

/** @type {string} */
let appColor = null;
/** @type {string} */
let translucentAppColor = null;
/** @type {any} */
let currentCountry = null;

/** @type {string} */
let currentView = VIEW_NAMES.START;

/** @type CustomHeader */
let header = null;
/** @type StartView */
let startView = null;
/** @type MapView */
let mapView = null;
/** @type GalleryView */
let galleryView = null;

let allCountryData = [];

export function setSiteContents() {
    /** @type InfoPopup */
    let infoPopup = document.querySelector("info-popup");

    startView = document.querySelector("start-view");
    mapView = document.querySelector("map-view");
    galleryView = document.querySelector("gallery-view");

    header = document.querySelector("custom-header");
    header.addEventListener(CUSTOM_EVENT_TYPES.LOADING_COMPLETE, () => {
        header.setButtonFunctions(goToStartView.bind(this, false),
            goToMapView,
            galleryView.toggleRegionDropdown.bind(galleryView),
            galleryView.toggleRegionInfo.bind(galleryView, null),
            galleryView.showFilter.bind(galleryView),
            infoPopup.open.bind(infoPopup, null));
    })
    const headerSetEvent = new CustomEvent(CUSTOM_EVENT_TYPES.HEADER_SET, { detail: { header: header } });
    document.dispatchEvent(headerSetEvent);

}

function setCurrentView(pageName) {
    currentView = pageName;
    header.onChangeView();
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

export function goToStartView(isPopped) {
    if (isMapView()) {
        mapView.hide();
    }

    setCurrentView(VIEW_NAMES.START);
    startView.show(isPopped);
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

export function onSelectNewRegion(regionId, isPopped, isNewGallery) {
    if (isMapView()) {
        document.body.style.overflowY = "hidden";
        mapView.hide();
    }

    if (isPopped == null) {
        window.history.pushState({ type: VIEW_NAMES.GALLERY, regionId: regionId }, "", null);
    }

    if (regionId != undefined && regionId != null) {
        let newRegion = currentCountry.regionGroups.flatMap(x => x.regions).filter(rgn => rgn.id == regionId);
        galleryView.setNewRegion(newRegion, true, isNewGallery);
    } else {
        let visitedRgns = currentCountry.regionGroups.flatMap(grp => grp.regions.filter(rgn => rgn.visited));
        galleryView.setNewRegion(visitedRgns, false, isNewGallery);
    }

    setTimeout(() => {
        document.body.style.overflowY = "auto";
        setCurrentView(VIEW_NAMES.GALLERY);
        galleryView.show();
    }, 50);
}

export function getHeader() {
    return header;
}

/**
 * Sets the new app colour.
 * @param {string} newColor - the new colour to set.
 */
export function setAppColor(newColor) {
    let root = document.querySelector(':root');
    root.style.setProperty('--main-color', getComputedStyle(root).getPropertyValue(newColor));
    let parsedRGB = getComputedStyle(root).getPropertyValue("--main-color").split(", ");
    appColor = `rgb(${parsedRGB[0]}, ${parsedRGB[1]}, ${parsedRGB[2]})`;
    translucentAppColor = `rgba(${parsedRGB[0]}, ${parsedRGB[1]}, ${parsedRGB[2]}, 0.5)`;
}

export function getAppColor() {
    return appColor;
}

export function getTranslucentAppColor() {
    return translucentAppColor;
}

export function setAllCountryData(data) {
    allCountryData = data;
    startView.initialize();
}

export function getAllCountryData() {
    return allCountryData;
}

export function setCurrentCountry(countryId, countryColor, isPopped) {
    if (countryId == null) {
        currentCountry = null;
        header.toggleVisibility(true);
    } else {
        if (!isPopped) {
            window.history.pushState({ type: VIEW_NAMES.MAP, country: countryId, countryColor: countryColor }, "", null);
        }

        header.toggleVisibility(false);
        currentCountry = allCountryData.find(country => country.id == countryId);
        currentCountry.regionGroups.forEach(rgnGrp => {
            rgnGrp.regions.forEach(rgn => {
                if (rgn.imageList != null) {
                    rgn.imageList.sort(sortImgs);
                }
            });
        });
        setAppColor(countryColor);

        const newCountryEvent = new CustomEvent(CUSTOM_EVENT_TYPES.NEW_COUNTRY_SELECTED, { detail: { country: currentCountry } });
        document.dispatchEvent(newCountryEvent);

        mapView.addEventListener(CUSTOM_EVENT_TYPES.LOADING_COMPLETE, showMap);
    }
}

function showMap() {
    mapView.show();
    header.toggleVisibility(true);
    setCurrentView(VIEW_NAMES.MAP);
    mapView.removeEventListener(CUSTOM_EVENT_TYPES.LOADING_COMPLETE, showMap);
}