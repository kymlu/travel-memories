// import Image from "image.js";

export default class Prefecture {
    constructor(english_name, japanese_name, visited, areas, viewbox, dates_english, dates_japanese, description_english, description_japanese, image_list) {
        this.english_name = english_name;
        this.japanese_name = japanese_name;
        this.visited = visited;
        this.areas = areas;
        this.viewbox = viewbox;
        this.dates_english = dates_english;
        this.dates_japanese = dates_japanese;
        this.description_english = description_english;
        this.description_japanese = description_japanese;
        this.image_list = [];
        if (image_list && Array.isArray(image_list)) {
            this.image_list = image_list;
        }
    }
}