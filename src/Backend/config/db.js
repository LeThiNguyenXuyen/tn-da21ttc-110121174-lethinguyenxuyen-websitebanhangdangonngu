import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        // Connect to MongoDB with modern options
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            socketTimeoutMS: 45000, // 45 second socket timeout
        });

        console.log("✅ DB Connected successfully");
        console.log("🔗 Connected to:", mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

    } catch (error) {
        console.error("❌ DB Connection failed:", error.message);

        if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
            console.log('\n🔧 MongoDB Authentication Error - Possible solutions:');
            console.log('1. ✅ Check your username and password in MongoDB Atlas');
            console.log('2. ✅ Verify your database user has proper permissions (readWrite)');
            console.log('3. ✅ Make sure your IP address is whitelisted (0.0.0.0/0 for all IPs)');
            console.log('4. ✅ Check if your MongoDB Atlas cluster is active and not paused');
            console.log('5. ✅ Verify the database name in your connection string');
        }

        // Don't exit in development, just log the error
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
}