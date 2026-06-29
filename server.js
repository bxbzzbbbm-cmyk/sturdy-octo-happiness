const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5902;

// In-memory mock state (reset on restart)
let state = { connected: false, country: null };
const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "Australia"
];

// Return available countries and current connection
app.get('/api/vpn/list', (req, res) => {
  res.json({
    availableCountries: countries,
    connected: state.connected,
    connectedCountry: state.country
  });
});

app.get('/api/vpn/status', (req, res) => {
  res.json({
    connected: state.connected,
    connectedCountry: state.country
  });
});

// Connect to a country (simulated)
app.post('/api/vpn/connect', async (req, res) => {
  const { country } = req.body || {};
  if (!country) return res.status(400).json({ error: 'country is required in body' });
  if (!countries.includes(country)) return res.status(400).json({ error: 'unknown country' });
  if (state.connected) return res.status(400).json({ error: 'already connected', connectedCountry: state.country });

  // Simulate connection delay
  await new Promise(r => setTimeout(r, 800));
  state.connected = true;
  state.country = country;
  res.json({ status: 'connected', country });
});

// Disconnect (simulated)
app.post('/api/vpn/disconnect', async (req, res) => {
  if (!state.connected) return res.status(400).json({ error: 'not connected' });

  // Simulate teardown delay
  await new Promise(r => setTimeout(r, 400));
  const previous = state.country;
  state.connected = false;
  state.country = null;
  res.json({ status: 'disconnected', previous });
});

app.listen(PORT, () => {
  console.log(`VPN API (mock) listening on port ${PORT}`);
});
