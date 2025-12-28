# **App Name**: Bazaar Ledger

## Core Features:

- Add New Product: Allows users to add new products with details like product name, unit, current rate, GST percentage, and party name.
- Update Product Rate: Enables users to update the current rate of a product. The old rate is automatically moved to the rate history, and the new rate becomes active with an auto-calculated final rate.
- View Rate History: Displays old rates below the current rate in a history format, with the ability to expand/collapse old rates.
- Final Rate Calculation: Automatically calculates the final rate based on the formula: finalRate = rate + (rate * gst / 100).
- Product Listing: Displays all products in a table format with columns for S.No, Product Name, Rate, Unit, GST %, Final Rate, Party Name, and Actions.
- MongoDB Integration: Store and retrieve product information, current rates, and rate history using MongoDB with Mongoose models.
- API Endpoints: Create API routes using Next.js API Routes for adding, updating, and fetching products to interact with the MongoDB database.

## Style Guidelines:

- Primary color: Light beige (#F5F5DC), reminiscent of traditional paper ledgers.
- Background color: Very light beige (#FAFAF5), offering a subtle contrast to the primary color.
- Accent color: Pale green (#C0FFC0), providing a subtle highlight and connection to commercial transactions.
- Body and headline font: 'Literata', serif font for a traditional, readable ledger appearance.
- Use simple, ledger-style icons for actions like add, edit, and history.
- Maintain a clean, ledger-style UI with clear sections for product listings, rate updates, and history.
- Use subtle transitions and animations for expanding/collapsing rate history rows.