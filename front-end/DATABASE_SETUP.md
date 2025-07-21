# Database Setup Guide

This guide helps you set up MongoDB for the Liquidity Nigerian Stock Trading Platform.

## Quick Start

1. **Check MongoDB Status**
   ```bash
   npm run check:mongodb
   ```

2. **Start MongoDB (choose one option below)**

3. **Seed the Database**
   ```bash
   npm run seed:database
   ```

## MongoDB Installation Options

### Option 1: Docker (Recommended)

1. **Start Docker Desktop** (if not already running)

2. **Run MongoDB Container**
   ```bash
   docker run -d -p 27017:27017 --name Liquidity-mongodb mongo:latest
   ```

3. **Verify MongoDB is running**
   ```bash
   npm run check:mongodb
   ```

### Option 2: Windows Service

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow the installation wizard
   - Choose "Install MongoDB as a Service"

2. **Start the service**
   ```bash
   net start MongoDB
   ```

### Option 3: Manual Installation

1. **Download MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Extract to a folder (e.g., `C:\mongodb`)

2. **Create data directory**
   ```bash
   mkdir C:\data\db
   ```

3. **Start MongoDB manually**
   ```bash
   C:\mongodb\bin\mongod.exe --dbpath "C:\data\db"
   ```

## Database Health Check

The application includes a built-in health check API:

```bash
# Start your Next.js application
npm run dev

# Check database health
curl http://localhost:3000/api/health/db
```

## Troubleshooting

### Error: "Could not get stocks from db"

This error occurs when MongoDB is not running or not accessible. Follow these steps:

1. **Check if MongoDB is running**
   ```bash
   npm run check:mongodb
   ```

2. **If MongoDB is not running, start it using one of the options above**

3. **Verify the connection string in your .env file**
   ```
   CONN_STRING=mongodb://localhost:27017/Liquidity
   ```

4. **Seed the database with sample data**
   ```bash
   npm run seed:database
   ```

### Common Error Messages

- **ECONNREFUSED**: MongoDB is not running
- **Timeout errors**: MongoDB is running but not responding (check system resources)
- **Authentication errors**: Check if MongoDB requires authentication

### Database Collections

The application uses these MongoDB collections:

- `stocks` - Stock information (symbol, name, tokenID, etc.)
- `stockPricesv2` - Historical stock prices
- `stockPurchases` - User stock purchases
- `userStocks` - User stock holdings

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Database
CONN_STRING=mongodb://localhost:27017/Liquidity

# Development
NODE_ENV=development
```

## Sample Data

The seeding script includes sample data for these Nigerian stocks:

- DANGCEM (Dangote Cement)
- GTCO (Guaranty Trust Holding)
- AIRTELAFRI (Airtel Africa)
- MTNN (MTN Nigeria)
- BUACEMENT (BUA Cement)
- ZENITHBANK (Zenith Bank)
- SEPLAT (Seplat Petroleum)

## Production Considerations

For production deployment:

1. Use MongoDB Atlas or a managed MongoDB service
2. Update the `CONN_STRING` environment variable
3. Ensure proper authentication and security settings
4. Set up database backups
5. Monitor database performance

## Getting Help

If you continue to have issues:

1. Check the application logs for detailed error messages
2. Verify MongoDB is accessible from your network
3. Check firewall settings
4. Ensure sufficient disk space and memory
