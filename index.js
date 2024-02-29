const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db_config.js');

let app = express();
app.use(express.json()); // Middleware to parse incoming JSON requests

app.get('/',(req, res) => {

    res.send("welcome to my server");
})
// All Users endpoint
app.get('/users', async (req, res) => {
    
    try {
        // Access the database connection from the request object
        let data= await db.find()
         res.send(data)

        res.json(data); // Respond with the list of all users
    } catch (error) {
        console.error("Error during fetching all users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

    
});

// Specific Users endpoint
app.get('/users/:userId', async (req, res) => {
    try {
        const data = await db; // Access the database connection from the request object

        const userId = req.params.userId;

        // Retrieve the specific user from the database based on user ID
        const user = await data.findOne({ _id: userId });

        res.json(user); // Respond with the specific user's profile
    } catch (error) {
        console.error("Error during fetching specific user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    try {
        const data = await db; // Access the database connection from the request object

        // Validate user input
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if the email is already registered
        const existingUser = await data.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a user object with hashed password
        const user = {
            username,
            email,
            password: hashedPassword
        };

        // Insert the user into the database
        await data.insertMany([user]);
       

        res.json({ message: "Signup successful" }); // Respond with success message
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const data = await db; // Access the database connection from the request object

        // Validate user input
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Check if the user with the provided email exists
        const user = await data.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a JWT token for authentication
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

        res.json({ token }); // Respond with the generated JWT token
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Profile endpoint
app.get('/profile', async (req, res) => {
    try {
        const data = await db; // Access the database connection from the request object

        // Get user information from the decoded JWT token
        const userId = req.userId;

        // Retrieve user profile from the database
        const user = await data.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Exclude sensitive information like password before sending the response
        const userProfile = {
            username: user.username,
            email: user.email
            // Add other profile information as needed
        };

        res.json(userProfile); // Respond with the user's profile
    } catch (error) {
        console.error("Error during profile retrieval:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log("Server is running on port", port);
});
