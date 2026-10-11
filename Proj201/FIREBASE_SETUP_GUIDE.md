# PROJ 201 — Google Firebase Cloud Database Setup Guide
**Mustafaoglu Lab · Sabancı University · Fall 2026**

This guide explains how to connect your PROJ 201 interactive web platform to **Google Firebase Firestore** in **3 minutes**.

Firebase is **100% free forever** (Google Spark plan) and provides **live, real-time synchronization** across all 6 students' laptops and browsers without any server backend. When any student adds or verifies a trial, all teammates and Dr. Nur Mustafaoğlu will see it update in real time!

---

## Step 1: Create a Free Firebase Project

1. Go to **[console.firebase.google.com](https://console.firebase.google.com/)** and log in with your Google / Sabancı account.
2. Click **Add project** (or **Create a project**).
3. Enter a project name, for example: `proj201-trials` or `mustafaoglu-proj201`.
4. Click **Continue**.
5. When asked about Google Analytics, you can uncheck/disable it (not needed), then click **Create project**.
6. Wait 15 seconds for Google to provision the project, then click **Continue**.

---

## Step 2: Create the Firestore Database

1. In the left navigation menu, click **Build** &rarr; **Firestore Database**.
2. Click the **Create database** button.
3. **Database location**: Choose default (e.g. `eur3 (europe-west)` or `nam5 (us-central)`). Click **Next**.
4. **Security rules**: Select **Start in test mode** (this allows read and write access for your course students).
5. Click **Create**.

> [!NOTE]
> *Test Mode* allows read and write access so all students can enter data. If you ever want to set permanent simple course rules, go to the **Rules** tab in Firestore and use:
> ```javascript
> rules_version = '2';
> service cloud.firestore {
>   match /databases/{database}/documents {
>     match /{document=**} {
>       allow read, write: if true;
>     }
>   }
> }
> ```

---

## Step 3: Get your Web App Configuration

1. In the top left near **Project Overview**, click the ⚙️ (Settings gear icon) &rarr; **Project settings**.
2. Scroll down to the **Your apps** section.
3. Click the **Web** icon (`</>` code icon).
4. Enter an App nickname (e.g. `PROJ201-Web`), uncheck Firebase Hosting, and click **Register app**.
5. You will see a code block containing `const firebaseConfig = { ... }`.
6. Copy that configuration snippet. It will look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxx",
     authDomain: "proj201-trials.firebaseapp.com",
     projectId: "proj201-trials",
     storageBucket: "proj201-trials.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

---

## Step 4: Connect the Platform to Firebase

You have two easy ways to apply the configuration:

### Method A: Via the Web Interface (Instant)
1. Open the PROJ 201 platform in your browser.
2. Click the **Cloud Setup** pill in the top header (or click **Data Tools &rarr; Firebase Cloud DB Settings**).
3. Paste the configuration snippet into the textarea.
4. Click **Test & Connect to Firebase**.
5. You will see the header pill turn **🟢 Cloud Synced (Firebase)**!
6. Click **Upload Current Local Trials to Cloud** to immediately push the 9 benchmark trials and initial logs into Firestore.

### Method B: Hardcode in the Repository (Recommended for All Students)
If you want the cloud database to connect automatically for all students without them needing to paste anything:
1. Open [`Proj201/js/cloudSync.js`](file:///Users/nurmustafaoglu/Library/CloudStorage/Dropbox-Personal/nurOnur/mustafaoglulab.github.io/Proj201/js/cloudSync.js) in your editor.
2. At line 10, replace `const DEFAULT_FIREBASE_CONFIG = null;` with your copied config:
   ```javascript
   const DEFAULT_FIREBASE_CONFIG = {
     apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxx",
     authDomain: "proj201-trials.firebaseapp.com",
     projectId: "proj201-trials",
     storageBucket: "proj201-trials.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```
3. Commit and push to GitHub.
4. Now, any student opening `https://mustafaoglulab.github.io/Proj201/` will automatically be connected to the shared database!

---

## What Happens When Connected?

- **Real-Time Collaboration**: When Student A1 adds a trial, it automatically shows up on Student A2's and Dr. Nur's screens within milliseconds without page refresh.
- **Peer Verification**: When a student signs off in the QC workflow, the status updates across all connected computers in real time.
- **Offline Fallback**: If a student's internet drops, changes are cached locally in the browser and will sync when back online.
- **Full Backups**: You can still click **Data Tools &rarr; Export All as JSON** or **Export as CSV** at any time to create offline spreadsheet backups.
