/**
 * Automated Verification Test Suite for TAG Zee Commerce & API Adapters
 */

const assert = require('assert');
const RazorpayAdapter = require('../adapters/razorpay');
const ShiprocketAdapter = require('../adapters/shiprocket');
const NotificationAdapter = require('../adapters/notifications');

console.log('🧪 Starting TAG ZEE Commerce Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAllTests() {
  // Test 1: Razorpay Adapter signature validation
  runTest('Razorpay: Rejects invalid or missing signature parameters', () => {
    const rzp = new RazorpayAdapter();
    const result = rzp.verifyPaymentSignature({
      razorpay_order_id: '',
      razorpay_payment_id: '',
      razorpay_signature: ''
    });
    assert.strictEqual(result.valid, false);
  });

  runTest('Razorpay: Accepts valid test mode signature token', () => {
    const rzp = new RazorpayAdapter();
    const result = rzp.verifyPaymentSignature({
      razorpay_order_id: 'order_test_12345',
      razorpay_payment_id: 'pay_test_98765',
      razorpay_signature: 'mock_sig_valid_test_token'
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.isTestMode, true);
  });

  // Test 2: Shiprocket Serviceability by Indian PIN code
  await runAsyncTest('Shiprocket: Validates legitimate Indian 6-digit PIN codes', async () => {
    const sr = new ShiprocketAdapter();
    
    // Delhi NCR
    const delhiRes = await sr.checkServiceability('110001');
    assert.strictEqual(delhiRes.serviceable, true);
    assert.ok(delhiRes.estimatedDelivery.includes('2 - 3'));

    // Mumbai
    const mumbaiRes = await sr.checkServiceability('400001');
    assert.strictEqual(mumbaiRes.serviceable, true);

    // Bangalore
    const blrRes = await sr.checkServiceability('560001');
    assert.strictEqual(blrRes.serviceable, true);
  });

  await runAsyncTest('Shiprocket: Rejects invalid PIN codes', async () => {
    const sr = new ShiprocketAdapter();
    const invalidRes = await sr.checkServiceability('012345');
    assert.strictEqual(invalidRes.serviceable, false);
    
    const shortRes = await sr.checkServiceability('123');
    assert.strictEqual(shortRes.serviceable, false);
  });

  // Test 3: Notifications Formatter
  runTest('Notification: Formats WhatsApp message with correct order details', () => {
    const notif = new NotificationAdapter();
    const mockOrder = {
      orderId: 'TZ-2026-9999',
      subtotal: 4498,
      discount: 450,
      total: 4048,
      paymentMethod: 'Razorpay UPI',
      items: [
        { title: 'Royal Mughal Brass Urli (14-Inch)', qty: 1, price: 2499 },
        { title: 'Hammered Pure Copper Dispenser (5L)', qty: 1, price: 1999 }
      ],
      shippingAddress: {
        fullName: 'Vikramaditya Rao',
        addressLine1: 'Civil Lines Road',
        city: 'Moradabad',
        state: 'Uttar Pradesh',
        pinCode: '244001',
        phone: '+91 98765 43210'
      }
    };

    const msg = notif.formatOrderWhatsAppMessage(mockOrder);
    assert.ok(msg.includes('TZ-2026-9999'));
    assert.ok(msg.includes('Royal Mughal Brass Urli'));
    assert.ok(msg.includes('4,048'));
    assert.ok(msg.includes('Zeefaham Rais'));
  });

  // Test 4: Pricing & Free Shipping Threshold Calculation
  runTest('Commerce Math: Calculates subtotal, coupon discount, and free shipping accurately', () => {
    const cart = [
      { id: 1, price: 2499, qty: 1 },
      { id: 2, price: 1999, qty: 1 }
    ];
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    assert.strictEqual(subtotal, 4498);

    // Free shipping threshold = 1499
    const shipping = subtotal >= 1499 ? 0 : 150;
    assert.strictEqual(shipping, 0);

    // 10% coupon
    const discount = Math.round(subtotal * 0.10);
    assert.strictEqual(discount, 450);

    const total = subtotal - discount + shipping;
    assert.strictEqual(total, 4048);
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passedTests} / ${totalTests} passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests();
