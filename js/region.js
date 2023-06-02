// import Prefecture from "prefecture.js";

export default class Region {
    constructor(english_name, japanese_name, prefectures) {
        this.english_name = english_name;
        this.japanese_name = japanese_name;
        this.prefectures = [];
        if (prefectures && Array.isArray(prefectures)) {
            this.prefectures = prefectures;
        }
      }
}