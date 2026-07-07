# file transfer system

担当 / assignee: Abner
status: 進行中
created_at: July 4, 2026 3:12 AM
updated_at: July 6, 2026 10:24 AM
最終更新者: Abner

# Secure File Transfer Function MVP Requirements Definition

## 1. Purpose

 To securely send confidential files that are too large to be attached to emails (20 MB or larger) to parties outside the company.

 This is intended for sending documents related to CIO operations.

---

# 2. Target Users

## Sender

- Internal Members

## Recipients

- External Users
- No Google Account or similar required
- No account registration required

---

# 3. List of Features

## 3.1 File Upload

 The sender enters the following:

- Select a file
- Recipient's email address

### Restrictions

- Maximum of 1 file
- Maximum 500 MB
- All file extensions supported
- Retain the file name

---

## 3.2 Generating a Download URL

 After the upload is complete, a random URL that is difficult to guess is generated.

 Example

https://download.example.com/xxxxxxxxxxxxxxxx

 The URL must be a token of sufficient length and randomness.

---

## 3.3 Download Expiration

 Default value

- 7 days

 If the deadline has passed, downloads will be disabled, and

 "Expired"

 will be displayed.

---

## 3.4 One-Time Password (OTP)

 When the download URL is accessed,

 a 6-digit OTP will be sent to the registered recipient’s email address.

 Downloading is permitted only after successful OTP authentication.

### OTP Specifications

- 6-digit random number
- Valid for 10 minutes
- Once used, the OTP is invalidated

---

## 3.5 Download

 After successful OTP authentication, you can download the file.

### Download Limit

- Downloads are only allowed within the validity period
- **You can download up to 5 times**
- Downloads are not permitted after the 6th time

 Display Message

 "This file has reached its download limit."

### What Counts

 One download is counted as soon as the download response begins successfully.

---

## 3.6 Automatic Deletion

 The file will be automatically deleted if any of the following conditions are met:

- Expired
- After the download count reaches 5 (deleted immediately or via a periodic batch process)

 Items to be Deleted

- Files in storage
- DB records (or logically deleted)

---

# 4. Send Email

 After the upload is complete, send an email to the recipient.

 Content

- File name
- Download URL
- Expiration Date

 Do not include the OTP in the email body.

---

# 5. Administrative Information

 Items to be saved

- ID
- File Name
- Storage Location
- File Size
- Recipient's Email Address
- Creation Date and Time
- Expiration Date
- Number of Downloads
- Last Download Date and Time
- Last Download IP Address
- Status

---

# 6. Status

- Uploaded
- Available
- Download Limit Reached
- Expired
- Deleted

---

# 7. Security

- HTTPS Required
- The URL consists of a random value of 128 bits or more
- OTP must be a random 6-digit number
- OTP must be hashed before storage
- Configure the system so that files cannot be accessed directly from the download URL
- Files do not have public URLs

---

# 8. Administration Interface

 Implement list view only.

 Display Fields

- File Name
- Recipient
- Registration Date and Time
- Number of downloads (0–5)
- Status
- Last Download Date and Time

 Implement only the delete button.

---

# 9. Not eligible for MVP

- Sending Multiple Files
- ZIP Encryption
- Password delivery
- SMS authentication
- IP Restrictions
- Virus Check
- Changing the Download Limit
- Expiration Date Change
- File Preview
- Send Folder
- Automatic Linking to Projects
- Slack Notifications
- Notion Integration
- Search Send History
- File version control
- Electronic Signatures
- SSO Authentication
- Permissions Management
