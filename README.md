TheSocial-v2 (Revised Version)

A personal skills development iteration of our main location-based social media platform.

Table of Contents

Overview

Use Case

Features

Tech Stack

Architecture

Installation

Running the App

Folder Structure

Future Improvements


Overview

The-Social is a location-based social media platform designed to connect users with people nearby. This revised version focuses on personal skills development, allowing the developer to practice full-stack mobile and backend application development. The app supports real-time group chats, multimedia sharing, and simple games to enhance community engagement.

Use Case

This app targets users who want to interact with nearby communities and friends, share media, and play lightweight games within a location-aware environment. For the developer, it serves as a hands-on project to strengthen skills in Node.js, React Native, PostgreSQL, and WebSocket-based real-time communication.

Features

🌐 Location-based user discovery

💬 Real-time group chats with WebSockets

🖼 Multimedia sharing (images, videos)

🎮 Lightweight games for user engagement

🔒 User authentication and profile management

⚡ Optimized for mobile devices with smooth UI

Tech Stack

Frontend: React Native (Expo), JavaScript/TypeScript

Backend: Node.js, Express.js, WebSocket for real-time features

Database: PostgreSQL with PostGIS for geolocation

Authentication: JWT-based stateless authentication

Media Storage: Local filesystem (development), cloud storage optional

Architecture
[React Native App] <---> [REST APIs & WebSocket] <---> [Node.js + Express Backend] <---> [PostgreSQL Database]


Frontend: Handles UI, maps, group chats, and media display.

Backend: Exposes REST endpoints, manages sockets, handles authentication, and interacts with the database.

Database: Stores user info, posts, group chats, and location data.

Installation

Clone the repo

git clone https://github.com/<your-username>/The-Social.git
cd The-Social


Install backend dependencies

cd backend
npm install


Install frontend dependencies

cd ../frontend
npm install


Set up environment variables
Create .env in backend folder:

PORT=5000
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=social_app_db
JWT_SECRET=your_jwt_secret

Running the App
Backend
cd backend
npm start


Runs on http://localhost:5000

Frontend
cd frontend
expo start


Opens Expo developer tools for Android/iOS simulation

Folder Structure
/backend
  /controllers
  /routes
  /config
  server.js
  .env
/frontend
  /app
  /components
  /constants
  /hooks
  app.json
  package.json
