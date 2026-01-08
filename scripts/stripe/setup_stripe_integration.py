#!/usr/bin/env python3
"""
Stripe Integration Setup Script for TETRIX & JoRoMi Platform
This script sets up the complete Stripe integration for unified messaging and AI services.
"""

import os
import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List
import stripe
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class StripeIntegrationSetup:
    def __init__(self):
        # Initialize Stripe with API key
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe.api_key:
            raise ValueError("STRIPE_SECRET_KEY not found in environment variables")
        
        self.products = {}
        self.prices = {}
        self.webhook_endpoints = []
    
    async def setup_complete_integration(self):
        """Set up the complete Stripe integration"""
        
        print("🚀 Starting Stripe Integration Setup for TETRIX & JoRoMi Platform")
        print("=" * 70)
        
        try:
            # Step 1: Create products
            print("\n📦 Step 1: Creating products...")
            await self.create_products()
            
            # Step 2: Create pricing tiers
            print("\n💰 Step 2: Creating pricing tiers...")
            await self.create_pricing_tiers()
            
            # Step 3: Set up webhook endpoints
            print("\n🔔 Step 3: Setting up webhook endpoints...")
            await self.setup_webhook_endpoints()
            
            # Step 4: Create customer portal configuration
            print("\n🎛️ Step 4: Setting up customer portal...")
            await self.setup_customer_portal()
            
            # Step 5: Generate configuration files
            print("\n📄 Step 5: Generating configuration files...")
            await self.generate_config_files()
            
            print("\n✅ Stripe integration setup completed successfully!")
            print("\n📋 Next Steps:")
            print("1. Update your environment variables with the generated keys")
            print("2. Deploy the webhook endpoints to your server")
            print("3. Test the integration with the provided test scripts")
            print("4. Configure your frontend to use the customer portal")
            
        except Exception as e:
            print(f"\n❌ Error during setup: {str(e)}")
            raise
    
    async def create_products(self):
        """Create all products for the platform"""
        
        products_config = {
            "voice_calls": {
                "name": "Voice Calls",
                "description": "Voice calling service with global coverage via Telnyx/Vonage",
                "metadata": {
                    "service_type": "voice",
                    "category": "communication",
                    "provider": "telnyx_vonage"
                }
            },
            "sms_messaging": {
                "name": "SMS Messaging",
                "description": "SMS messaging service with delivery tracking and analytics",
                "metadata": {
                    "service_type": "sms",
                    "category": "communication",
                    "provider": "telnyx_vonage"
                }
            },
            "twofa_services": {
                "name": "2FA Services",
                "description": "Two-factor authentication via SMS and voice calls",
                "metadata": {
                    "service_type": "2fa",
                    "category": "security",
                    "provider": "telnyx"
                }
            },
            "ai_workflow": {
                "name": "AI Workflow Integration",
                "description": "AI-powered automation and workflow integration services",
                "metadata": {
                    "service_type": "ai",
                    "category": "automation",
                    "provider": "tetrix"
                }
            },
            "data_labeling": {
                "name": "Data Labeling & Annotation",
                "description": "Human-in-the-loop data annotation and quality assurance",
                "metadata": {
                    "service_type": "data_labeling",
                    "category": "ai_services",
                    "provider": "tetrix"
                }
            }
        }
        
        for product_key, config in products_config.items():
            try:
                product = stripe.Product.create(
                    name=config["name"],
                    description=config["description"],
                    metadata=config["metadata"]
                )
                
                self.products[product_key] = product
                print(f"  ✅ Created product: {config['name']} (ID: {product.id})")
                
            except stripe.error.StripeError as e:
                print(f"  ❌ Error creating product {config['name']}: {str(e)}")
                raise
    
    async def create_pricing_tiers(self):
        """Create pricing tiers for all plans"""
        
        plans = {
            "starter": {
                "name": "Starter Plan",
                "base_price": 9900,  # $99.00
                "included_usage": {
                    "voice": 1000,  # 1000 minutes
                    "sms": 1000,    # 1000 messages
                    "2fa": 500      # 500 attempts
                },
                "overage_rates": {
                    "voice": 1500,  # $0.015 per minute
                    "sms": 80,      # $0.008 per SMS
                    "2fa": 500      # $0.05 per attempt
                }
            },
            "professional": {
                "name": "Professional Plan",
                "base_price": 29900,  # $299.00
                "included_usage": {
                    "voice": 5000,  # 5000 minutes
                    "sms": 5000,    # 5000 messages
                    "2fa": 2500     # 2500 attempts
                },
                "overage_rates": {
                    "voice": 1200,  # $0.012 per minute
                    "sms": 70,      # $0.007 per SMS
                    "2fa": 400      # $0.04 per attempt
                }
            },
            "enterprise": {
                "name": "Enterprise Plan",
                "base_price": 79900,  # $799.00
                "included_usage": {
                    "voice": 15000,  # 15000 minutes
                    "sms": 15000,    # 15000 messages
                    "2fa": 7500      # 7500 attempts
                },
                "overage_rates": {
                    "voice": 1000,  # $0.010 per minute
                    "sms": 60,      # $0.006 per SMS
                    "2fa": 350      # $0.035 per attempt
                }
            }
        }
        
        for plan_key, plan_config in plans.items():
            print(f"\n  📊 Creating pricing for {plan_config['name']}...")
            
            # Create base subscription price
            base_price = stripe.Price.create(
                product=self.products["ai_workflow"]["id"],
                unit_amount=plan_config["base_price"],
                currency="usd",
                recurring={"interval": "month"},
                metadata={
                    "plan": plan_key,
                    "type": "base_subscription"
                }
            )
            
            self.prices[f"{plan_key}_base"] = base_price
            print(f"    ✅ Base subscription: ${plan_config['base_price']/100:.2f}/month")
            
            # Create usage-based pricing for each service
            for service_key, included_usage in plan_config["included_usage"].items():
                overage_rate = plan_config["overage_rates"][service_key]
                
                # Create tiered pricing
                tiers = [
                    {
                        "up_to": included_usage,
                        "unit_amount": 0,  # Included
                        "flat_amount": 0
                    },
                    {
                        "up_to": "inf",
                        "unit_amount": overage_rate,
                        "flat_amount": 0
                    }
                ]
                
                price = stripe.Price.create(
                    product=self.products[f"{service_key}_calls" if service_key == "voice" else f"{service_key}_messaging" if service_key == "sms" else f"twofa_services"]["id"],
                    unit_amount=overage_rate,
                    currency="usd",
                    billing_scheme="tiered",
                    tiers=tiers,
                    metadata={
                        "plan": plan_key,
                        "service": service_key,
                        "included_usage": included_usage
                    }
                )
                
                self.prices[f"{plan_key}_{service_key}"] = price
                print(f"    ✅ {service_key.title()}: {included_usage} included, ${overage_rate/100:.3f} overage")
    
    async def setup_webhook_endpoints(self):
        """Set up webhook endpoints for real-time processing"""
        
        webhook_url = os.getenv("WEBHOOK_BASE_URL", "https://api.tetrixcorp.com")
        
        webhook_events = [
            "invoice.payment_succeeded",
            "invoice.payment_failed",
            "customer.subscription.created",
            "customer.subscription.updated",
            "customer.subscription.deleted",
            "customer.subscription.trial_will_end",
            "invoice.upcoming",
            "customer.created",
            "customer.updated",
            "payment_method.attached",
            "payment_method.detached"
        ]
        
        try:
            webhook_endpoint = stripe.WebhookEndpoint.create(
                url=f"{webhook_url}/webhooks/stripe",
                enabled_events=webhook_events,
                metadata={
                    "platform": "tetrix_joromi",
                    "environment": os.getenv("ENVIRONMENT", "production")
                }
            )
            
            self.webhook_endpoints.append(webhook_endpoint)
            print(f"  ✅ Created webhook endpoint: {webhook_endpoint.url}")
            print(f"  🔑 Webhook secret: {webhook_endpoint.secret}")
            
        except stripe.error.StripeError as e:
            print(f"  ❌ Error creating webhook endpoint: {str(e)}")
            raise
    
    async def setup_customer_portal(self):
        """Set up customer portal configuration"""
        
        try:
            # Create billing portal configuration
            portal_config = stripe.billing_portal.Configuration.create(
                business_profile={
                    "headline": "TETRIX & JoRoMi Platform - AI Services"
                },
                features={
                    "payment_method_update": {"enabled": True},
                    "subscription_update": {
                        "enabled": True,
                        "default_allowed_updates": ["price", "quantity"],
                        "proration_behavior": "create_prorations"
                    },
                    "subscription_cancel": {
                        "enabled": True,
                        "cancellation_reason": {
                            "enabled": True,
                            "options": [
                                "too_expensive",
                                "missing_features",
                                "switched_service",
                                "unused",
                                "other"
                            ]
                        }
                    },
                    "invoice_history": {"enabled": True}
                }
            )
            
            print(f"  ✅ Created customer portal configuration: {portal_config.id}")
            
        except stripe.error.StripeError as e:
            print(f"  ❌ Error creating customer portal: {str(e)}")
            raise
    
    async def generate_config_files(self):
        """Generate configuration files for the integration"""
        
        # Generate environment variables file
        env_config = {
            "STRIPE_PUBLISHABLE_KEY": os.getenv("STRIPE_PUBLISHABLE_KEY", "pk_test_..."),
            "STRIPE_SECRET_KEY": os.getenv("STRIPE_SECRET_KEY", "sk_test_..."),
            "STRIPE_WEBHOOK_SECRET": self.webhook_endpoints[0].secret if self.webhook_endpoints else "whsec_...",
            "STRIPE_CUSTOMER_PORTAL_ID": "bpc_...",  # This would be retrieved from the portal config
        }
        
        with open("stripe_config.env", "w") as f:
            f.write("# Stripe Configuration for TETRIX & JoRoMi Platform\n")
            f.write("# Generated on {}\n\n".format(datetime.now().isoformat()))
            for key, value in env_config.items():
                f.write(f"{key}={value}\n")
        
        print("  ✅ Generated stripe_config.env")
        
        # Generate products and prices mapping
        products_mapping = {}
        for product_key, product in self.products.items():
            products_mapping[product_key] = {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "metadata": product.metadata
            }
        
        prices_mapping = {}
        for price_key, price in self.prices.items():
            prices_mapping[price_key] = {
                "id": price.id,
                "product_id": price.product,
                "unit_amount": price.unit_amount,
                "currency": price.currency,
                "billing_scheme": price.billing_scheme,
                "metadata": price.metadata
            }
        
        config_data = {
            "products": products_mapping,
            "prices": prices_mapping,
            "webhook_endpoints": [
                {
                    "id": endpoint.id,
                    "url": endpoint.url,
                    "secret": endpoint.secret
                } for endpoint in self.webhook_endpoints
            ],
            "generated_at": datetime.now().isoformat()
        }
        
        with open("stripe_integration_config.json", "w") as f:
            json.dump(config_data, f, indent=2)
        
        print("  ✅ Generated stripe_integration_config.json")
        
        # Generate usage tracking configuration
        usage_config = {
            "services": {
                "voice": {
                    "unit": "minutes",
                    "conversion_factor": 1,  # 1 minute = 1 unit
                    "tracking_events": ["call_started", "call_ended"]
                },
                "sms": {
                    "unit": "messages",
                    "conversion_factor": 1,  # 1 message = 1 unit
                    "tracking_events": ["sms_sent", "sms_delivered"]
                },
                "2fa": {
                    "unit": "attempts",
                    "conversion_factor": 1,  # 1 attempt = 1 unit
                    "tracking_events": ["2fa_initiated", "2fa_completed"]
                }
            },
            "billing_cycles": {
                "monthly": {
                    "interval": "month",
                    "interval_count": 1
                }
            }
        }
        
        with open("usage_tracking_config.json", "w") as f:
            json.dump(usage_config, f, indent=2)
        
        print("  ✅ Generated usage_tracking_config.json")

async def main():
    """Main function to run the setup"""
    
    # Check for required environment variables
    required_vars = ["STRIPE_SECRET_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these variables in your .env file or environment")
        return
    
    # Initialize and run setup
    setup = StripeIntegrationSetup()
    await setup.setup_complete_integration()

if __name__ == "__main__":
    asyncio.run(main())
