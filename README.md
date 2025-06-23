Collaborative Candidate Notes
A real-time notes app where recruiters can leave comments on candidates, tag others using @mentions, and get notified instantly.

Tech Stack
Next.js (App Router)
React
Tailwind CSS
ShadCN UI
Firebase Authentication
Firestore (Firebase Database)
Firebase Cloud Functions
Vercel (for hosting)
Setup Instructions
1. Clone the Repository
git clone https://github.com/girishkumarreddymallela/algohire.git
cd to-your-folder
npm install
we use firebase for backend services so we need a firebase account and create a project and app inside it and we get the following credentials
NEXT_PUBLIC_FIREBASE_API_KEY="your_key_here"

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"

NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"

NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

Add the above in .env.local file

Deploy Cloud Function
for deploying cloud function(serverless function on google cloud ) for pushing notifications on event trigger

cd functions
npm install
firebase deploy --only functions
Finally run the command --npm run dev
