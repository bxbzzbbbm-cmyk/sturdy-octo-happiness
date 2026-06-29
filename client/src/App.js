import React, { useEffect, useState } from 'react';

function App() {
  const [countries, setCountries] = useState([]);
  const [status, setStatus] = useState({ connected: false, connectedCountry: null });
  const [loading, setLoading] = useState(false);

  async function fetchList() {
    const res = await fetch('/api/vpn/list');
    const json = await res.json();
    setCountries(json.availableCountries || []);
    setStatus({ connected: json.connected, connectedCountry: json.connectedCountry });
  }

  useEffect(() => { fetchList(); }, []);

  async function connect(country) {
    setLoading(true);
    try {
      const res = await fetch('/api/vpn/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'connect failed');
      setStatus({ connected: true, connectedCountry: json.country });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    setLoading(true);
    try {
      const res = await fetch('/api/vpn/disconnect', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'disconnect failed');
      setStatus({ connected: false, connectedCountry: null });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>VPN (mock)</h1>
      <p>Status: {status.connected ? `Connected (${status.connectedCountry})` : 'Not connected'}</p>
      <div>
        {countries.map(c => (
          <button key={c} onClick={() => connect(c)} disabled={loading || status.connected}>
            Connect {c}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={disconnect} disabled={loading || !status.connected}>
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default App;
