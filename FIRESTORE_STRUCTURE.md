# RentMe Firestore Database Structure

This document outlines the Firestore database structure for the RentMe platform.

---

## Overview

The database uses a hybrid approach:
- **Products** collection stores lightweight data for quick listing displays
- **Details** collection stores extended product information loaded on demand
- **Vendors** collection stores vendor profiles with subcollections for calendar events

---

## Collections

### `vendors`

Stores vendor/business profiles.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Vendor's Firebase Auth UID (matches document ID) |
| `businessName` | string | Business display name |
| `name` | string | Vendor's personal name |
| `email` | string | Contact email |
| `phone` | string | Contact phone number |
| `image` | string | Profile image URL (Firebase Storage) |
| `subtitle` | string | Business tagline (e.g., "Serving NorCal + beyond") |
| `url` | string | Custom URL slug (e.g., "norcalrentalco") |
| `cancellation_policy` | string | Full cancellation policy text |
| `pending_deposits` | number | Pending deposit amount |
| `total_bookings` | number | Total number of bookings |
| `total_sales` | number | Total sales amount |
| `total_views` | number | Total profile/listing views |
| `vacations` | array\<map\> | Vacation periods when vendor is unavailable (see below) |

#### Vacations Array Structure

Vendors can set multiple vacation periods when all their listings become unavailable.

Each vacation object in the array:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for this vacation period |
| `startDate` | string | Start date in `YYYY-MM-DD` format |
| `endDate` | string | End date in `YYYY-MM-DD` format |
| `label` | string | Optional label (e.g., "Summer Trip", "Holidays") |

**Example:**
```javascript
vacations: [
  { id: "vac_1", startDate: "2025-06-01", endDate: "2025-06-15", label: "Summer Trip" },
  { id: "vac_2", startDate: "2025-12-20", endDate: "2025-12-31", label: "Holidays" }
]
```

> **Frontend Implementation:** When checking availability, loop through `vacations` array and check if the requested date falls within any vacation period's `startDate` and `endDate`.

#### Subcollections

##### `vendors/{vendorId}/calendar`

Stores calendar events for the vendor (bookings, blocked dates, etc.)

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date in `YYYY-MM-DD` format |
| `event` | string | Event description (e.g., `"Order #100000"`) |

##### `vendors/{vendorId}/orders`

Reference to vendor's orders (not primary - see root `orders` collection).

##### `vendors/{vendorId}/payments`

Stores payment/payout information for the vendor.

---

### `products`

Stores lightweight product data for quick listing displays (cards, search results).

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Product ID (matches document ID) |
| `vendor_id` | string | References `vendors` collection |
| `details_id` | string | References `details` collection |
| `title` | string | Product title |
| `price` | number | Daily rental price |
| `image_url` | string | Main product image URL (Firebase Storage) |
| `location` | string | Zip code or location string |
| `type` | string | Product type |
| `rating` | string | Average rating (e.g., "4.4") |
| `num_reviews` | number | Number of reviews |
| `timestamp` | timestamp | Last updated timestamp |
| `bookings` | number | Total number of bookings |
| `earned` | number | Total earnings from this product |

#### Subcollections

##### `products/{productId}/addons`

> **Note:** Addons are now stored as an array in the `details` document, not as a subcollection.

---

### `details`

Stores extended product information loaded when a user views a specific listing.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Details ID (matches document ID) |
| `product_id` | string | References `products` collection |
| `vendor_id` | string | References `vendors` collection |
| `subtitle` | string | Product subtitle/tagline |
| `description` | string | Full product description |
| `num_items` | number | Quantity available |
| `serviceMiles` | number | Delivery radius in miles |
| `mainCategory` | string | Main category (e.g., "inflatable") |
| `subCategory` | string | Sub category (e.g., "bounce") |
| `block_dates` | array\<string\> | Blocked dates in `YYYY-MM-DD` format |
| `addons` | array\<map\> | Available add-ons (see structure below) |
| `variations` | array\<map\> | Product variations (see structure below) |

