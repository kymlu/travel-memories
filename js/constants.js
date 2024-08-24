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
		"englishName": "Animals",
		"japaneseName": "動物",
		"faClass": "fa-paw"
	},
	{
		"id": "attractions",
		"englishName": "Attractions",
		"japaneseName": "観光地",
		"faClass": "fa-map-pin"
	},
	{
		"id": "art",
		"englishName": "Art",
		"japaneseName": "美術",
		"faClass": "fa-paint-brush"
	},
	{
		"id": "event",
		"englishName": "Events",
		"japaneseName": "イベント",
		"faClass": "fa-calendar"
	},
	{
		"id": "food",
		"englishName": "Food",
		"japaneseName": "食べ物",
		"faClass": "fa-cutlery"
	},
	{
		"id": "nature",
		"englishName": "Nature",
		"japaneseName": "自然",
		"faClass": "fa-leaf"
	},
	{
		"id": "relax",
		"englishName": "Daily life",
		"japaneseName": "日常",
		"faClass": "fa-home"
	},
	{
		"id": "town",
		"englishName": "Around town",
		"japaneseName": "街中で",
		"faClass": "fa-building"
	}
];

export const CUSTOM_EVENT_TYPES = {
	FILTER_POPUP_SUBMITTED: "filter-popup-submitted",
	LOADING_COMPLETE: "loading-complete",
	HEADER_CHANGED: "header-changed"
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
	timeZoneName: "longOffset"
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
	INNERHTML: "innerHTML",
	TITLE: "title"
}