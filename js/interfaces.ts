interface BaseObject{
    id: string,
    english_name: string,
    japanese_name: string
}

interface Image {
    file_name: string,
    is_favourite?: boolean,
    isVisible?: boolean,
    date?: Date,
    offset?: number,
    area_id?: string,
    area?: BaseObject,
    location_english?: string,
    location_japanese?: string,
    location_chinese?: string,
    description_english?: string,
    description_japanese?: string,
    tags?: string[],
    camera_model?: string,
    lens?: string,
    shutter_speed?: string,
    f_stop?: string,
    focal_length?: string,
    iso?: number,
    region: BaseObject,
}

interface Region extends BaseObject {
    visited: boolean,
    areas: BaseObject[],
    viewbox: string,
    dates_english: string,
    dates_japanese: string,
    description_english:string,
    description_japanese: string,
    image_list?: Image[]
}

interface RegionGroup {
    english_name: string,
    japanese_name:string,
    regions: Region[]
}

interface Country extends BaseObject {
    symbol: string,
    abbreviation: string,
    show_unofficial_regions: string,
    official_region_name_english: string,
    official_region_name_japanese: string,
    description_english: string,
    description_japanese: string,
    region_groups: RegionGroup[]
}

interface Filter {
    isOnlyFavs: boolean,
    keyword: string,
    selectedRegions: string[],
    selectedAreas: string[],
    selectedTags: string[],
    selectedCameras: string[]
}

interface FilterEvent extends Event{
    filterParams: Filter
}