Deployment instructions

1. Create a new Google Sheet in your Google Drive. Note its spreadsheet ID from the URL (the long string between `/d/` and `/edit`).

2. In the sheet, you can optionally create tabs named `Registrations` and `Customer Capture`. The script will create either tab when it is first needed.

3. Open Google Apps Script (https://script.google.com/) and create a new project.

4. In the Apps Script editor, replace the default code with the contents of `webapp.gs` (in this repo).

5. Replace the value of `SPREADSHEET_ID` in `webapp.gs` with your spreadsheet ID.

6. Save the project. From the top-right, choose `Deploy` -> `New deployment`.
   - Select `Web app` as the deployment type.
   - For `Execute as`, choose `Me`.
   - For `Who has access`, choose `Anyone` or `Anyone, even anonymous` (recommended for anonymous QR scans).
   - Deploy and copy the deployment URL (it looks like `https://script.google.com/macros/s/XXX/exec`).

7. Configure dashboard access in Apps Script:
   - Open `Project Settings`.
   - Under `Script Properties`, add a property named `DASHBOARD_ACCESS_CODE`.
   - Set its value to a private access code shared only with authorised dashboard users.
   - Add a second property named `CUSTOMER_CAPTURE_ACCESS_CODE`.
   - Set it to the staff code required to unlock and submit the customer-capture form.

8. If the deployment URL changes, update it in `index.html`, `customer-capture.html`, `local_proxy.py`, and `_redirects`.

9. Test the website registration flow:
   - Open the landing page, submit the popup form (phone required).
   - The Apps Script will append a row to the `Registrations` sheet with a generated 6-character voucher.
   - After submission the page redirects the user to WhatsApp with a prefilled message (the user requests their voucher). Staff can then look up the voucher in the sheet and reply.

10. Test the internal customer tools:
   - Open `customer-capture.html`, select a branch, and save a test customer.
   - Confirm a row appears in the `Customer Capture` sheet.
   - Open `dashboard.html`, enter the `DASHBOARD_ACCESS_CODE`, and confirm the record appears.

Notes
- The script returns a JSON object of the form `{ success: true, voucher: 'ABC123' }`. The frontend does NOT display the voucher; it redirects the user to WhatsApp so staff can complete voucher delivery.
- Submissions whose service is `Medcourt Membership` are saved without generating a voucher; their `Voucher` cell is left blank.
- Customer-capture submissions are stored separately in the `Customer Capture` sheet with timestamp, branch, customer name, phone number, optional product, refill status, and a unique entry ID.
- Dashboard reads require the server-side `DASHBOARD_ACCESS_CODE`. Do not place this code directly in any HTML file.
- Customer capture requires the server-side `CUSTOMER_CAPTURE_ACCESS_CODE`; the code is validated again with every submission.
- Deploying as `Anyone, even anonymous` is necessary so event attendees can submit without signing in. This makes the endpoint public; consider adding monitoring or rate limits later.
- If you want me to deploy the Apps Script on your behalf, you'll need to provide access to a Google account or deploy credentials (not recommended). Instead, I can guide you through the deploy steps interactively.
