# How to Use & Deploy Your Number-to-Info API

Welcome to your new API! Follow these steps to get it running and start fetching data.

## 🚀 Setup Instructions

1. **Install Dependencies**:
   Open your terminal in this folder and run:
   ```bash
   npm install
   ```

2. **Configure Your Source**:
   The API is pre-configured to fetch data from our high-speed server. 

3. **Run Locally**:
   Start the server on your computer:
   ```bash
   npm start
   ```
   The API will be live at: `http://localhost:3000/get-info?phone=YOUR_NUMBER`

## 🌍 How to Deploy (Online)

You can host this API for free on platforms like **Render**, **Railway**, or **Vercel**.

### Deploying to Render (Recommended)
1. Push this code to a GitHub repository.
2. Go to [Render.com](https://render.com) and create a new **Web Service**.
3. Link your GitHub repo.
4. Set "Start Command" to `npm start`.
5. Click **Deploy**.

## 🛠️ API Usage
Once deployed, you can get information by sending a GET request:
`GET /get-info?phone=9876543210`

**Response Example:**
```json
{
  "status": "success",
  "data": { ... },
  "developer": "@your_handle"
}
```

---
*Created with ❤️ by your team.*
