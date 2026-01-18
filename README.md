# Backend Server - Authentication API

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the `server` directory with the following variables:
   ```env
   MONGO_URI=your_mongodb_compass_connection_string
   JWT_SECRET=your_secret_key_change_this_in_production
   PORT=5000
   NODE_ENV=development
   ```

   **Example MongoDB URI:**
   ```
   mongodb://localhost:27017/auth-app
   ```
   
   Or for MongoDB Atlas:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/auth-app?retryWrites=true&w=majority
   ```

3. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development:
   ```bash
   node server.js
   ```

## API Endpoints

### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

## Project Structure

```
server/
├── controllers/
│   └── authController.js    # Authentication logic
├── models/
│   └── User.js              # User schema and model
├── routes/
│   └── authRoutes.js        # Authentication routes
├── .env                     # Environment variables (create this)
├── server.js                # Express server setup
└── package.json
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
