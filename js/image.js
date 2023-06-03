export const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

export default class Image {
    constructor(file_name, date, offset, city, location_english, location_japanese, description_english, description_japanese, tags, camera_model, lens, exposure, f_stop, iso, focal_length) {
        this.file_name = file_name;
        this.date = date;
        this.offset = offset;
        this.city = city;
        this.location_english = location_english;
        this.location_japanese = location_japanese;
        this.description_english = description_english;
        this.description_japanese = description_japanese;
        this.camera_model = camera_model;
        this.lens = lens;
        this.exposure = exposure;
        this.f_stop = f_stop;
        this.iso = iso;
        this.focal_length = focal_length;
        this.tags = [];
        if(tags != null && Array.isArray(tags)){
            this.tags = tags;
        }
    }

    getEnglishDate(isFullDate) {
        return monthNames[this.date.getMonth()] + " " + this.date.getDate() + ", " + this.date.getFullYear() + (isFullDate ? " " + this.date.getHours().toString().padStart(2, "0") + ":" + this.date.getMinutes().toString().padStart(2, "0") + ":" + this.date.getSeconds().toString().padStart(2, "0") : "");
    }

    getJapaneseDate(isFullDate) {
        return this.date.getFullYear() + "年" + (this.date.getMonth() + 1) + "月" + this.date.getDate() + "日" + (isFullDate ? " " + this.date.getHours().toString().padStart(2, "0") + ":" + this.date.getMinutes().toString().padStart(2, "0") + ":" + this.date.getSeconds().toString().padStart(2, "0") : "");
    }
}