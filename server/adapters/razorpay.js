/**
 * TAG ZEE — Razorpay Payment Gateway Adapter
 * Handles server-side order generation, payment verification, and webhook signature validation.
 */
const crypto = require('crypto');

class RazorpayAdapter {
  constructor(config = {}) {
    this.keyId = config.keyId || process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = config.keySecret || process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = config.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
  }

  isConfigured() {
    return Boolean(
      this.keyId && 
      this.keySecret && 
      !this.keyId.includes('YourTestKey') && 
      !this.keySecret.includes('YourRazorpaySecret')
    );
  }

  /**
   * Creates an order with Razorpay in minor currency units (paise).
   * 1 INR = 100 paise.
   */
  async createOrder({ amountInInr, receipt, notes = {} }) {
    const amountInPaise = Math.round(amountInInr * 100);

    // If live credentials are not supplied, return an authentic test-order structure
    if (!this.isConfigured()) {
      const mockOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return {
        id: mockOrderId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
        status: 'created',
        notes: {
          brand: 'TAG Zee Moradabad',
          is_mock_order: true,
          ...notes
        },
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    // Call upstream Razorpay API via standard fetch
    const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: {
          brand: 'TAG Zee Moradabad',
          ...notes
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Razorpay Order Creation Failed [${response.status}]: ${errBody}`);
    }

    return await response.json();
  }

  /**
   * Verifies Razorpay payment signature using HMAC SHA256.
   * Signature payload: `${razorpay_order_id}|${razorpay_payment_id}`
   */
  verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { valid: false, reason: 'Missing required signature verification fields' };
    }

    // In test/demo mode without live secret
    if (!this.isConfigured()) {
      const expectedMockSig = crypto
        .createHmac('sha256', 'mock_secret_key')
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      
      const isValid = (razorpay_signature === expectedMockSig) || razorpay_signature.startsWith('mock_sig_');
      return {
        valid: isValid,
        isTestMode: true,
        reason: isValid ? 'Valid test signature' : 'Invalid test signature'
      };
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf8'),
      Buffer.from(razorpay_signature, 'utf8')
    );

    return {
      valid: isValid,
      isTestMode: false,
      reason: isValid ? 'Signature verified successfully' : 'Signature mismatch'
    };
  }

  /**
   * Verifies incoming Razorpay webhook signature.
   */
  verifyWebhookSignature(rawBody, receivedSignature) {
    if (!this.webhookSecret) {
      return { valid: false, reason: 'Webhook secret not configured' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    return {
      valid: expectedSignature === receivedSignature,
      reason: expectedSignature === receivedSignature ? 'Webhook verified' : 'Webhook signature mismatch'
    };
  }
}

module.exports = RazorpayAdapter;
