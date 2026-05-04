# 🍕 Foodash — Full-Stack Food Delivery Platform

A production-grade food delivery platform with real-time order tracking, Stripe payments, multi-role dashboards, and live chat.
---


## 🚀 Tech Stack


| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, React Router, Stripe.js, Socket.io-client, Recharts |
| Backend | Node.js + Express, Socket.io, Stripe, Multer |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (7 day expiry), bcryptjs |
| Deployment | EC2 Ubuntu + PM2 + Nginx |

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Customer** | Browse restaurants, order food, track orders, reviews |
| **Restaurant Owner** | Manage menu, accept/reject orders, view revenue |
| **Driver** | See available orders, accept pickups, update delivery status |
| **Admin** | Full control — approve restaurants, manage users, view analytics |

---

## ⚡ Quick Start (Local Dev)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on :5000
```

### 2. Frontend
```bash
cd frontend
npm install
# edit .env → set VITE_STRIPE_PUBLIC_KEY
npm run dev            # starts on :5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/foodash
JWT_SECRET=your_super_secret_key
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 📡 API Routes

### Auth
- `POST /api/auth/register` — register (customer/restaurant_owner/driver)
- `POST /api/auth/login` — login, returns JWT
- `GET  /api/auth/me` — get current user
- `PUT  /api/auth/profile` — update profile

### Restaurants
- `GET  /api/restaurants` — list (with search & cuisine filter)
- `GET  /api/restaurants/:id` — detail + menu + reviews
- `POST /api/restaurants` — create (owner/admin)
- `PUT  /api/restaurants/:id` — update

### Menu
- `GET  /api/menu/:restaurantId` — get menu grouped by category
- `POST /api/menu` — add item (owner)
- `PUT  /api/menu/:id` — update item
- `DELETE /api/menu/:id` — delete item

### Orders
- `POST /api/orders` — place order (customer)
- `GET  /api/orders` — list (role-filtered)
- `GET  /api/orders/:id` — single order
- `PUT  /api/orders/:id/status` — update status
- `PUT  /api/orders/:id/assign-driver` — driver picks up

### Payments (Stripe)
- `POST /api/payments/create-intent` — create PaymentIntent
- `POST /api/payments/confirm` — confirm after card success
- `POST /api/payments/refund` — issue refund

### Admin
- `GET  /api/admin/stats` — platform stats + monthly revenue chart
- `GET  /api/admin/users` — all users (filter by role)
- `PUT  /api/admin/users/:id` — update user
- `GET  /api/admin/restaurants` — all restaurants
- `PUT  /api/admin/restaurants/:id/approve` — approve restaurant
- `GET  /api/admin/orders` — all orders

### Driver
- `GET  /api/drivers/available-orders` — orders ready for pickup
- `PUT  /api/drivers/toggle-availability` — go online/offline

### Reviews
- `POST /api/reviews` — submit review
- `GET  /api/reviews/:restaurantId` — get reviews

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `join_customer` | Client→Server | Join personal room |
| `join_restaurant` | Client→Server | Restaurant owner room |
| `track_order` | Client→Server | Subscribe to order updates |
| `new_order` | Server→Client | Notify restaurant of new order |
| `order_updated` | Server→Client | Push status change to customer |
| `driver_location` | Client→Server | Driver sends GPS update |
| `driver_location_update` | Server→Client | Push location to customer |
| `send_message` | Client→Server | Chat message |
| `receive_message` | Server→Client | Deliver chat message |

---

## 🖥️ Pages

| Page | Route | Role |
|---|---|---|
| Home | `/` | Public |
| Restaurants | `/restaurants` | Public |
| Restaurant Detail | `/restaurant/:id` | Public |
| Cart + Checkout | `/cart` | Customer |
| Order Tracking | `/order/:id` | Authenticated |
| My Orders | `/orders` | Customer |
| Restaurant Dashboard | `/restaurant` | Restaurant Owner |
| Driver Dashboard | `/driver` | Driver |
| Admin Dashboard | `/admin` | Admin |
| Login/Register | `/login` `/register` | Public |

---

## ☁️ EC2 Deployment

See `deploy.sh` for the full script. Quick summary:

1. Launch Ubuntu 22.04 EC2, open ports 80, 443, 22
2. SSH in, run `deploy.sh`
3. Update Nginx config with your IP/domain
4. Set up SSL with: `sudo certbot --nginx -d yourdomain.com`

---

## 🧪 Stripe Test Cards

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined |
| `4000 0027 6000 3184` | 3D Secure |

Use any future expiry date and any 3-digit CVC.






