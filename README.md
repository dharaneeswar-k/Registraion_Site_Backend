# 🎯 Webinar Registration Backend (Node.js + MongoDB)

This is the backend server for the **WebNest Technologies Webinar Registration** project. It handles user registration data and payment screenshot uploads using **Node.js**, **Express**, and **MongoDB**.

---

## 📁 Project Structure

```
├── models/             # MongoDB Mongoose schemas
├── routes/             # Express routes (API)
├── uploads/            # Uploaded screenshots
├── .env                # Environment variables (not pushed to GitHub)
├── package.json        # Project metadata & dependencies
├── server.js           # App entry point
```

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/webinar-backend.git
cd webinar-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup `.env` file

Create a `.env` file in the root and add your MongoDB URI:

```
MONGODB_URI=your_mongodb_connection_string
```

### 4. Start the server

```bash
node server.js
```

The server will start at: [http://localhost:5001](http://localhost:5001)

---

## 🔌 API Endpoints

| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| POST   | `/api/registrations`      | Register a new user            |
| POST   | `/api/upload`             | Upload payment screenshot      |

---

## 🧪 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB Atlas**
- **Mongoose**
- **Multer (file upload)**
- **Dotenv**

---

## 🚀 Deployment

This backend is deployed on **Render**. You can deploy your own:

- Build Command: `npm install`
- Start Command: `node server.js`
- Root Directory: `/`
- Environment Variables: Set `MONGODB_URI`

---

## 📸 Screenshot Uploads

All uploaded screenshots will be stored in the `/uploads` folder and served statically.

---

## 🧼 .gitignore Setup

Make sure you don’t upload sensitive files or large folders:

```gitignore
node_modules/
.env
uploads/
```

---

## 👨‍💻 Developed By

**Dharaneeswar K** – Founder @ WebNest Technologies  
[GitHub](https://github.com/dharaneeswar-k) | [Website](https://thewebnest.com) | [Instagram](https://instagram.com/_dharaneesh_07)

---

## 📬 Need Help?

Feel free to raise an issue or contact me via LinkedIn/Instagram if you need any support.