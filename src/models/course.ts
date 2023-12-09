import mongoose, { Document, Model, Schema } from 'mongoose';
import { CourseReg, CourseDocument, free_group_course_formation, paid_group_course_formation } from '../types/modelData'
import AddToCourseExceptions from '../utils/Exceptions/AddToCourseException';
import { getPaymentLink } from '../controllers/payment';
import RegisteredCourse from '../schema/RegisteredCourse';


export class CourseModel {
    async removeUserFromCourseFree(url: string, email: string) {
        const course = await this.getCousre(url);
        if (!course) throw new Error(`Course not found`);
        const email_group = course.groups.free?.find(group => group.members.map(member => member.email).includes(email));
        if (!email_group) throw new AddToCourseExceptions(`${email} is not in a group related to this course`, url, 401)
        email_group.members = email_group.members.filter(member => member.email !== email);
        console.log(email_group.members)
        await course.save();
        return {course, email_group}
    }
    async removeUserFromCoursePaid(url: string, email: string) {
        const course = await this.getCousre(url);
        if (!course) throw new Error(`Course not found`);
        const email_group = course.groups.paid?.find(group => group.members.map(member => member.email).includes(email));
        if (!email_group) throw new AddToCourseExceptions(`${email} is not in a group related to this course`, url, 401)
        email_group.members = email_group.members.filter(member => member.email !== email);
        await course.save();
        return {course, email_group}
    }
 
    private model: Model<CourseDocument>;

    constructor() {
        // Create a new Mongoose model for user documents
        this.model = mongoose.model<CourseDocument>('Courses', RegisteredCourse);
    }

    async getUserByEmail(email: string): Promise<CourseReg | null> {
        // Find a user document by email using the Mongoose model
        const user = await this.model.findOne({ email }).lean<CourseDocument>().exec();
        return user ? { ...user } : null;
    }
    
    async getCousre(urlOrId : string) {
        const course = await this.model.findOne({link : urlOrId}) ?? await this.model.findOne({_id : urlOrId});
        return course ?? null
    }

    async findCourseByLink(link: string) {
        const course = await this.model.findOne({link : link});
        return course ?? null
    }

    async addUserToCourseFree(link:string, email:string){
        const course = await this.getCousre(link);
        if(!course) throw new Error(`Course not found`);
        console.log(course)
        const all_free_course_members = [...course.groups.free?.map(group => group.members.map(member => member.email))].flat();
        console.log('runnig here', all_free_course_members)
        if(all_free_course_members.includes(email)) throw new AddToCourseExceptions(`${email} is already in a group related to this course`, link, 401)
        console.log('runnig here free', course.groups.free) 
        const lastgroup = course.groups.free[ course.groups.free.length - 1]
        if(lastgroup && lastgroup.members?.length < 8){
            lastgroup.members.push({
                joined: new Date().toISOString(),
                email:email
            });
        }
        else {
            course.groups.free?.push({
                start_date : new Date().toISOString(),
                members:[{
                    joined: new Date().toISOString(),
                    email:email
                }]
            })
        }
        await course.save();
        return course;
    }

       async addUserToCoursePaid(url: string, email: string) {
        const course = await this.getCousre(url);
        if(!course) throw new Error(`Course not found`);
        const all_paid_course_members = [...course.groups.paid.map(group => group.members.map(member => member.email))].flat();
        if(all_paid_course_members.includes(email)) throw new AddToCourseExceptions(`${email} is already in a group related to this course`, url, 401)
        const lastgroup  = course.groups.paid.at(-1);
        if(lastgroup && lastgroup.members.length < 8){
            lastgroup.members.push({
                joined: new Date().toISOString(),
                email:email,
                paid:false,
                payment_link : getPaymentLink(email)
            });
        }
        else {
            course.groups.paid.push({
                start_date : new Date().toISOString(),
                members:[{
                    joined: new Date().toISOString(),
                    email:email,
                    paid:false,
                    payment_link : getPaymentLink(email)
                }]
            })
        }
        await course.save();
        return course;
    }
    
    async createCourse(course: CourseReg) {
        // Create a new user document using the Mongoose model
        const newCourse = new this.model(course);
        return await newCourse.save();
    }

}



export default new CourseModel()

