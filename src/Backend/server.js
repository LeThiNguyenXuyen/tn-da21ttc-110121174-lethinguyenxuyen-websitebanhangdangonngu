import express from "express"
import cors from "cors"
import dotenv from 'dotenv';
import 'dotenv/config'

// Load environment variables first
dotenv.config();

// Import other modules after environment variables are loaded
import { connectDB } from "./config/db.js"
import mongoose from "mongoose"
import productRouter from "./routes/productRoutes.js"
import orderRoutes from './routes/orderRoutes.js';
import productAdminRoutes from './routes/productAdminRoutes.js';
import userRouter from "./routes/userRoute.js";
import promotionRouter from './routes/promotionRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import { checkPendingOrders } from './controllers/orderController.js';

import router from "./routes/addressRoute.js";
// app configs
const app = express()
const port = 4000


// middleware
app.use(express.json())
app.use(cors())

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📋 Body:`, JSON.stringify(req.body, null, 2));
  }
  if (req.headers.token) {
    console.log(`🔑 Token:`, req.headers.token.substring(0, 50) + "...");
  }
  next();
});


//db connect
console.log("🚀 Starting server...");
console.log("🔗 Connecting to database...");
connectDB();


// api endpoints

app.use("/api/product",productRouter)
app.use("/uploads", express.static("uploads"));
app.use('/api/orders', orderRoutes);
app.use('/api/admin/products', productAdminRoutes);
app.use('/api/user',userRouter)
app.use('/api/promotions', promotionRouter);
app.use('/api/cart', cartRouter);
app.use("/api/order",orderRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/address", router);

// test route
app.get("/", (req, res) => {
    res.send("API Working")
})

app.use(cors({
  origin: 'http://localhost:3000',  // Đảm bảo frontend có thể truy cập từ localhost:3000
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));


// Test endpoint để lấy dữ liệu thực từ MongoDB (không cần auth)
app.get("/api/test/orders", async (req, res) => {
    try {
        const Order = (await import('./models/Order.js')).default;
        const orders = await Order.find({}).sort({ date: -1 }).limit(10);

        res.json({
            success: true,
            message: "Test data from MongoDB",
            orders: orders,
            count: orders.length,
            debug: {
                databaseName: mongoose.connection.db.databaseName,
                connectionState: mongoose.connection.readyState,
                host: mongoose.connection.host
            }
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Error: " + error.message
        });
    }
})

// Debug endpoint để kiểm tra tất cả collections
app.get("/api/test/debug", async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionData = {};

        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            collectionData[collection.name] = count;
        }

        res.json({
            success: true,
            database: mongoose.connection.db.databaseName,
            host: mongoose.connection.host,
            collections: collectionData
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Error: " + error.message
        });
    }
})

// Background job để check pending orders mỗi 15 phút
setInterval(async () => {
    try {
        console.log("🔄 Running background check for pending orders...");
        await checkPendingOrders();
    } catch (error) {
        console.error("❌ Background job error:", error);
    }
}, 15 * 60 * 1000); // 15 phút

// start server
app.listen(port, () => {
    console.log(`🚀 Server Started on http://localhost:${port}`)
    console.log(`📋 Available endpoints:`)
    console.log(`   - GET  /api/product/list`)
    console.log(`   - GET  /api/test/debug`)
    console.log(`   - GET  /`)
    console.log(`   - POST /api/order/webhook/payos`)
    console.log(`   - POST /api/order/webhook/stripe`)
    console.log(`🔄 Background job: Checking pending orders every 15 minutes`)
})

