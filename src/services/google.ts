import fs from 'fs';
import readline from 'readline';
import { calendar_v3, google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';

const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

type meetingLinkResult = {
    status: true;
    link: string;
    start?: any;
    end?: any;
} | {
    status: false;
    message: string;
};

// Load client secrets from a file
export async function generateMeetingLink(members: string[]): Promise<meetingLinkResult> {
    try {
        const auth = await authorize(); // to get auth
        const link = await callGoogleAPI(auth, members);
        return { status: true, link };
    } catch (err) {
        return { status: false, message: (err as Error).message };
    }
}


async function generateOauthClient(): Promise<OAuth2Client> {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH).toString());
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    return oAuth2Client;
}

// Create an OAuth client and authorize it with the given credentials
export async function authorize(_oAuth2Client ?: OAuth2Client): Promise<OAuth2Client> {
    const oAuth2Client = _oAuth2Client ?? await generateOauthClient();
    // Check if a token file exists
    let accessToken;
    if (fs.existsSync(TOKEN_PATH)) accessToken = JSON.parse(fs.readFileSync(TOKEN_PATH).toString());
    if (!accessToken) accessToken = await getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials(accessToken);
    return oAuth2Client;
}


export async function generateAdminGoogleAuthUrl(_oAuth2Client ?: OAuth2Client): Promise<string>
{
    const oAuth2Client = _oAuth2Client ?? await generateOauthClient();
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    });
}
// Generate a new OAuth access token
async function getAccessToken(oAuth2Client: OAuth2Client): Promise<Credentials> {
    
    const authUrl = await generateAdminGoogleAuthUrl(oAuth2Client);

    console.log('Authorize this app by visiting the following URL:\n', authUrl);


    let code = process.env.GOOGLE_AUTH_CODE 

    if (!code) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        code = await new Promise<string>((resolve) => {
            rl.question('Enter the authorization code from the URL: ', (code) => {
                rl.close();
                resolve(code);
            });
        });
    }
    // Exchange the authorization code for an access token
    return await saveAccessToken(code, oAuth2Client);
}

export async function saveAccessToken(code: string, _oAuth2Client?: OAuth2Client) {
    const oAuth2Client = _oAuth2Client ?? await generateOauthClient();
    const token = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token.tokens));
    console.log('Access token saved successfully.');
    oAuth2Client.setCredentials(token.tokens);
    return token.tokens
}


async function callGoogleAPI(auth: OAuth2Client, members: string[]): Promise<string> {
    const calendar = google.calendar({ version: 'v3', auth });

    // Use the calendar API here
    // Example: Insert a new event
    const requestId = generateTruncatedUUID(); // Generate a UUIDv4

    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes after start time
    console.log(startTime.toISOString(), endTime.toISOString());

    const event: calendar_v3.Schema$Event = {
        start: {
            dateTime: startTime.toISOString(),
            timeZone: "Africa/Lagos"
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: "Africa/Lagos"
        },
        organizer: {
            email: "ridoxstudio@gmail.com",
            self: false
        },
        visibility: 'public',
        conferenceData: {
            createRequest: {
                requestId: requestId,
                conferenceSolutionKey: {
                    type: "hangoutsMeet"
                },
                status: {
                    statusCode: "success"
                }
            }
        },
        guestsCanModify: true, // Allow guests to modify the event details
        guestsCanInviteOthers: true, // Allow guests to invite others
        attendees: members.map(email => ({ email, responseStatus: "accepted" })),
    };

    const params = {
        calendarId: "primary",
        conferenceDataVersion: 1,
        resource: event,
    };

    try {
        const res = await calendar.events.insert(params);
        console.log('Event created:', res.data);

        if (res.data && res.data.hangoutLink) {
            console.log('Google Meet link:', res.data.hangoutLink);
            return res.data.hangoutLink;
        } else {
            throw new Error('Failed to get the Google Meet link.');
        }
    } catch (err) {
        console.error('Error creating event:', err);
        throw err;
    }
}



function generateTruncatedUUID() {
    const uuid = uuidv4().replace(/-/g, '');
    const truncatedUuid = uuid.substring(0, 3) + '-' + uuid.substring(3, 7) + '-' + uuid.substring(7, 10);
    return truncatedUuid;
}
