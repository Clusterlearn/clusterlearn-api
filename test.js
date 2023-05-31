const { google } = require('googleapis');
const keyFile = require('./path/to/your/keyfile.json');

// Configure the authentication credentials
const auth = new google.auth.GoogleAuth({
  credentials: keyFile,
  scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
});

// Load the calendar API
async function loadCalendarAPI() {
  const calendar = google.calendar({ version: 'v3', auth });
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: {
      end: { date: '2023-05-31' },
      start: { date: '2023-05-29' },
      conferenceData: {
        createRequest: { requestId: 'test-123-256' },
        conferenceSolution: { name: 'hangoutsMeet' },
      },
    },
    conferenceDataVersion: 1,
  });
  
  const eventId = response.data.id;
  const meetLink = `https://meet.google.com/${eventId}`;
  
  console.log('Meeting created:', meetLink);
}

// Authorize and load the calendar API
async function authorizeAndLoad() {
  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  try {
    await loadCalendarAPI();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the authorizeAndLoad function to execute the code
authorizeAndLoad();
