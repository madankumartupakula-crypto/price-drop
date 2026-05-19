# PricePulse MERN

PricePulse has been converted from a Next.js/Firebase Studio project into a MERN-style app:

- MongoDB stores tracked products.
- Express exposes the API.
- React runs the browser UI.
- Node.js runs the server.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your real MongoDB connection string:

   ```env
   MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=priceDrop
   JWT_SECRET=replace-with-a-long-random-secret
   ```

4. Add at least one real OTP delivery provider.

   Email OTP with SMTP:

   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM="PricePulse <your-email@gmail.com>"
   ```

   Phone OTP with Twilio:

   ```env
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_FROM=+1234567890
   ```

5. Run the MERN app:

   ```bash
   npm run dev
   ```

The React client runs at `http://127.0.0.1:5173`.
The Express API runs at `http://127.0.0.1:5001`.

## Manual Inputs Needed

- `MONGODB_URI`: required. Use your MongoDB Atlas connection string or local MongoDB URI.
- `MONGODB_DB`: optional. Defaults to `priceDrop`.
- `JWT_SECRET`: required for production. Use a long random string.
- Email login needs `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.
- Phone login needs `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM`.
- The app does not accept demo OTPs. If the delivery provider is not configured, OTP login fails with a setup error.
- Product URL scraping is best-effort. Some stores block server-side fetching, so the UI includes a Manual tab where you can enter product name, price, target price, image URL, retailer, and product URL yourself.

## API

- `POST /api/auth/request-otp`: send a real OTP to email or phone.
- `POST /api/auth/verify-otp`: verify OTP and return a session token.
- `GET /api/auth/me`: validate the current session token.
- `GET /api/products`: list tracked products.
- `POST /api/products`: create a tracked product.
- `DELETE /api/products/:id`: delete a tracked product.
- `POST /api/scrape`: try to extract product details from a URL.
