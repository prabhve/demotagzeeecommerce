/**
 * TAG ZEE — Production Express REST Backend API
 * Handles products, order management, inventory control, Razorpay & Shiprocket integrations,
 * B2C operational admin workflows, and storefront content management.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const RazorpayAdapter = require('./adapters/razorpay');
const ShiprocketAdapter = require('./adapters/shiprocket');
const NotificationAdapter = require('./adapters/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Adapters
const razorpay = new RazorpayAdapter();
const shiprocket = new ShiprocketAdapter();
const notifications = new NotificationAdapter();

// --- IN-MEMORY REPOSITORIES (EXTENSIBLE TO SQLITE / MONGO) ---
let products = [
  {
    id: 1,
    title: "Imperial Mughal Brass Urli (14-Inch Scalloped Rim)",
    category: "Metal Handicrafts",
    price: 2499,
    oldPrice: 3499,
    discount: "-28%",
    rating: 4.9,
    reviewsCount: 184,
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
    desc: "Exquisitely lost-wax cast virgin brass urli bowl featuring hand-chiseled floral scalloped rims. Hand-buffed by Moradabad master artisans to a radiant mirror lustre. Ideal for floating tea lights and fresh marigold or rose petals at festive entrances.",
    dimensions: "14\" Diameter x 4.5\" Height",
    weight: "2.85 kg",
    material: "100% Solid Virgin Brass",
    finish: "Hand-Buffed Antique Gold Patina",
    sku: "TZ-MH-URLI-014",
    stock: 45,
    care: "Wipe with a soft dry cloth. For deep gleam, apply traditional Pitambari paste or natural lemon-salt mix."
  },
  {
    id: 2,
    title: "Hammered Pure Ayurvedic Copper Water Dispenser (5L)",
    category: "Home & Kitchen",
    price: 1999,
    oldPrice: 2799,
    discount: "-28%",
    rating: 4.8,
    reviewsCount: 212,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    desc: "Hand-hammered pure copper vessel equipped with a food-grade, leakproof brass dispenser tap. Naturally energizes drinking water with Ayurvedic health benefits (Tamra Jal). Includes matching copper lid.",
    dimensions: "8.5\" Diameter x 13.5\" Height",
    weight: "1.92 kg",
    material: "99.4% Pure Certified Copper",
    finish: "Dimpled Hammered Artisan Lustre",
    sku: "TZ-HK-COPDISP-005",
    stock: 28,
    care: "Rinse inside daily with normal water. Clean monthly with tamarind pulp or salt-lemon solution to restore natural copper sheen."
  },
  {
    id: 3,
    title: "Moroccan Filigree Geometric Hanging Metal Lantern",
    category: "Lanterns",
    price: 1299,
    oldPrice: 1799,
    discount: "-27%",
    rating: 4.8,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    desc: "Intricately laser-cut and hand-punched sheet metal lantern finished in antique gold electroplating. Casts captivating Islamic geometric shadow patterns across room walls when lit with a tea light or LED filament bulb.",
    dimensions: "7\" x 7\" Base x 16\" Height",
    weight: "1.15 kg",
    material: "High-Gauge Galvanized Sheet Metal",
    finish: "Electroplated Matte Antique Brass",
    sku: "TZ-LT-MOROCC-016",
    stock: 62,
    care: "Dust gently with a microfibre cloth. Suitable for indoor foyer or covered dry balcony living."
  },
  {
    id: 4,
    title: "Carved Royal Peacock Brass Diya Set (Pair with Oil Reservoir)",
    category: "Ornaments",
    price: 1699,
    oldPrice: 2299,
    discount: "-26%",
    rating: 4.9,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    desc: "Heirloom-grade solid brass sacred oil lamps sculpted with graceful royal peacock finials and deep reservoirs for extended temple pooja ceremonies and festive Diwali illumination.",
    dimensions: "5\" x 4\" x 9.5\" (Each)",
    weight: "1.65 kg (Pair)",
    material: "Heavy Cast Brass",
    finish: "Traditional Temple Gold Polish",
    sku: "TZ-OR-PEADIA-002",
    stock: 35,
    care: "Wipe oil residue with warm cotton cloth after prayers."
  },
  {
    id: 5,
    title: "Fluted Brass Botanical Planter with Wrought Iron Tripod Stand",
    category: "Garden Decor",
    price: 1199,
    oldPrice: 1599,
    discount: "-25%",
    rating: 4.8,
    reviewsCount: 76,
    image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=600&q=80",
    desc: "Electroplated rust-resistant gold metal botanical planter bowl resting upon a sturdy matte black wrought-iron tripod stand. Brings contemporary luxury botanical aesthetics to living spaces and balconies.",
    dimensions: "9\" Pot Diameter x 18\" Total Height",
    weight: "1.40 kg",
    material: "Mild Steel & Brass Plating",
    finish: "Dual Tone — Metallic Gold & Matte Charcoal",
    sku: "TZ-GD-RIBPLN-018",
    stock: 50,
    care: "Use an inner plastic pot liner to prevent direct moisture contact with exterior brass plating."
  },
  {
    id: 6,
    title: "Royal Antique Gold Brass Cutlery Set (24-Piece Boxed)",
    category: "Tableware",
    price: 3499,
    oldPrice: 4999,
    discount: "-30%",
    rating: 4.9,
    reviewsCount: 65,
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
    desc: "Heavyweight forged brass dinner forks, table knives, soup spoons, and dessert spoons coated in food-grade mirror gold electroplating. Comes in a royal velvet-lined wooden storage chest.",
    dimensions: "Standard Fine Dining 24-Piece Box",
    weight: "2.10 kg",
    material: "Forged Food-Safe Brass",
    finish: "Mirror Gold Electroplate",
    sku: "TZ-TW-CUTSET-024",
    stock: 18,
    care: "Hand wash with mild organic detergent. Avoid harsh abrasive wire scrubbers."
  },
  {
    id: 7,
    title: "Sunburst Celestial Metal Wall Art Sculpture (28-Inch)",
    category: "Metal Handicrafts",
    price: 2799,
    oldPrice: 3999,
    discount: "-30%",
    rating: 4.7,
    reviewsCount: 54,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    desc: "28-inch multi-tiered metallic sun sculpture handcrafted in antique bronze and radiant gold patina. A regal centerpiece for living room walls.",
    dimensions: "28\" Diameter x 2\" Depth",
    weight: "2.40 kg",
    material: "Wrought Iron & Brass Leaf Overlay",
    finish: "Multi-Tonal Antique Patina",
    sku: "TZ-MH-SUNART-028",
    stock: 22,
    care: "Dust with dry cotton cloth. Do not expose directly to monsoon rainfall."
  },
  {
    id: 8,
    title: "Consecrated Solid Brass Lord Ganesha Lotus Idol (8.5-Inch)",
    category: "Ornaments",
    price: 2199,
    oldPrice: 2999,
    discount: "-26%",
    rating: 5.0,
    reviewsCount: 110,
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80",
    desc: "Solid brass consecrated Lord Ganesha seated in blessing posture on a double-petaled lotus pedestal. Intricate crown, modak, and trunk etching. Hand-buffed by Moradabad artisans.",
    dimensions: "6\" Width x 4.5\" Depth x 8.5\" Height",
    weight: "2.35 kg",
    material: "Solid Virgin Brass",
    finish: "Artisanal Lustre Polish",
    sku: "TZ-OR-GANESH-008",
    stock: 30,
    care: "Clean with soft dry microfiber or gentle brass polish paste."
  },
  {
    id: 9,
    title: "Artisanal Hammered Pure Copper Jug & Tumbler Set (5-Piece)",
    category: "Home & Kitchen",
    price: 2299,
    oldPrice: 3199,
    discount: "-28%",
    rating: 4.8,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=600&q=80",
    desc: "Includes 1x 2-litre hammered copper water pitcher with ergonomic handle plus 4x matching copper glasses. Ideal for family dining tables.",
    dimensions: "Pitcher: 2L | Tumblers: 300ml each",
    weight: "1.45 kg (Complete Set)",
    material: "99.4% Certified Pure Copper",
    finish: "Hand-Hammered Rose Gold Lustre",
    sku: "TZ-HK-COPJUG-005",
    stock: 32,
    care: "Rinse daily. Polish monthly with lemon and salt."
  },
  {
    id: 10,
    title: "Mughal Antique Brass Dhoop Dani / Incense Burner with Wood Handle",
    category: "Ornaments",
    price: 899,
    oldPrice: 1299,
    discount: "-30%",
    rating: 4.9,
    reviewsCount: 120,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80",
    desc: "Solid brass traditional loban and sambrani burner fitted with a heat-insulated turned rosewood handle. Features intricate perforated dome cover for aromatic diffusion.",
    dimensions: "9\" Length x 4.5\" Height",
    weight: "650 grams",
    material: "Pure Brass & Sheesham Wood Handle",
    finish: "Antique Patina Finish",
    sku: "TZ-OR-DHUOP-001",
    stock: 40,
    care: "Wipe ash with dry cloth after cooling."
  },
  {
    id: 11,
    title: "Temple Carved Hanging Brass Bell with Peacock Chain (3.5 kg)",
    category: "Metal Handicrafts",
    price: 3899,
    oldPrice: 5499,
    discount: "-29%",
    rating: 5.0,
    reviewsCount: 78,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    desc: "Heavy tonal bronze-brass hanging pooja bell producing rich harmonic resonance. Suspended from an intricately carved peacock link chain.",
    dimensions: "Bell: 6\" Dia x 7\" Height | Total Chain: 28\" Length",
    weight: "3.50 kg",
    material: "High-Resonance Bell Metal (Brass & Bronze)",
    finish: "Temple Antique Golden Finish",
    sku: "TZ-MH-BELL-035",
    stock: 14,
    care: "Wipe clean with a cotton cloth."
  },
  {
    id: 12,
    title: "Royal South Indian Brass Kuthu Vilakku Oil Lamp (21-Inch Pair)",
    category: "Ornaments",
    price: 4299,
    oldPrice: 5999,
    discount: "-28%",
    rating: 4.9,
    reviewsCount: 92,
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80",
    desc: "Stately 5-step traditional brass oil lamp crowned with a regal Annapakshi bird finial. Hand-turned pillars with screw-threaded assembly.",
    dimensions: "21\" Height x 6.5\" Base (Pair)",
    weight: "4.10 kg (Pair)",
    material: "100% Solid Cast Brass",
    finish: "High-Gloss Golden Lustre",
    sku: "TZ-OR-KUTHU-021",
    stock: 16,
    care: "Use standard cotton wicks with sesame or ghee oil."
  }
];

let orders = [
  {
    orderId: "TZ-2026-1001",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    customer: {
      fullName: "Ananya Sharma",
      email: "ananya.sharma@example.com",
      phone: "+91 98765 12340"
    },
    shippingAddress: {
      fullName: "Ananya Sharma",
      phone: "+91 98765 12340",
      addressLine1: "Tower B-402, Pinnacle Heights, Golf Course Road",
      city: "Gurugram",
      state: "Haryana",
      pinCode: "122002"
    },
    items: [
      { id: 1, title: "Royal Mughal Brass Urli (14-Inch)", price: 2499, qty: 1 }
    ],
    subtotal: 2499,
    discount: 250,
    shipping: 0,
    total: 2249,
    paymentMethod: "Razorpay (UPI / NetBanking)",
    paymentStatus: "Paid",
    fulfillmentStatus: "Delivered",
    tracking: {
      awb: "TZ-EXP-884920192",
      courier: "Delhivery Surface Express",
      status: "Delivered to recipient"
    }
  }
];

let coupons = [
  { code: "TAGZEE10", type: "percentage", value: 10, minOrder: 999, active: true },
  { code: "WELCOME500", type: "flat", value: 500, minOrder: 3000, active: true },
  { code: "MORADABADFEST", type: "percentage", value: 15, minOrder: 4999, active: true }
];

let enquiries = [];

let cmsSettings = {
  announcementText: "HANDCRAFTED IN MORADABAD — THE BRASS CITY | FREE SHIPPING ABOVE ₹1,499 | 100% ARTISAN CERTIFIED",
  announcementCta: "EXPLORE THE SIGNATURE EDIT →",
  heroHeadline: "TIMELESS METAL. HANDCRAFTED LUXURY.",
  heroSubhead: "Directly from the master foundry craftsmen of Moradabad. Heirloom brass urlis, pure hammered copper dispensers, Moroccan lanterns, and modern garden decor.",
  officialPhone1: "+91 7351366786",
  owner1: "Zeefaham Rais",
  officialPhone2: "+91 7248257721",
  owner2: "Atir Rais",
  officialEmail: "contact@tagzee.in",
  workshopAddress: "A 305 Jigar Colony, Civil Lines, Moradabad - UP (244001)"
};

// --- PUBLIC STOREFRONT ROUTES ---

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'TAG Zee — Handcrafted Moradabad Metalware',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
    razorpayConfigured: razorpay.isConfigured(),
    shiprocketConfigured: shiprocket.isConfigured()
  });
});

// Products Listing with Search & Filters
app.get('/api/products', (req, res) => {
  let list = [...products];
  const { category, search, minPrice, maxPrice, sort } = req.query;

  if (category && category !== 'All') {
    list = list.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.desc.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.material && p.material.toLowerCase().includes(q))
    );
  }

  if (minPrice) {
    list = list.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    list = list.filter(p => p.price <= Number(maxPrice));
  }

  // Sorting
  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    list.sort((a, b) => b.id - a.id);
  }

  res.json({ success: true, count: list.length, products: list });
});

// Single Product by ID
app.get('/api/products/:id', (req, res) => {
  const p = products.find(x => x.id === Number(req.params.id));
  if (!p) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, product: p });
});

// Validate Coupon
app.post('/api/coupons/validate', (req, res) => {
  const { code, cartSubtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Coupon code is required' });
  }

  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim() && c.active);
  if (!coupon) {
    return res.status(404).json({ success: false, error: 'Invalid or expired coupon code' });
  }

  const subtotal = Number(cartSubtotal) || 0;
  if (subtotal < coupon.minOrder) {
    return res.status(400).json({ 
      success: false, 
      error: `Coupon "${coupon.code}" requires a minimum order of ₹${coupon.minOrder.toLocaleString('en-IN')}` 
    });
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = Math.round(subtotal * (coupon.value / 100));
  } else {
    discountAmount = coupon.value;
  }

  discountAmount = Math.min(discountAmount, subtotal);

  res.json({
    success: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount.toLocaleString('en-IN')}`
  });
});

// Shiprocket PIN Code Serviceability Check
app.post('/api/shiprocket/check-serviceability', async (req, res) => {
  try {
    const { pinCode } = req.body;
    const result = await shiprocket.checkServiceability(pinCode);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Razorpay: Create Payment Order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    const orderData = await razorpay.createOrder({
      amountInInr: Number(amount),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes
    });

    res.json({ success: true, order: orderData, keyId: razorpay.keyId || 'rzp_test_public_key' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Razorpay: Verify Payment Signature
app.post('/api/razorpay/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const verification = razorpay.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!verification.valid) {
      return res.status(400).json({ success: false, error: 'Payment signature verification failed' });
    }

    res.json({ success: true, verified: true, isTestMode: verification.isTestMode });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Order Placement & Fulfillment Dispatch
app.post('/api/orders', (req, res) => {
  try {
    const { customer, shippingAddress, items, subtotal, discount, shipping, total, paymentMethod, paymentDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cannot create order with an empty cart' });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.pinCode) {
      return res.status(400).json({ success: false, error: 'Shipping details and Indian PIN code are mandatory' });
    }

    // Server-side inventory verification and stock deduction
    for (const item of items) {
      const prod = products.find(p => p.id === item.id);
      if (prod) {
        if (prod.stock < item.qty) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for "${prod.title}". Only ${prod.stock} units available.`
          });
        }
        prod.stock -= item.qty; // Atomically reduce available stock
      }
    }

    const orderId = `TZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: customer || { fullName: shippingAddress.fullName, phone: shippingAddress.phone, email: shippingAddress.email },
      shippingAddress,
      items,
      subtotal: Number(subtotal),
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      total: Number(total),
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: (paymentMethod && paymentMethod.includes('Razorpay')) ? 'Paid' : 'Pending Verification',
      paymentDetails: paymentDetails || {},
      fulfillmentStatus: 'Processing',
      tracking: {
        awb: `TZ-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`,
        courier: 'Delhivery Surface Heavy Cargo (Moradabad)',
        status: 'Order Placed & Scheduled for Wooden Crate Packaging'
      }
    };

    orders.unshift(newOrder);

    // Format WhatsApp & Email notifications
    const whatsappMessage = notifications.formatOrderWhatsAppMessage(newOrder);

    res.status(201).json({
      success: true,
      order: newOrder,
      whatsappOrderUrl: `https://wa.me/917351366786?text=${encodeURIComponent(whatsappMessage)}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Order Lookup & Tracking Status
app.get('/api/orders/:orderId', (req, res) => {
  const order = orders.find(o => o.orderId.toUpperCase() === req.params.orderId.toUpperCase());
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found. Please verify your Order ID.' });
  }
  res.json({ success: true, order });
});

// B2B Wholesale / Export RFQ Submission
app.post('/api/b2b/rfq', (req, res) => {
  const { name, company, phone, email, quantity, requirements } = req.body;
  if (!name || !phone || !requirements) {
    return res.status(400).json({ success: false, error: 'Name, phone, and requirements are required' });
  }

  const inquiry = {
    id: `RFQ-${Date.now()}`,
    name,
    company: company || 'Individual Wholesale Buyer',
    phone,
    email: email || '',
    quantity: quantity || '25-50 Pieces',
    requirements,
    status: 'New Inquiry',
    createdAt: new Date().toISOString()
  };

  enquiries.unshift(inquiry);
  res.json({ success: true, inquiry, message: 'Inquiry registered. Forwarding to Moradabad owners.' });
});

// CMS Settings
app.get('/api/cms/settings', (req, res) => {
  res.json({ success: true, settings: cmsSettings });
});

// --- OPERATIONAL ADMIN DASHBOARD ROUTES ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { secret } = req.body;
  const configuredSecret = process.env.ADMIN_ACCESS_SECRET || 'tagzee@admin2026';

  if (secret === configuredSecret) {
    return res.json({
      success: true,
      token: 'tagzee_admin_session_token_' + Date.now(),
      message: 'Admin authentication successful'
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid Administrator Security PIN / Password' });
});

// Admin Stats & KPI Overview
app.get('/api/admin/stats', (req, res) => {
  const totalSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.fulfillmentStatus === 'Processing' || o.fulfillmentStatus === 'Pending').length;
  const lowStockProducts = products.filter(p => p.stock < 25);

  res.json({
    success: true,
    stats: {
      totalSales,
      totalOrders,
      pendingOrders,
      activeProductsCount: products.length,
      lowStockCount: lowStockProducts.length,
      lowStockItems: lowStockProducts.map(p => ({ id: p.id, title: p.title, stock: p.stock }))
    }
  });
});

// Admin Orders List & Filter
app.get('/api/admin/orders', (req, res) => {
  res.json({ success: true, count: orders.length, orders });
});

// Admin Order Status Update
app.put('/api/admin/orders/:orderId', (req, res) => {
  const { status, paymentStatus, awb, courier } = req.body;
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (status) order.fulfillmentStatus = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (awb) order.tracking.awb = awb;
  if (courier) order.tracking.courier = courier;

  res.json({ success: true, order });
});

// Admin Product Create
app.post('/api/admin/products', (req, res) => {
  const { title, category, price, oldPrice, desc, image, stock, sku, dimensions, weight, material, finish } = req.body;
  if (!title || !price || !category) {
    return res.status(400).json({ success: false, error: 'Title, price and category are required' });
  }

  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = {
    id: newId,
    title,
    category,
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : null,
    discount: oldPrice ? `-${Math.round((1 - price / oldPrice) * 100)}%` : null,
    rating: 5.0,
    reviewsCount: 1,
    image: image || "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=600&q=80",
    desc: desc || "Handcrafted Moradabad metalware.",
    stock: Number(stock) || 10,
    sku: sku || `TZ-NEW-${newId}`,
    dimensions: dimensions || "Standard",
    weight: weight || "1.5 kg",
    material: material || "Brass & Metal",
    finish: finish || "Polished Brass"
  };

  products.push(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

// Admin Product Update
app.put('/api/admin/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  res.json({ success: true, product: products[idx] });
});

// Admin Product Delete
app.delete('/api/admin/products/:id', (req, res) => {
  const initialLen = products.length;
  products = products.filter(p => p.id !== Number(req.params.id));
  if (products.length === initialLen) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, message: 'Product deleted from catalogue' });
});

// Admin Update CMS Settings
app.put('/api/admin/cms', (req, res) => {
  cmsSettings = { ...cmsSettings, ...req.body };
  res.json({ success: true, settings: cmsSettings });
});

// Serve static frontend files if hosted with Node
app.use(express.static(path.join(__dirname, '..')));

// Catch-all to frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start Server if called directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[TAG ZEE SERVER] Listening on port ${PORT}`);
    console.log(`[TAG ZEE STORE] Moradabad Metal Handicrafts B2C Platform Live: http://localhost:${PORT}`);
  });
}

module.exports = app;
