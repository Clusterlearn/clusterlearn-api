import { avaliablePlatform } from "src/types/modelData";

export default class AddToCourseExceptions extends Error {
    readonly code: number;
    readonly platform : avaliablePlatform
    readonly courseLink : string
    constructor(message: string, link: any, code: number = 500) {
        super(message);
        const url = new URL(link);
        this.code = code;
        this.platform = url.host as avaliablePlatform
        this.courseLink = link
        Object.setPrototypeOf(this, AddToCourseExceptions.prototype);
    }
}
