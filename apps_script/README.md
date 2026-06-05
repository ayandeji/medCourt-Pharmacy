Deployment instructions

1. Create a new Google Sheet in your Google Drive. Note its spreadsheet ID from the URL (the long string between `/d/` and `/edit`).

2. In the sheet, you can (optionally) create a tab named `Registrations`. The script will create it if missing.

3. Open Google Apps Script (https://script.google.com/) and create a new project.

4. In the Apps Script editor, replace the default code with the contents of `webapp.gs` (in this repo).

5. Replace the value of `SPREADSHEET_ID` in `webapp.gs` with your spreadsheet ID.

6. Save the project. From the top-right, choose `Deploy` -> `New deployment`.
   - Select `Web app` as the deployment type.
   - For `Execute as`, choose `Me`.
   - For `Who has access`, choose `Anyone` or `Anyone, even anonymous` (recommended for anonymous QR scans).
   - Deploy and copy the deployment URL (it looks like `https://script.google.com/macros/s/XXX/exec`).

7. In your `index.html`, replace the placeholder `WEBAPP_URL` with the web app URL you copied in step 6.

8. Test the flow:
   - Open the landing page, submit the popup form (phone required).
   - The Apps Script will append a row to the `Registrations` sheet with a generated 6-character voucher.
   - After submission the page redirects the user to WhatsApp with a prefilled message (the user requests their voucher). Staff can then look up the voucher in the sheet and reply.

Notes
- The script returns a JSON object of the form `{ success: true, voucher: 'ABC123' }`. The frontend does NOT display the voucher; it redirects the user to WhatsApp so staff can complete voucher delivery.
- Deploying as `Anyone, even anonymous` is necessary so event attendees can submit without signing in. This makes the endpoint public; consider adding monitoring or rate limits later.
- If you want me to deploy the Apps Script on your behalf, you'll need to provide access to a Google account or deploy credentials (not recommended). Instead, I can guide you through the deploy steps interactively.
