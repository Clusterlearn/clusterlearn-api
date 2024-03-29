import { avaliablePlatform } from '@/types/modelData';
import bcrypt from 'bcrypt';
 

export function hashPassword(password: string, saltRounds = 10){
    const salt =  bcrypt.genSaltSync(saltRounds);
    const hash =  bcrypt.hashSync(password, salt);
    return hash;
}

export async function verifyPassword(password: string , hash: string)
{
    return bcrypt.compareSync(password, hash)
}


export function getPlatformHost(url: string): avaliablePlatform
{
    const parsedUrl = new URL(url);
    const host = parsedUrl.host.replace('www.', '')
    // remove any subdomain and get only the main domain
    const hostParts = host.split('.')
    if (hostParts.length > 2) hostParts.shift()
    return hostParts.join('.') as avaliablePlatform
}