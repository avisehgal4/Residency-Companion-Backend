const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000', 'https://www.residencycompanion.com'], // Your React app URL
  credentials: true
}));

const razorpay = new Razorpay({
  key_id: 'rzp_live_R5BzPGRnxNfMn6', // Your existing key
  key_secret: 'Y1woUmZcVwJwq8QphKcNfLDm' // Replace with your secret key
});

// Create order endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        specialty: req.body.specialty || 'general',
        userId: req.body.userId
      }
    };
    
    const order = await razorpay.orders.create(options);
    res.json(order);
    
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment endpoint
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", 'Y1woUmZcVwJwq8QphKcNfLDm') // Replace with your secret key
    .update(sign.toString())
    .digest("hex");
  
  if (razorpay_signature === expectedSign) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.json({ success: false, message: "Payment verification failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});