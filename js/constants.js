export const LOAD_ANIMATION_TIME = 1500;
export const DEFAULT_TIMEOUT = 500;
export const SCROLL_THRESHOLD = 100;
export const LOAD_DOT_COUNT = 8;

export const JAPAN = "japan";
export const TAIWAN = "taiwan";
export const AUSTRALIA = "australia";
export const NEW_ZEALAND = "newzealand";

export const VIEW_NAMES = {
	START: "start",
	MAP: "map",
	GALLERY: "gallery"
};

export const TAGS = [
	{
		"id": "animal",
		"nameEn": "Animals",
		"nameJp": "動物",
		"faClass": "fa-paw"
	},
	{
		"id": "attractions",
		"nameEn": "Attractions",
		"nameJp": "観光地",
		"faClass": "fa-map-pin"
	},
	{
		"id": "art",
		"nameEn": "Art",
		"nameJp": "美術",
		"faClass": "fa-paint-brush"
	},
	{
		"id": "event",
		"nameEn": "Events",
		"nameJp": "イベント",
		"faClass": "fa-calendar"
	},
	{
		"id": "food",
		"nameEn": "Food",
		"nameJp": "食べ物",
		"faClass": "fa-cutlery"
	},
	{
		"id": "nature",
		"nameEn": "Nature",
		"nameJp": "自然",
		"faClass": "fa-leaf"
	},
	{
		"id": "relax",
		"nameEn": "Daily life",
		"nameJp": "日常",
		"faClass": "fa-home"
	},
	{
		"id": "town",
		"nameEn": "Around town",
		"nameJp": "街中で",
		"faClass": "fa-building"
	}
];

export const CUSTOM_EVENT_TYPES = {
	NEW_COUNTRY_SELECTED: "new-country-selected",
	FILTER_POPUP_SUBMITTED: "filter-popup-submitted",
	LOADING_STARTED: "loading-started",
	LOADING_COMPLETE: "loading-complete",
	HEADER_SET: "header-set",
	HEADER_UPDATED: "header-updated"
}

const LONG_DATETIME_FORMAT_OPTIONS = {
	weekday: 'long',
	month: 'long',
	year: 'numeric',
	day: 'numeric',
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
	hour12: true,
	timeZoneName: "shortOffset"
};
export const LONG_DATETIME_FORMAT_EN = new Intl.DateTimeFormat('en-US', LONG_DATETIME_FORMAT_OPTIONS);
export const LONG_DATETIME_FORMAT_JP = new Intl.DateTimeFormat('ja-JP', LONG_DATETIME_FORMAT_OPTIONS);

const SHORT_DATETIME_FORMAT_OPTIONS = {
	month: 'long',
	year: 'numeric',
	day: 'numeric'
};
export const SHORT_DATETIME_FORMAT_EN = new Intl.DateTimeFormat('en-US', SHORT_DATETIME_FORMAT_OPTIONS);
export const SHORT_DATETIME_FORMAT_JP = new Intl.DateTimeFormat('ja-JP', SHORT_DATETIME_FORMAT_OPTIONS);

export const ATTRIBUTES = {
	INNERTEXT: "innerText",
	TITLE: "title"
}