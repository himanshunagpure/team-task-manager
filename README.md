Features
Authentication
User registration with OTP verification
Login system using JWT authentication
Forgot and reset password functionality
Protected routes for secure access
User System
User profile management
Email verification using OTP
Secure password hashing with bcrypt
Task and Project Management
Create and manage projects
Assign members to projects
Create and manage tasks
Track project progress
Team Collaboration
Send project invitations
Accept or reject invitations
Add members to projects
Security
JWT-based authentication
Protected backend APIs
Input validation
Password encryption
Tech Stack
Frontend
React.js
Axios
React Router DOM
Context API
Backend
Node.js
Express.js
MongoDB with Mongoose
JWT authentication
Nodemailer for OTP system
Project Structure
team-task-manager/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── api/
│
└── README.md
Installation Guide
1. Clone the repository
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
2. Backend setup
cd backend
npm install

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

Run backend server:

npm run dev
3. Frontend setup
cd frontend
npm install
npm start
API Endpoints
Auth Routes
POST /api/auth/register
POST /api/auth/verify
POST /api/auth/login
POST /api/auth/resend-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
Invite Routes
POST /api/invites/send
POST /api/invites/accept
POST /api/invites/reject
How OTP Flow Works
User registers in the system
OTP is generated in the backend
OTP is sent or displayed to the user
User enters OTP for verification
Account gets verified
User can then log in
Invite System Flow
User sends an invitation to another user
Invitation is stored in the database
Receiver accepts or rejects the invite
If accepted, the user is added to the project
Future Improvements
Real-time notifications using Socket.io
Drag and drop task board similar to Trello
Role-based access control (Admin / Member)
Activity logs for tracking actions
File attachments for tasks
Author

Himanshu Nagpure
MERN Stack Developer
