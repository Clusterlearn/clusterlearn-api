import { Schema } from "mongoose";
import { CourseDocument, free_group_course_formation } from "src/types/modelData";


// Mongoose schema for user documents

export default new Schema<CourseDocument>({
name: { type: String, required: true },
link : {type: String, required : true},
platform : {type : String, required: true},
groups: {
    free: {
        type: [{
            start_date: {type: String, required: true},
            end_date: {type: String},
            members : {
                type : [{
                    joined: { type: String, required: true},
                    email : { type: String, required: true}
                }], required : true,
            },
        }],
        validate: {
            validator: (v: Array<free_group_course_formation>) => v.every(a => a.members?.length ?? 0 <= 8),
            message:"Group size exceeded"
        },
            required: true
    },
    paid: {
        type: [{
            start_date: {type: String, required: true},
            end_date: {type: String},
            members : {
                type : [{
                    joined: { type: String, required: true},
                    email : { type: String, required: true},
                    paid: {type:Boolean, required:true},
                    payment_link: { type: String, required: true},
                }], required : true,
            },
        }],
        validate: {
            validator: (v: Array<free_group_course_formation>) => v.every(a => a.members?.length ?? 0 <= 8),
            message:"Group size exceeded"
        },
            required: true
    }
}
}, {collection:"registeredCourse"});