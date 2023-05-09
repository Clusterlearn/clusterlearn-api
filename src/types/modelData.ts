export type platform_names = 'udemy' | 'edx'
export type avaliablePlatform =  `${platform_names}.com`
export type free_group_member = {
    joined: string,
    email: string
}
export type paid_group_member = {
    joined: string,
    email: string,
    paid: boolean
    payment_link: string
}
export type group_member = free_group_member | paid_group_member
export type free_group_course_formation = {
    start_date: string;
    end_date?: string;
    members : groupMember<free_group_member>
}

export type paid_group_course_formation = {
            start_date: string;
            end_date?: string;
            mentor ?: string;
            members : groupMember<paid_group_member>
        }
type validArray<Length extends number, MemberShipType extends group_member> = Array<MemberShipType> 
export type groupMember<MemberShipType extends group_member> = validArray<0, MemberShipType> | validArray<1, MemberShipType> | validArray<2, MemberShipType> | validArray<3, MemberShipType> | validArray<4, MemberShipType> | validArray<5, MemberShipType> | validArray<6, MemberShipType> | validArray<7, MemberShipType> | validArray<8, MemberShipType> 
export interface CourseReg{
    name: string;
    link: string;
    platform : avaliablePlatform;
    groups : {
        free : Array<free_group_course_formation>,
        paid:  Array<paid_group_course_formation>,
    }
}

export interface CourseDocument extends CourseReg, Document { }

