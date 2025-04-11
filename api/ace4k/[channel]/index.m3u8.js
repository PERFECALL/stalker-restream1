import fetch from 'node-fetch';

const stalkerURL = 'http://tv.ace4k.me/stalker_portal/server/load.php'; const mac = '00:1A:79:00:00:76'; const serial = '2AD07B43BA39F'; const device_id = '908760383108EC7009D9C314299E66262AF35A1192FF72A26157C57A95B06885'; const userAgent = 'Mozilla/5.0 (QtEmbedded; U; Linux; C)';

async function getAuthHeaders(token) { return { 'User-Agent': userAgent, 'Accept': '/', 'Connection': 'Keep-Alive', 'X-User-Agent': 'Model: MAG254; Link: Ethernet', 'Authorization': Bearer ${token} }; }

async function stalkerLogin() { const headers = { 'User-Agent': userAgent, 'Accept': '/', 'Connection': 'Keep-Alive', 'X-User-Agent': 'Model: MAG254; Link: Ethernet', 'Cookie': mac=${mac}; stb_lang=en; timezone=Asia/Dhaka };

const body = new URLSearchParams(); body.append('type', 'stb'); body.append('action', 'handshake'); body.append('token', ''); body.append('prehash', ''); body.append('JsHttpRequest', '1-xml');

const res = await fetch(${stalkerURL}?type=stb&action=handshake&token=&prehash=&JsHttpRequest=1-xml, { method: 'GET', headers, }); const json = await res.json(); return json.js.token; }

export default async function handler(req, res) { const { channel } = req.query;

if (!channel) { return res.status(400).json({ error: 'Channel not specified' }); }

try { const token = await stalkerLogin(); const headers = await getAuthHeaders(token);

const body = new URLSearchParams();
body.append('cmd', `ffrt http://localhost/${channel}`);
body.append('JsHttpRequest', '1-xml');

const response = await fetch(
  `${stalkerURL}?type=itv&action=create_link&forced_storage=false&download=false`,
  {
    method: 'POST',
    headers,
    body,
  }
);

const data = await response.json();
const streamUrl = data?.js?.cmd;

if (!streamUrl) {
  throw new Error('Stream URL not found');
}

res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
res.status(200).send(`#EXTM3U\n#EXTINF:-1,${channel}\n${streamUrl}`);

} catch (error) { res.status(500).json({ error: error.message }); } }

