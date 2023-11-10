import parsePhoneNumberFromString from "libphonenumber-js";
import { URL } from 'url'
import { avaliablePlatform } from "../types/modelData";

const avaliable_platform: avaliablePlatform[] = ['udemy.com', 'learning.edx.org'] // 'coursera.com' //]'udacity.com', 'skillshare.com', 'pluralsight.com', 'khanacademy.com', 'codecademy.com', 'teamtreehouse.com', 'datacamp.com', 'frontendmentor.io', 'freecodecamp.org',


export type ValidPlatformDetails = {
    platform: avaliablePlatform,
    url: string
}
export default class Validator {

    static getUrlPattern(platform: avaliablePlatform): RegExp {
        switch (platform) {
            case 'udemy.com':
                return /^(https:\/\/(www\.)?udemy\.com\/course\/.+)$/;
                break;
            case 'edx.org':
                return /^(https:\/\/(learning\.)?edx\.org\/.+)$/;
                break;
            // case 'coursera.com':
            //     return /^(https:\/\/(www\.)?coursera\.org\/learn\/.+)$/;
            //     break;
            default:
                return /^(https:\/\/(www\.)?udemy\.com\/course\/.+)$/;
        }
    }

    static isValidPlatform(url: string) {
        const parsedUrl = new URL(url);
        const host = parsedUrl.host.replace('www.', '')
        url = `${parsedUrl.protocol}//${host}${parsedUrl.pathname}`;
        if (!avaliable_platform.includes(host as avaliablePlatform)) return false
        const urlPattern = this.getUrlPattern(host as avaliablePlatform);
        return urlPattern.test(url);
    }
    
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPhoneNumber(phoneNumber: string): boolean {
        const parsedNumber = parsePhoneNumberFromString(phoneNumber);
        return parsedNumber !== undefined && parsedNumber.isValid();
    }

    static isStrongPassword(password: string): boolean {
        // Password must contain at least one uppercase letter, one lowercase letter,
        // one digit, and one special character, and be at least 8 characters long.
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }
    static isValidUrl(url: string) : boolean
    {
        try{
            new URL(url)
            return true
        }
        catch(e){
            return false
        }
    }
}
