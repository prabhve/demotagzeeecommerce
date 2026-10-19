/**
 * TAG ZEE — Notification Engine Adapter (WhatsApp & Transactional Email)
 * Dispatches customer order confirmations, dispatch alerts, and B2B wholesale quotation notices.
 */

class NotificationAdapter {
  constructor(config = {}) {
    this.whatsappToken = config.whatsappToken || process.env.WHATSAPP_API_TOKEN || '';
    this.whatsappPhoneId = config.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.officialWhatsApp = config.officialWhatsApp || process.env.TAGZEE_OFFICIAL_WHATSAPP || '+917351366786';
    this.emailApiKey = config.emailApiKey || process.env.EMAIL_PROVIDER_API_KEY || '';
    this.emailFrom = config.emailFrom || process.env.EMAIL_FROM_ADDRESS || 'orders@tagzee.in';
  }

  /**
   * Formats a direct WhatsApp notification message for customer orders.
   */
  formatOrderWhatsAppMessage(order) {
    const itemsText = order.items.map(item => `  • ${item.title} (x${item.qty}) — ₹${(item.price * item.qty).toLocaleString('en-IN')}`).join('\n');
    return `*NAMASTE FROM TAG ZEE, MORADABAD!* 🙏✨\n\nYour order *#${order.orderId}* has been confirmed.\n\n*Itemized Order:* \n${itemsText}\n\n*Order Subtotal:* ₹${order.subtotal.toLocaleString('en-IN')}\n*Discount Applied:* -₹${(order.discount || 0).toLocaleString('en-IN')}\n*Final Amount Paid:* *₹${order.total.toLocaleString('en-IN')}* (${order.paymentMethod})\n\n*Shipping Address:*\n${order.shippingAddress.fullName}\n${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}\n${order.shippingAddress.state} - ${order.shippingAddress.pinCode}\n\n*Tracking & Dispatch:*\nOur Moradabad master artisans are carefully preparing and wooden-crating your brass & metalware artifacts.\n\nFor any query, connect with owners:\n• *Zeefaham Rais:* +91 7351366786\n• *Atir Rais:* +91 7248257721\n• Official Website: tagzee.in`;
  }

  /**
   * Formats an HTML email receipt for the customer.
   */
  formatOrderEmailHtml(order) {
    const itemsRows = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #1F2937;">
          <strong>${item.title}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center; font-size: 13px; color: #4B5563;">
          ${item.qty}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right; font-size: 13px; font-weight: 700; color: #111827;">
          ₹${(item.price * item.qty).toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation #${order.orderId} — TAG Zee</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F3EC; margin: 0; padding: 24px;">
        <table align="center" width="100%" max-width="600" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #D4AF37; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color: #0A0E17; padding: 24px; text-align: center;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 24px; letter-spacing: 2px;">TAG ZEE</h1>
              <p style="color: #E5E7EB; margin: 4px 0 0; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Handcrafted Metalware • Moradabad Peetal Nagri</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <h2 style="color: #111827; font-size: 18px; margin-top: 0;">Order Confirmed! #${order.orderId}</h2>
              <p style="color: #4B5563; font-size: 13px; line-height: 1.5;">Dear ${order.shippingAddress.fullName}, thank you for choosing handcrafted metalware from TAG Zee. Our Moradabad artisans have begun packing your order in safety crates.</p>
              
              <table width="100%" style="border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background-color: #F8F9FA;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #374151;">ITEM</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #374151;">QTY</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #374151;">PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <table width="100%" style="margin-top: 12px; font-size: 13px;">
                <tr>
                  <td style="color: #6B7280; padding: 4px 0;">Subtotal</td>
                  <td style="text-align: right; font-weight: 600;">₹${order.subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="color: #6B7280; padding: 4px 0;">Discount</td>
                  <td style="text-align: right; color: #059669; font-weight: 600;">-₹${(order.discount || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="color: #6B7280; padding: 4px 0;">Safe Packaging & Shipping</td>
                  <td style="text-align: right; color: #059669; font-weight: 600;">FREE</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #E5E7EB; font-size: 15px; font-weight: 800; color: #111827;">Total Paid</td>
                  <td style="padding: 8px 0; border-top: 1px solid #E5E7EB; text-align: right; font-size: 16px; font-weight: 900; color: #AA820A;">₹${order.total.toLocaleString('en-IN')}</td>
                </tr>
              </table>

              <div style="background-color: #F9FAFB; border-radius: 10px; padding: 14px; margin-top: 20px; font-size: 12px; color: #4B5563;">
                <strong style="color: #111827;">Shipping Address:</strong><br>
                ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}<br>
                Phone: ${order.shippingAddress.phone}
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; text-align: center;">
                TAG Zee Workshop: A 305 Jigar Colony, Civil Lines, Moradabad - UP (244001)<br>
                Founders: Zeefaham Rais (+91 7351366786) & Atir Rais (+91 7248257721) • tagzee.in
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}

module.exports = NotificationAdapter;
