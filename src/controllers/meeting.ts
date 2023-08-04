import { groupMember, group_member } from "@/types/modelData";

export async function scheduleMeeting<T extends group_member>(members: groupMember<T>) {
    const mails = members.map(member => member.email)
}