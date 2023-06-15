const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

// Load client secrets from a file
fs.readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) {
        console.error('Error loading client secret file:', err);
        return;
    }

    // Authorize with credentials
    authorize(JSON.parse(content), callGoogleAPI);
});

// Create an OAuth client and authorize it with the given credentials
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if a token file exists
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            // No token file found, generate a new one
            getAccessToken(oAuth2Client, callback);
        } else {
            // Token file exists, set it to the OAuth client
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        }
    });
}

// Generate a new OAuth access token
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    });

    console.log('Authorize this app by visiting the following URL:\n', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the authorization code from the URL: ', (code) => {
        rl.close();

        // Exchange the authorization code for an access token
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error('Error retrieving access token:', err);
                return;
            }

            // Save the token to the token file
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) {
                    console.error('Error saving access token:', err);
                    return;
                }
                console.log('Access token saved successfully.');

                // Set the token to the OAuth client
                oAuth2Client.setCredentials(token);

                // Call the callback with the authorized OAuth client
                callback(oAuth2Client);
            });
        });
    });
}

// Call the Google Calendar API
function callGoogleAPI(auth) {
    const calendar = google.calendar({ version: 'v3', auth });

    // Use the calendar API here
    // Example: Insert a new event
    const requestId = generateTruncatedUUID(); // Generate a UUIDv4

    calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        maxAttendees: 8,
        sendNotifications: true,
        sendUpdates: "all",
        supportsAttachments: true,
        resource: {
            start: {
                dateTime: "2023-06-05T10:00:00",
                timeZone: "Africa/Lagos"
            },
            end: {
                dateTime: "2023-06-07T10:00:00",
                timeZone: "Africa/Lagos"
            },
            organizer: {
                email: "ridoxstudio@gmail.com",
                self: false
            },
            visibility:'public',
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
            attendees: [
                {email:"ridoxchannel@gmail.com"}
            ],
        }
    }, (err, res) => {
        if (err) {
            console.error('Error creating event:', err);
            return;
        }
        console.log('Event created:', res.data);
        console.log('Google Meet link:', res.data.hangoutLink);
    });
}


function generateTruncatedUUID() {
    const uuid = uuidv4().replace(/-/g, '');
    const truncatedUuid = uuid.substring(0, 3) + '-' + uuid.substring(3, 7) + '-' + uuid.substring(7, 10);
    return truncatedUuid;
}