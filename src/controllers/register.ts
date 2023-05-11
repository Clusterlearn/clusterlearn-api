import ReponseHandler from "@utils/responseHandler"
import { signupFieldError } from "src/types/field"
import Validator from "@utils/Validator"
import { generateVerificationCode, sendPhoneVerificationCode, setVerificationCode } from "@utils/verification";
import redisClient from "@services/redis";
import { hashPassword } from "@utils/helper";
import CourseModel  from "@models/course";
import { avaliablePlatform } from "src/types/modelData";
import AddToCourseExceptions from "@utils/Exceptions/AddToCourseException";

const avaliable_platform : avaliablePlatform[] = ['udemy.com' , 'edx.com']
export default class RegisterUserToCourse {
    static async register(url : string, email : string, paid : boolean = false){
        if(!Validator.isValidEmail(email)) throw new AddToCourseExceptions('invalid email', url, 400);
        //  This would validate and make sure the url is a possible url of a course 
        if(!Validator.isValidUrl(url)) throw new AddToCourseExceptions('invalid Course url', url, 400);
        const parsedUrl = new URL(url);
        url = `${parsedUrl.protocol}//${parsedUrl.host.replace('www.', '')}${parsedUrl.pathname}`;
        if(!avaliable_platform.includes(parsedUrl.host.replace('www.', '') as avaliablePlatform)) throw new AddToCourseExceptions('Platform not supported', url, 400);
        if(! await CourseModel.getCousre(url)) await CourseModel.createCourse({
            name: parsedUrl.pathname,
            link: url,
            platform: parsedUrl.host as avaliablePlatform,
            groups: {
                free: [],
                paid: []
            }
        });

        return paid ? await CourseModel.addUserToCoursePaid(url, email) : await CourseModel.addUserToCourseFree(url, email);

    }
}