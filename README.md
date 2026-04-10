# 👻 Social Souls

> *A dreadfully engaging social platform for the restless and the bold.*

---

## 📖 Description

**Social Souls** is a horror-themed, web-based real-time chat application built for fast and seamless communication with a dark twist. Tired of modern, boring chat apps? Social Souls brings a haunting aesthetic to everyday messaging — where your conversations stay deep in the underworld, far away from the human world.

With Social Souls you can:
- 💬 Send real-time messages to your fellow souls
- 📁 Share files and images directly in the chat
- 👤 Customize your own spectral profile
- 👻 Add friends by their username and build your circle of soulmates
- 🔔 Get notified when new messages arrive from the beyond

This is not just another chat app. It is a little twist on the modern communication tools you already know — reimagined from the underworld up.

---

## ⚙️ Installation

Follow these steps to run Social Souls locally on your machine.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/)
- A [Firebase](https://firebase.google.com/) project with Firestore, Authentication and Storage enabled

### Steps

**1. Clone the repository:**
```bash
git clone https://github.com/your-username/social-souls.git
cd social-souls
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure Firebase:**

Create a `.env` file in the project root and add your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**4. Start the development server:**
```bash
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 🚀 Deployment

To build and deploy to Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting
```

---

## 📱 Usage

### Creating an Account

1. Visit [socialsouls.se](https://socialsouls.se)
2. Click **Sign Up** and enter your email, a unique username and a password
3. Your spectral soul will be created and you will be redirected to the chat

### Adding a Soulmate

1. Once inside the chat, click the **Add Friend** icon
2. Type the exact username of the soul you wish to summon
3. Send the request — once accepted, they will appear in your friends list

### Sending Messages

1. Click on a friend from your **Chats** or **Friends** tab to open a conversation
2. Type your message in the void and press **Enter** or click the send button
3. You can also attach files and images using the paperclip icon
4. Use the ghost icon to browse and send emojis

### Staying in the Underworld

Your messages and conversations remain private within the platform. Simply **log out** when you wish to return to the human world — your soul and all its secrets stay behind until you return.

> ⚠️ Social Souls is currently only supported on **desktop and laptop browsers**.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React + TypeScript | Frontend framework |
| Tailwind CSS | Styling |
| Firebase Auth | User authentication |
| Firebase Firestore | Real-time database |
| Firebase Storage | File and image uploads |
| Firebase Hosting | Web deployment |
| Vite | Build tool |

---

## 📄 License

© 2026 **CodeXynapse**. All rights reserved.

Social Souls is developed and maintained by **CodeXynapse**, a freelance software development company. Unauthorized copying, distribution, or modification of this software without explicit written permission from CodeXynapse is strictly prohibited.

For licensing inquiries or business collaborations, please reach out through the official CodeXynapse channels.

---

*Messages in the underworld will stay in the underworld. Welcome, lost soul.*
