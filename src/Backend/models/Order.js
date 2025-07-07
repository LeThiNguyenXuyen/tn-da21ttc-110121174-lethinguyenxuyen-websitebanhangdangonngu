import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    status:{type:String,default:"Pending"},
    payment:{type:String,default:"Stripe"},
    date:{type:Date,default:Date.now},
    address:{type:Object,required:true},
    orderCode:{type:Number}, // PayOS orderCode

    // Thông tin hoàn tiền
    refund: {
        amount: {type: Number},
        currency: {type: String, default: "VND"},
        status: {type: String}, // processing, completed, failed
        estimatedTime: {type: String},
        refundId: {type: String}, // Stripe refund ID
        refundedAt: {type: Date}
    },

    // Thông tin hủy đơn
    cancelledAt: {type: Date},
    cancelReason: {type: String}
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
