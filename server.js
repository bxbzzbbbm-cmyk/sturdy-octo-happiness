// server.js — Express VPN API Server
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── 45-country server pool ──────────────────────────────
const VPN_SERVERS = [
  { id:'us-nyc-01', country:'United States', country_code:'US', city:'New York',    ip:'104.21.45.12',   ping_ms:12,  load:45, premium:false, protocol:'WireGuard', region:'Americas'     },
  { id:'gb-lon-01', country:'United Kingdom',country_code:'GB', city:'London',       ip:'188.114.97.44',  ping_ms:18,  load:38, premium:false, protocol:'WireGuard', region:'Europe'       },
  { id:'de-fra-01', country:'Germany',       country_code:'DE', city:'Frankfurt',    ip:'172.67.68.22',   ping_ms:22,  load:52, premium:false, protocol:'WireGuard', region:'Europe'       },
  { id:'ca-tor-01', country:'Canada',        country_code:'CA', city:'Toronto',      ip:'104.18.23.67',   ping_ms:28,  load:31, premium:false, protocol:'WireGuard', region:'Americas'     },
  { id:'au-syd-01', country:'Australia',     country_code:'AU', city:'Sydney',       ip:'172.64.155.89',  ping_ms:95,  load:29, premium:false, protocol:'WireGuard', region:'Asia Pacific' },
  { id:'jp-tky-01', country:'Japan',         country_code:'JP', city:'Tokyo',        ip:'104.16.89.34',   ping_ms:72,  load:61, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'fr-par-01', country:'France',        country_code:'FR', city:'Paris',        ip:'188.114.98.77',  ping_ms:25,  load:44, premium:false, protocol:'WireGuard', region:'Europe'       },
  { id:'nl-ams-01', country:'Netherlands',   country_code:'NL', city:'Amsterdam',    ip:'104.21.78.33',   ping_ms:20,  load:57, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'sg-sgp-01', country:'Singapore',     country_code:'SG', city:'Singapore',    ip:'172.67.201.45',  ping_ms:55,  load:48, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'ch-zur-01', country:'Switzerland',   country_code:'CH', city:'Zurich',       ip:'104.18.56.91',   ping_ms:27,  load:35, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'se-sto-01', country:'Sweden',        country_code:'SE', city:'Stockholm',    ip:'188.114.102.56', ping_ms:32,  load:28, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'no-osl-01', country:'Norway',        country_code:'NO', city:'Oslo',         ip:'104.21.99.14',   ping_ms:35,  load:22, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'br-sao-01', country:'Brazil',        country_code:'BR', city:'Sao Paulo',    ip:'172.64.212.33',  ping_ms:85,  load:41, premium:true,  protocol:'WireGuard', region:'Americas'     },
  { id:'mx-mex-01', country:'Mexico',        country_code:'MX', city:'Mexico City',  ip:'104.16.145.78',  ping_ms:42,  load:37, premium:true,  protocol:'WireGuard', region:'Americas'     },
  { id:'in-mum-01', country:'India',         country_code:'IN', city:'Mumbai',       ip:'172.67.134.55',  ping_ms:88,  load:66, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'kr-sel-01', country:'South Korea',   country_code:'KR', city:'Seoul',        ip:'104.18.177.23',  ping_ms:68,  load:54, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'it-mil-01', country:'Italy',         country_code:'IT', city:'Milan',        ip:'188.114.105.67', ping_ms:30,  load:43, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'es-mad-01', country:'Spain',         country_code:'ES', city:'Madrid',       ip:'104.21.67.89',   ping_ms:33,  load:39, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'pl-waw-01', country:'Poland',        country_code:'PL', city:'Warsaw',       ip:'172.64.188.44',  ping_ms:38,  load:31, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'at-vie-01', country:'Austria',       country_code:'AT', city:'Vienna',       ip:'104.18.201.77',  ping_ms:26,  load:27, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'be-bru-01', country:'Belgium',       country_code:'BE', city:'Brussels',     ip:'188.114.107.33', ping_ms:21,  load:34, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'dk-cop-01', country:'Denmark',       country_code:'DK', city:'Copenhagen',   ip:'104.21.55.66',   ping_ms:29,  load:25, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'fi-hel-01', country:'Finland',       country_code:'FI', city:'Helsinki',     ip:'172.67.221.88',  ping_ms:37,  load:21, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'pt-lis-01', country:'Portugal',      country_code:'PT', city:'Lisbon',       ip:'104.18.234.55',  ping_ms:36,  load:30, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'ro-buc-01', country:'Romania',       country_code:'RO', city:'Bucharest',    ip:'188.114.110.44', ping_ms:41,  load:33, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'cz-prg-01', country:'Czech Republic',country_code:'CZ', city:'Prague',       ip:'104.21.44.77',   ping_ms:34,  load:28, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'nz-akl-01', country:'New Zealand',   country_code:'NZ', city:'Auckland',     ip:'172.64.196.33',  ping_ms:112, load:19, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'hk-hkg-01', country:'Hong Kong',     country_code:'HK', city:'Hong Kong',    ip:'104.18.121.66',  ping_ms:62,  load:58, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'tw-tpe-01', country:'Taiwan',        country_code:'TW', city:'Taipei',       ip:'188.114.114.99', ping_ms:70,  load:46, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'my-kul-01', country:'Malaysia',      country_code:'MY', city:'Kuala Lumpur', ip:'104.21.33.55',   ping_ms:78,  load:42, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'th-bkk-01', country:'Thailand',      country_code:'TH', city:'Bangkok',      ip:'172.67.245.77',  ping_ms:82,  load:39, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'id-jkt-01', country:'Indonesia',     country_code:'ID', city:'Jakarta',      ip:'104.18.88.22',   ping_ms:91,  load:47, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
  { id:'ae-dxb-01', country:'UAE',           country_code:'AE', city:'Dubai',        ip:'188.114.117.44', ping_ms:55,  load:36, premium:true,  protocol:'WireGuard', region:'Middle East'  },
  { id:'il-tlv-01', country:'Israel',        country_code:'IL', city:'Tel Aviv',     ip:'104.21.22.88',   ping_ms:58,  load:32, premium:true,  protocol:'WireGuard', region:'Middle East'  },
  { id:'tr-ist-01', country:'Turkey',        country_code:'TR', city:'Istanbul',     ip:'172.64.167.55',  ping_ms:48,  load:44, premium:true,  protocol:'WireGuard', region:'Middle East'  },
  { id:'za-cpt-01', country:'South Africa',  country_code:'ZA', city:'Cape Town',    ip:'104.18.66.33',   ping_ms:115, load:26, premium:true,  protocol:'WireGuard', region:'Africa'       },
  { id:'ng-lag-01', country:'Nigeria',       country_code:'NG', city:'Lagos',        ip:'188.114.120.77', ping_ms:128, load:22, premium:true,  protocol:'WireGuard', region:'Africa'       },
  { id:'ar-bue-01', country:'Argentina',     country_code:'AR', city:'Buenos Aires', ip:'104.21.11.66',   ping_ms:98,  load:28, premium:true,  protocol:'WireGuard', region:'Americas'     },
  { id:'cl-scl-01', country:'Chile',         country_code:'CL', city:'Santiago',     ip:'172.67.188.44',  ping_ms:102, load:24, premium:true,  protocol:'WireGuard', region:'Americas'     },
  { id:'co-bog-01', country:'Colombia',      country_code:'CO', city:'Bogota',       ip:'104.18.44.99',   ping_ms:75,  load:31, premium:true,  protocol:'WireGuard', region:'Americas'     },
  { id:'gr-ath-01', country:'Greece',        country_code:'GR', city:'Athens',       ip:'188.114.123.55', ping_ms:44,  load:29, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'ua-kyv-01', country:'Ukraine',       country_code:'UA', city:'Kyiv',         ip:'104.21.88.33',   ping_ms:43,  load:35, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'hu-bud-01', country:'Hungary',       country_code:'HU', city:'Budapest',     ip:'172.64.143.66',  ping_ms:36,  load:27, premium:true,  protocol:'WireGuard', region:'Europe'       },
  { id:'eg-cai-01', country:'Egypt',         country_code:'EG', city:'Cairo',        ip:'104.18.33.77',   ping_ms:72,  load:33, premium:true,  protocol:'WireGuard', region:'Africa'       },
  { id:'vn-hcm-01', country:'Vietnam',       country_code:'VN', city:'Ho Chi Minh',  ip:'188.114.126.44', ping_ms:86,  load:41, premium:true,  protocol:'WireGuard', region:'Asia Pacific' },
];

const sessions = new Map();

// GET /api/vpn/list
app.get('/api/vpn/list', (req, res) => {
  const { region, premium } = req.query;
  let list = [...VPN_SERVERS];
  if (region) list = list.filter(s => s.region.toLowerCase() === region.toLowerCase());
  if (premium !== undefined) list = list.filter(s => s.premium === (premium === 'true'));
  res.json({ success: true, total: list.length, servers: list });
});

// POST /api/vpn/connect
app.post('/api/vpn/connect', (req, res) => {
  const { server_id, country_code, protocol } = req.body;
  const server = VPN_SERVERS.find(s =>
    (server_id && s.id === server_id) ||
    (country_code && s.country_code === country_code)
  );
  if (!server) return res.status(404).json({ success: false, error: 'Server not found' });

  const sessionId = 'sess_' + crypto.randomBytes(8).toString('hex');
  const randIp = `10.${rand(2,254)}.${rand(2,254)}.${rand(2,254)}`;
  const session = {
    session_id: sessionId,
    server_id: server.id,
    country: server.country,
    country_code: server.country_code,
    city: server.city,
    assigned_ip: randIp,
    protocol: protocol || server.protocol,
    status: 'connected',
    connected_at: new Date().toISOString()
  };
  sessions.set(sessionId, session);
  res.json({ success: true, connection: session });
});

// POST /api/vpn/disconnect
app.post('/api/vpn/disconnect', (req, res) => {
  const { session_id } = req.body;
  const session = sessions.get(session_id);
  if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
  const now = new Date();
  const duration = Math.round((now - new Date(session.connected_at)) / 1000);
  sessions.delete(session_id);
  res.json({
    success: true,
    disconnected_at: now.toISOString(),
    session_duration_s: duration,
    data_transferred_mb: { uploaded: +(Math.random()*20).toFixed(2), downloaded: +(Math.random()*100).toFixed(2) }
  });
});

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

app.listen(PORT, () => console.log(`VPN API running on http://localhost:${PORT}`));
