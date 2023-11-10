# API Usage

This documentation provides instructions on how to use the API for user registration and verification.


# Steps to Use the API 
- Request for confirmation code
- Validate the code
- Request to be added to a group

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
   - **NOTE:** If you already have a "remember me" token, skip to the user registration step.
   - If the user does not have a "remember me" token (usually stored in local storage), you need to verify the user's email. You can also request a "remember me" token during the email verification confirmation process.
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
       "email": "user@example.com"
     }
     ```

2. **Email Verification Confirmation**
   - Once the verification code is received via email, send a `POST` request to the `/user/verify` endpoint with the email, verification code, and an optional "remember me" flag.
   - Endpoint: `/user/verify`
   - Method: `POST`
   - Request Body:
     ```json
     {
         "email": "user@example.com",
         "code": "123456",
         "rememberMe": true
     }
     ```
   - Description: Confirm email verification using the verification code received via email.
   - Example Response Data:
     ```json
     {
       "email": "user@example.com",
       "deviceToken": "<string>" // Only included if rememberMe is true
     }
     ```

3. **User Registration**
   - Once the email is verified, you can register the user for the course by sending a `POST` request to the `/user/register` endpoint with the necessary information.
   - Endpoint: `/user/register`
   - Method: `POST`
   - Request Body:
     ```json
     {
         "email": "user@example.com",
         "url": "https://example.com/course",
         "paid": false, // true if for paid mentorship
         "rememberToken": "<remember_me_token|null>"
     }
     ```
   - Description: Register the user for a course. If you have a "remember me" token, include it in the request to bypass the email verification process.
   - Example Response Data:
     ```json
     {
       "email": "user@example.com",
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
