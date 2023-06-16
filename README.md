
# API Usage

This documentation provides instructions on how to use the API for user registration and verification.

## Response Format

All responses from the API follow this format:

```json
{
  "status": "success" | "error",
  "code": number,
  "message": string,
  "data": { ... }
}
```

- `status`: Indicates if the request was successful or encountered an error.
- `code`: Represents the response code. It could be a success status code or an error code.
- `message`: Provides additional information about the response.
- `data`: Contains the main response data specific to the requested endpoint.

## API Usage Steps

To successfully register a user for a course using the API, follow these steps:

1. **Email Verification**
   - If the user does not have a "remember me" token (usually stored in local storage), you need to verify the user's email. You can also request a "remember me" token during this process.
   - To initiate the email verification process, send a `POST` request to the `/user/getverify` endpoint with the user's email.
   - Example Request:
     ```javascript
     fetch('/user/getverify', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         email: 'user@example.com'
       })
     })
       .then(response => response.json())
       .then(data => {
         console.log(data);
         // Process the response data
       })
       .catch(error => {
         console.error(error);
         // Handle the error
       });
     ```
   - Example Response Data:
     ```json
     {
       "email": "<string>"
     }
     ```

2. **Email Verification Confirmation**
   - Once the verification code is received via email, send a `POST` request to the `/user/verify` endpoint with the email, verification code, and an optional "remember me" flag.
   - Example Request:
     ```javascript
     fetch('/user/verify', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         email: 'user@example.com',
         code: '123456',
         rememberMe: true // if user requested to be remebered
       })
     })
       .then(response => response.json())
       .then(data => {
         console.log(data);
         // Process the response data
       })
       .catch(error => {
         console.error(error);
         // Handle the error
       });
     ```
   - Example Response Data:
     ```json
     {
       "email": "<string>",
       "deviceToken": "<string>"
     }
     ```

3. **User Registration**
   - Once the email is verified, you can register the user for the course by sending a `POST` request to the `/user/register` endpoint with the necessary information.
   - Example Request:
     ```javascript
     fetch('/user/register', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         email: 'user@example.com',
         url: 'https://example.com/course',
         paid: true,
         rememberToken: '<remember_me_token>'
       })
     })
       .then(response => response.json())
       .then(data => {
         console.log(data);
         // Process the response data
       })
       .catch(error => {
         console.error(error);
         // Handle the error
       });
     ```
   - Example Response Data:


     ```json
     {
       "email": "<string>",
       "platform": "<string>",
       "course": "<string>",
       "message": "<string>",
       "groupCount": {
         "word": "<string>",
         "total": "<number>",
         "left": "<number>"
       }
     }
     ```

Feel free to explore and utilize the API endpoints as per your requirements. If you encounter any issues or have questions, please reach out to the API support team for assistance.

> Note: Replace `<string>`, `<boolean>`, and other placeholders with the actual values when making API requests.

---
