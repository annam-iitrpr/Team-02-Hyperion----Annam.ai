# AASRA WhatsApp Bot — Meta Cloud API Integration

## Overview
This is the production WhatsApp bot for AASRA that connects directly with farmers via Meta's WhatsApp Cloud API. It handles:

- **Farmer Registration & Onboarding** — Collects name, village, district, crop, field area
- **Biotic Stress Diagnosis** — Gemini 2.5 Flash Vision analyzes leaf photos for diseases/pests
- **Syngenta Product Recommendation** — Maps diagnosed stress to CIB&RC-approved Syngenta products
- **Product Bottle Recognition** — Identifies Syngenta products from bottle photos
- **16L Knapsack Dilution** — Calculates farmer-friendly dosage per 16L pump
- **Closed-Loop Follow-Up** — 5-root-cause failure diagnostic + rotational rescue
- **Sowing Registration** — Records sowing date and activates crop monitoring timeline
- **Bilingual (EN/HI)** — Full Hindi support for all advisory messages

## File Structure
```
whatsapp-bot/
├── src/
│   ├── app/api/meta-whatsapp/webhook/
│   │   └── route.ts          # Main webhook handler (3100+ lines)
│   └── lib/
│       ├── syngentaProductsDB.ts     # 50 Syngenta products with CIB&RC data
│       ├── knapsackPumpMatrix.ts     # 16L/15L/200L dilution calculator
│       └── recommendationEngine.ts   # Product recommendation engine
```

## Key Features
- **Meta Webhook Verification** — SHA256 signature verification on all incoming webhooks
- **Message Deduplication** — Prevents duplicate processing of same message
- **Gemini Vision Integration** — Dual-intent photo analysis (disease + product bottle)
- **50 Syngenta Product Database** — Complete with efficacy scores, dosage, active ingredients
- **Farmer State Management** — Persistent farmer profiles with field data
- **Farm Journal** — All interactions logged as auditable journal entries

## Environment Variables Required
```
META_WHATSAPP_TOKEN=          # Meta WhatsApp Cloud API token
META_WHATSAPP_PHONE_ID=       # WhatsApp Business phone number ID
META_VERIFY_TOKEN=            # Webhook verification token
GEMINI_API_KEY=               # Google Gemini API key
```

## Production Webhook Endpoint
- **Live URL:** `https://krishyantra.vercel.app/api/meta-whatsapp/webhook`
- **Verification Callback:** Configure in Meta Developer Portal under WhatsApp Cloud API > Webhooks.

