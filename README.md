# TAG ZEE — Luxury B2C E-Commerce Platform
### Handcrafted Moradabad Metalware, Brass Decor & Kitchen Heirlooms

Official B2C e-commerce platform for **TAG Zee** (Moradabad — *The Brass City of India / Peetal Nagri*).

* **Live GitHub Pages URL:** [https://prabhve.github.io/demotagzeeecommerce/](https://prabhve.github.io/demotagzeeecommerce/)
* **Official Domain:** [tagzee.in](https://tagzee.in)
* **Founders & Owners:** Zeefaham Rais (+91 7351366786) & Atir Rais (+91 7248257721)
* **Workshop & Office:** A 305 Jigar Colony, Civil Lines, Moradabad - UP (244001)

---

## 🏛️ Brand & Business Profile
TAG Zee specializes in high-quality handcrafted Indian metalcraft:
1. **Metal Handicrafts:** Mughal Brass Urlis, Wall Art Sculptures, Bells, Table Decor.
2. **Home & Kitchen:** Pure Hammered Copper Water Dispensers, Pots, Jugs, Tableware.
3. **Garden Décor:** Fluted Brass Planters, Wrought Iron Tripod Stands, Botanical Bowls.
4. **Ornaments & Sacred Heirlooms:** Sculpted Peacock Diyas, Consecrated Ganesha Idols, Festive Decor.
5. **Architectural Lighting:** Moroccan Filigree Punched Metal Hanging Lanterns.

---

## 💎 Design System & Visual Reference
Built directly according to the provided luxury Shopify-style reference template (**ShopLuxe**):
* **Color Palette:**
  * Warm Ivory: `#F7F4ED`
  * Deep Charcoal: `#20201E`
  * Antique Gold: `#B99652`
  * Clean White: `#FFFFFF`
  * Muted Stone: `#E8E2D7`
  * Soft Grey: `#77736C`
* **Typography:** Editorial Serif (`Cinzel` / `Cormorant Garamond`) paired with modern UI Sans (`Plus Jakarta Sans` / `Inter`).

---

## 🚀 Features & Architecture

### 1. Customer Shopping Experience (B2C)
* **Slim Top Announcement Bar:** Ticker with Moradabad origin and Free Shipping progress.
* **Light-Colored Navigation Header:** Monogram TZ logo, mega-menu, instant search drawer, wishlist count, and live cart total.
* **Spacious Split Hero Banner:** High-converting CTA buttons (*Shop The Collection* & *Explore Categories*), plus 3 trust badges (*Thoughtfully Curated*, *Clear Product Details*, *Order Support*).
* **Browse by Category:** 8 high-res image cards.
* **The Signature Edit (5-Column Grid):** Filter pills, sorting (Featured, Price asc/desc, Rating), live INR pricing, genuine discount badges, wishlist toggle, and quick view.
* **Triple Promotional Panels:** Style Your Space (Charcoal), Thoughtful Gifting (Antique Gold), and New Arrivals (Warm Ivory).
* **Advanced Product Detail Page / Modal (PDP):** Image zoom, specifications (dimensions, weight, virgin brass/copper certification), Indian PIN code delivery checker, quantity selector, and care instructions.
* **Slide-Over Cart Drawer:** Real-time quantity controls, coupon engine (`TAGZEE10`, `WELCOME500`), free shipping progress bar (₹1,499 threshold), and 12% GST itemization.
* **3-Step Express Checkout:** Guest checkout or customer sign-in, Indian delivery address with PIN code validation, Razorpay online payment adapter, and Cash on Delivery.
* **Order Tracking:** 5-stage visual timeline (*Placed* → *Artisan Polishing* → *Wooden Crate Packaging* → *In Transit* → *Delivered*).
* **Customer Account & Wishlist:** Persistent saved items, address book, and order history.
* **Cross-Portal Entry Points:** Secondary footer links for *B2B Trade & Wholesale RFQ* and *Admin Login*.

### 2. B2C Operational Admin Dashboard
Access via footer link or `#admin` (Default PIN: `tagzee@admin2026`):
* **Overview:** Live KPI cards for Total Revenue, Total Orders, Active Catalog Items, Low Stock Warnings.
* **Product Catalog (CRUD):** Add, edit, delete products with custom images, prices, categories, dimensions, and stock.
* **Inventory Control:** Quick stock adjustments (+10, +50, -5) with low stock alerts.
* **Order Fulfillment Queue:** View customer details, update status (*Processing* → *Dispatched* → *Delivered*), and assign AWB tracking numbers.
* **Coupons & Promotions:** Create and manage discount codes.
* **Storefront CMS:** Edit announcement text, hero headlines, and owner contact numbers.
* **Database Backup:** 1-click JSON export/import.

### 3. Server-Side REST API & Adapters (`server/`)
* **Express REST Server (`server/index.js`):** `/api/products`, `/api/orders`, `/api/coupons`, `/api/admin/*`.
* **Razorpay Adapter (`server/adapters/razorpay.js`):** Order creation in paise, HMAC SHA256 signature verification, webhook handler.
* **Shiprocket Adapter (`server/adapters/shiprocket.js`):** Indian PIN code transit time calculator and courier tracking adapter.
* **Notification Adapter (`server/adapters/notifications.js`):** WhatsApp order formatter and HTML email receipts.

---

## 🛠️ Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/prabhve/demotagzeeecommerce.git
cd demotagzeeecommerce

# Install dependencies
npm install

# Run automated tests
npm test

# Start the Express server
npm start
# Server will listen on http://localhost:5000
```

---

## 🔒 Production Credentials Checklist
Before going live in production with real customer payments and couriers:
1. **Razorpay:** Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`.
2. **Shiprocket:** Add `SHIPROCKET_API_EMAIL` and `SHIPROCKET_API_PASSWORD` in `.env`.
3. **WhatsApp Business Cloud:** Configure Meta App Token and Phone ID.
4. **Admin Security:** Change `ADMIN_ACCESS_SECRET` from default to your private password.
