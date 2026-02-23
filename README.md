# Trading Simulator

A real-time stock trading simulation platform built with the MERN stack and Socket.io. This project features a high-performance order matching engine, live market data, and an interactive dashboard.

## 🚀 Features

- **Real-time Order Matching Engine**: Uses optimized data structures (AVL Trees and Priority Queues) for efficient order processing.
- **Live Market Data**: Synchronized with real-market symbols using Yahoo Finance.
- **Interactive Dashboard**: Visualize market trends with high-performance charts (Recharts & Lightweight Charts).
- **Socket.io Integration**: Get live updates for the Order Book, Trade History, and price movements without refreshing.
- **Portfolio Management**: Track your balance, investments, and trading history.
- **Advanced Trading Options**: Support for Market Orders, Price-Time Priority, and Stock Search with autocorrect.

## 🛠️ Tech Stack

### Backend
- **Node.js & Express**: Core server framework.
- **MongoDB & Mongoose**: Database for users, orders, and transactions.
- **Socket.io**: Real-time bidirectional communication.
- **JWT & Passport**: Secure authentication (Local, Google, GitHub).
- **Yahoo Finance API**: Fetching real-world stock data.

### Frontend
- **React & Vite**: Modern, fast frontend development.
- **Tailwind CSS**: Utility-first styling with a dark neon aesthetic.
- **Lucide React**: Beautiful icons.
- **Recharts & Lightweight Charts**: Data visualization and trading charts.

## ⚙️ Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/vikashgupta9752/Trading-Simulator.git
cd Trading-Simulator
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```
Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend:
```bash
npm run dev
```

## 📈 Architecture

The system is designed with performance in mind. The **Order Book** engine is decoupled from the API layer to ensure low-latency matching. It uses:
- **Priority Queues** for managing Buy/Sell orders (Price-Time Priority).
- **AVL Trees** for fast lookups and efficient order cancellation.

## 📄 License
ISC License