#### Addons Array Structure

Each addon in the `addons` array:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique addon identifier (e.g., "propane-tank") |
| `name` | string | Display name (e.g., "Propane Tank") |
| `description` | string | Addon description |
| `price` | number | Addon price |
| `priceType` | string | `"flat"` for one-time fee, `"perday"` for daily charge |
| `required` | boolean | Whether addon is mandatory |

#### Variations Array Structure

For products with variations (like bounce houses with color options):

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Variation identifier |
| `name` | string | Variation name (e.g., "Ball Pit Colors") |
| `type` | string | Variation type (e.g., "single", "multiple") |
| `required` | boolean | Whether selection is required |
| `choices` | array\<map\> | Available choices |

Each choice in the `choices` array:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Choice identifier (e.g., "rainbow") |
| `name` | string | Choice display name (e.g., "Rainbow Mix") |

#### Subcollections

##### `details/{detailsId}/photos`

Additional product photos. Document IDs: `secondary`, `third`

| Field | Type | Description |
|-------|------|-------------|
| `image_url` | string | Photo URL (Firebase Storage) |
| `timestamp` | timestamp | Upload timestamp |

##### `details/{detailsId}/reviews`

Product reviews from customers.

##### `details/{detailsId}/specifications`

Product specifications/features.

---

### `orders`

Stores all rental orders. Document ID is the order number.

| Field | Type | Description |
|-------|------|-------------|
| `vendorId` | string | References `vendors` collection |
| `customerInfoName` | string | Customer's name |
| `customerInfoEmail` | string | Customer's email |
| `customerInfoNumber` | string | Customer's phone number |
| `rentalProduct` | string | Product name |
| `rentalAddress` | string | Delivery address |
| `rentalDateStart` | string | Start date (format: "Month D, YYYY") |
| `rentalDateEnd` | string | End date (format: "Month D, YYYY") |
| `days` | number | Number of rental days |
| `rentalPrice` | number | Base rental price |
| `totalPrice` | number | Total price including fees/addons |

---

## Relationships

```
vendors (vendor profile)
    └── calendar/ (booking events)
    └── orders/ (reference)
    └── payments/

products (quick display data)
    ├── vendor_id → vendors
    └── details_id → details

details (full product info)
    ├── product_id → products
    ├── vendor_id → vendors
    ├── photos/ (subcollection)
    ├── reviews/ (subcollection)
    └── specifications/ (subcollection)

orders (rental transactions)
    └── vendorId → vendors
```

---

## Data Flow

### Listing Display (Cards)
1. Query `products` where `vendor_id == currentUser.uid`
2. Display using: `title`, `price`, `image_url`, `location`, `rating`

### Listing Detail View
1. Get product document
2. Use `details_id` to fetch full details
3. Load `photos`, `reviews`, `specifications` subcollections as needed

### Blocking Dates
1. Update `details.block_dates` array with `YYYY-MM-DD` strings
2. Dates in this array cannot be booked

### Calendar Events
1. When order is placed, add document to `vendors/{vendorId}/calendar`
2. Format: `{ date: "YYYY-MM-DD", event: "Order #XXXXXX" }`

---

## Date Formats

| Context | Format | Example |
|---------|--------|---------|
| `block_dates` | `YYYY-MM-DD` | `"2025-04-26"` |
| `calendar.date` | `YYYY-MM-DD` | `"2025-04-22"` |
| `orders.rentalDateStart` | `Month D, YYYY` | `"March 3, 2025"` |
| `orders.rentalDateEnd` | `Month D, YYYY` | `"March 5, 2025"` |

---

## Notes

- **Vendor ID**: Always use `vendor_id` field on documents rather than subcollections under vendors
- **Product/Details Split**: Products are for quick display, details are loaded on demand to reduce bandwidth
- **Block Dates**: Stored as ISO date strings for easy comparison and sorting
- **Order IDs**: Sequential numbers starting from 100000
