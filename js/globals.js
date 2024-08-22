import { CUSTOM_EVENT_TYPES, DEFAULT_TIMEOUT, VIEW_NAMES } from "./constants.js";
import { addRemoveTransparent, sortImgs } from "./utils.js";
import Fullscreen from "../views/gallery-view/components/fullscreen/fullscreen.js";
import CustomHeader from "../components/header/header.js";
import Loader from "../components/loader/loader.js";
import InfoPopup from "../components/popup/info-popup/info-popup.js";
import GalleryView from "../views/gallery-view/gallery-view.js";
import MapView from "../views/map-view/map-view.js";
import StartView from "../views/start-view/start-view.js";

/** @type {string} */
let appColor = null;
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
/** @type Fullscreen */
let fullscreen = null;
/** @type InfoPopup */
let infoPopup = null;

let allCountryData = [];

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
    header.style.zIndex = 10;
    startView = document.querySelector("start-view");
    startView.style.zIndex = 1;
    mapView = new MapView(mapHtml);
    mapView.style.zIndex = 1;
    fullscreen = new Fullscreen(fullscreenHtml);
    fullscreen.style.zIndex = 100;
    galleryView = new GalleryView(galleryHtml, fullscreen, header);
    galleryView.style.zIndex = 1;

    polaroidHtmls.img = imgPolaroidHtml;
    polaroidHtmls.txt = txtPolaroidHtml;

    header.setButtonFunctions(goToStartView.bind(this, false),
        goToMapView,
        galleryView.toggleRegionDropdown.bind(galleryView),
        galleryView.toggleRegionInfo.bind(galleryView, null),
        galleryView.showFilter.bind(galleryView),
        infoPopup.open.bind(infoPopup, null));
    addRemoveTransparent([header], true);

    let pageContents = document.getElementById("views");
    document.body.insertBefore(header, pageContents);
    pageContents.appendChild(mapView);
    pageContents.appendChild(galleryView);
    pageContents.appendChild(fullscreen);
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
    let loader = null;
    if (isMapView()) {
        mapView.hide();
        header.toggleVisibility(false);
        loader = new Loader();
        document.body.append(loader);
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

    if (!isGalleryView()) {
        setTimeout(() => {
            header.toggleVisibility(true);
            setCurrentView(VIEW_NAMES.GALLERY);
            galleryView.show();

            if (loader) {
                loader.quickStop();
                loader.addEventListener(CUSTOM_EVENT_TYPES.LOADING_COMPLETE, () => {
                    setTimeout(() => {
                        loader.remove();
                    }, 0);
                });
            }
        }, DEFAULT_TIMEOUT);
    }
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
        const loader = new Loader();
        document.body.append(loader);

        mapView.handleNewCountry();
        galleryView.handleNewCountry();

        setTimeout(() => {
            loader.stop(mapView.show.bind(mapView));
            loader.addEventListener(CUSTOM_EVENT_TYPES.LOADING_COMPLETE, () => {
                loader.remove();
                header.toggleVisibility(true);
                setCurrentView(VIEW_NAMES.MAP);
            });
        }, 1200);
    }
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