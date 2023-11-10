import { generateMeetingLink } from "@/services/google";
import sendMessage from "@/services/mailer";
import { groupMember, group_member } from "@/types/modelData";

export async function scheduleMeeting<T extends group_member>(members: groupMember<T>) {
    try {
        const data = await generateMeetingLink(members.map(member => member.email))
        if(!data.status) throw new Error(data.message) 
        const mails = members.forEach(member => {
            sendMessage({
                from: process.env.MAIL_ADDRESS,
                to: member.email,
                subject: 'Your cluster is ready',
                text: `Your cluster is ready, join the meeting at ${data.link}`,
                html: `<p>Your cluster is ready, join the meeting at <a href="${data.link}">${data.link}</a></p>`
            })
        })
    }
    catch (e) {
        console.log(e)
    }
}