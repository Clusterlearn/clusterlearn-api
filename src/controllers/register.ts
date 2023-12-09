import Validator from "../utils/Validator"
import CourseModel  from "../models/course";
import AddToCourseExceptions from "../utils/Exceptions/AddToCourseException";
import { scheduleMeeting } from "./meeting";
import { deleteUnRegistrationToken, generateUnRegistrationToken, getPlatformHost, getUnRegistrationData } from "@/utils/helper";
import sendMessage from "@/services/mailer";


export default class RegisterUserToCourse {
    static async register(url : string, email : string, paid : boolean = false){

        if(!Validator.isValidEmail(email)) throw new AddToCourseExceptions('invalid email', url, 400);
        if(!Validator.isValidUrl(url)) throw new AddToCourseExceptions('invalid Course url', url, 400);
        const parsedUrl = new URL(url);
        const host = parsedUrl.host.replace('www.', '')
        url = `${parsedUrl.protocol}//${host}${parsedUrl.pathname}`;
        if (!Validator.isValidPlatform(url)) throw new AddToCourseExceptions('invalid platform', url, 400);
        if(! await CourseModel.findCourseByLink(url)) await CourseModel.createCourse({
            name: parsedUrl.pathname,
            link: url,
            platform: getPlatformHost(url),
            groups: {
                free: [],
                paid: []
            }
        });
        

        const data = paid ? await CourseModel.addUserToCoursePaid(url, email) : await CourseModel.addUserToCourseFree(url, email);
        const version = paid ? 'paid' : 'free'
        const last_group_members = data.groups[version][data.groups[version].length - 1]?.members
        if (last_group_members && last_group_members.length == 8) {
            await scheduleMeeting(last_group_members, data)
        } else {
            const unregistrationToken = await generateUnRegistrationToken(url, email, paid)
            console.log(unregistrationToken, 'unregistrationToken')
            const unregistrationLink = `${process.env.BASE_URL}/user/unregister/${unregistrationToken}`
            await sendMessage({
                from: process.env.MAIL_ADDRESS,
                to: email,
                subject: 'Your registration is successful',
                text: `Hi, your registration for the Course ${url} is successful, you will be notified when the group is ready, to unregister from the course click on the link below ${unregistrationLink}`,
                html: `<p>Hi, your registration for the Course ${url} is successful, you will be notified when the group is ready, to unregister from the course click on the link below</p><a href="${unregistrationLink}">${unregistrationLink}</a>`
            })
        }
        return data

    }

    static async unregister(url: string, email: string, paid: boolean = false) {
        if (!Validator.isValidEmail(email)) throw new AddToCourseExceptions('invalid email', url, 400);
        if (!Validator.isValidUrl(url)) throw new AddToCourseExceptions('invalid Course url', url, 400);
        const parsedUrl = new URL(url);
        const host = parsedUrl.host.replace('www.', '')
        url = `${parsedUrl.protocol}//${host}${parsedUrl.pathname}`;
        if (!Validator.isValidPlatform(url)) throw new AddToCourseExceptions('invalid platform', url, 400);
        if (!await CourseModel.getCousre(url)) throw new AddToCourseExceptions('Course not found', url, 404);

        console.log("unregistering", url, email, paid)
        const data = paid ? await CourseModel.removeUserFromCoursePaid(url, email) : await CourseModel.removeUserFromCourseFree(url, email);
        return data
    }

    static async unregisterFromToken(token: string) {
        const data = await getUnRegistrationData(token)
        if (!data) throw new AddToCourseExceptions('invalid token', '', 400);
        const { url, email, paid } = data
        const t = await this.unregister(url, email, paid)
        await deleteUnRegistrationToken(token)
        return {...t, token, email}
    }
}