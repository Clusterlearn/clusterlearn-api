import { generateMeetingLink } from "@/services/google";
import sendMessage from "@/services/mailer";
import { CourseReg, groupMember, group_member } from "@/types/modelData";
import {generateUnRegistrationToken} from "@/utils/helper";

export async function scheduleMeeting<T extends group_member>(members: groupMember<T>, data:CourseReg) {
    try {
        const meetingData = await generateMeetingLink(members.map(member => member.email))
        if(!meetingData.status) throw new Error(meetingData.message) 
        const mails = members.forEach(async (member) => {
            const unRegisterToken = await generateUnRegistrationToken(data.link, member.email)
            sendMessage({
                from: process.env.MAIL_ADDRESS,
                to: member.email,
                subject: 'Your cluster is ready',
                text: `Hi, your cluster is ready for the Course ${data.link}, join the meeting at ${meetingData.link}`
            })
        })
    }
    catch (e) {
        console.log(e)
    }
}