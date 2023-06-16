// import Prefecture from "prefecture.js";

export default class Region {
    constructor(english_name, japanese_name, o_regions) {
        this.english_name = english_name;
        this.japanese_name = japanese_name;
        this.o_regions = [];
        if (o_regions && Array.isArray(o_regions)) {
            this.o_regions = o_regions;
        }
      }
}