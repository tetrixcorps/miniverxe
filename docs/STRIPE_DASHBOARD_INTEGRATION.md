# 🚀 Stripe Dashboard Integration Guide

## **📋 Overview**

This implementation provides comprehensive Stripe Checkout integration for the healthcare, construction, and logistics dashboards with 7-day free trials requiring payment method upfront. The solution follows Stripe's best practices for embedded checkout and trial management.

---

## **🏗️ Architecture**

### **Core Components**

1. **StripeCheckoutService** (`src/services/stripeCheckoutService.ts`)
   - Handles checkout session creation
   - Manages trial conversions
   - Customer management

2. **StripeCheckoutModal** (`src/components/stripe/StripeCheckoutModal.astro`)
   - Embedded checkout interface
   - User information collection
   - Trial information display

3. **PricingCard** (`src/components/stripe/PricingCard.astro`)
   - Dashboard pricing display
   - Trial button integration
   - Service-specific styling

4. **API Endpoints**
   - `/api/stripe/create-checkout-session` - Creates checkout sessions
   - `/api/stripe/webhook` - Handles Stripe webhooks

5. **Price Mapping** (`src/config/stripePriceMapping.ts`)
   - Service-specific pricing configuration
   - Trial eligibility management
   - Feature mapping

---

## **💳 Implementation Details**

### **1. 7-Day Free Trial with Card-on-File**

```typescript
// Create checkout session with trial
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: customer.id,
  line_items: [{ price: config.priceId, quantity: 1 }],
  subscription_data: {
    trial_period_days: 7,
    metadata: { trialUser: 'true' }
  },
  payment_method_collection: 'always', // Require payment method upfront
  success_url: config.successUrl,
  cancel_url: config.cancelUrl
});
```

### **2. Dashboard Integration**

Each dashboard (healthcare, construction, logistics) includes:

- **Pricing Section**: 4-tier pricing cards with trial options
- **Trial Information**: Clear explanation of trial terms
- **Checkout Modal**: Embedded Stripe checkout interface
- **Service-Specific Styling**: Color-coded by industry

### **3. Webhook Handling**

The webhook system handles:

- `checkout.session.completed` - Trial activation
- `customer.subscription.trial_will_end` - Trial ending notifications
- `customer.subscription.updated` - Trial to paid conversion
- `invoice.payment_succeeded` - Payment confirmations
- `invoice.payment_failed` - Payment failure handling

---

## **🎯 Service-Specific Pricing**

### **Healthcare Plans**
- **Individual Practice**: $150/provider/month
- **Small Practice**: $200 base + $100/provider
- **Professional**: $500 base + $75/provider
- **Enterprise**: $2,000 base + $50/provider

### **Construction Plans**
- **Individual Contractor**: $150/contractor/month
- **Small Construction**: $200 base + $100/contractor
- **Professional Construction**: $500 base + $75/contractor
- **Enterprise Construction**: $2,000 base + $50/contractor

### **Logistics Plans**
- **Individual Fleet**: $150/vehicle/month
- **Small Fleet**: $200 base + $100/vehicle
- **Professional Fleet**: $500 base + $75/vehicle
- **Enterprise Fleet**: $2,000 base + $50/vehicle

---

## **🔧 Setup Instructions**

### **1. Environment Variables**

```bash
# Required Stripe configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_TRIAL_PRICE_ID=price_trial_7day
```

### **2. Stripe Dashboard Setup**

1. **Create Products and Prices**:
   ```bash
   # Healthcare Individual
   stripe products create --name "Healthcare Individual Practice"
   stripe prices create --product prod_xxx --unit-amount 15000 --currency usd --recurring interval=month
   
   # Construction Individual
   stripe products create --name "Construction Individual Contractor"
   stripe prices create --product prod_xxx --unit-amount 15000 --currency usd --recurring interval=month
   
   # Logistics Individual
   stripe products create --name "Logistics Individual Fleet"
   stripe prices create --product prod_xxx --unit-amount 15000 --currency usd --recurring interval=month
   ```

2. **Configure Webhooks**:
   ```bash
   stripe webhook_endpoints create \
     --url https://tetrixcorp.com/api/stripe/webhook \
     --enabled-events checkout.session.completed \
     --enabled-events customer.subscription.trial_will_end \
     --enabled-events customer.subscription.updated \
     --enabled-events invoice.payment_succeeded \
     --enabled-events invoice.payment_failed
   ```

### **3. Update Price IDs**

Update the price IDs in `src/config/stripePriceMapping.ts` with your actual Stripe price IDs:

```typescript
'price_healthcare_individual': {
  priceId: 'price_1ABC123...', // Your actual Stripe price ID
  // ... rest of configuration
}
```

---

## **🎨 Dashboard Integration**

### **Healthcare Dashboard**
- **URL**: `/dashboards/healthcare`
- **Color Theme**: Green (healthcare)
- **Features**: Patient communication, appointment scheduling, EHR integration

### **Construction Dashboard**
- **URL**: `/dashboards/construction`
- **Color Theme**: Orange (construction)
- **Features**: Project management, safety alerts, resource management

### **Logistics Dashboard**
- **URL**: `/dashboards/logistics`
- **Color Theme**: Blue (logistics)
- **Features**: Fleet tracking, route optimization, delivery management

---

## **🔄 Trial Flow**

### **1. User Journey**
1. User visits dashboard
2. Clicks "Start 7-Day Free Trial"
3. Fills out user information form
4. Redirected to Stripe Checkout
5. Enters payment method (no charge during trial)
6. Trial activated immediately
7. Receives welcome notification

### **2. Trial Management**
- **Trial Duration**: 7 days
- **Payment Method**: Required upfront, no charges
- **Cancellation**: Can cancel anytime during trial
- **Conversion**: Automatic conversion to paid after trial

### **3. Notifications**
- **Trial Start**: Welcome email/SMS
- **Trial Ending**: 3-day advance notice
- **Conversion**: Confirmation of paid subscription
- **Payment Issues**: Failure notifications

---

## **🛡️ Security & Compliance**

### **Security Features**
- Stripe's PCI DSS compliance
- Encrypted payment processing
- Secure webhook verification
- Customer data protection

### **Compliance**
- HIPAA compliance for healthcare
- Industry-specific data handling
- Secure customer information storage
- Audit trail for all transactions

---

## **📊 Monitoring & Analytics**

### **Key Metrics**
- Trial conversion rates
- Payment success rates
- Customer lifetime value
- Churn analysis

### **Stripe Dashboard**
- Real-time transaction monitoring
- Customer management
- Subscription analytics
- Revenue reporting

---

## **🚀 Deployment**

### **1. Build and Deploy**
```bash
# Install dependencies
pnpm install

# Build the application
pnpm build

# Deploy to DigitalOcean
doctl apps create-deployment <app-id>
```

### **2. Webhook Configuration**
Ensure your webhook endpoint is accessible:
- `https://tetrixcorp.com/api/stripe/webhook`
- Configure in Stripe Dashboard
- Test webhook delivery

### **3. Testing**
- Use Stripe test mode for development
- Test trial flows end-to-end
- Verify webhook handling
- Test payment scenarios

---

## **🔧 Troubleshooting**

### **Common Issues**

1. **Checkout Session Creation Fails**
   - Verify Stripe API key
   - Check price ID validity
   - Ensure webhook endpoint is accessible

2. **Trial Not Activating**
   - Check webhook configuration
   - Verify trial eligibility in price mapping
   - Check subscription creation

3. **Payment Method Issues**
   - Ensure `payment_method_collection: 'always'`
   - Check customer creation
   - Verify payment method attachment

### **Debug Tools**
- Stripe Dashboard logs
- Webhook event monitoring
- Console error logging
- Network request inspection

---

## **📈 Future Enhancements**

### **Planned Features**
- Multi-currency support
- Promotional codes
- Usage-based billing
- Advanced analytics
- A/B testing for pricing

### **Integration Opportunities**
- CRM integration
- Email marketing
- Customer support
- Analytics platforms

---

This implementation provides a complete, production-ready Stripe integration for the TETRIX platform dashboards with 7-day free trials and card-on-file requirements, following Stripe's best practices and security standards.
