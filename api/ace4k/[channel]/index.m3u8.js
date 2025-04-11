import fetch from 'node-fetch';

const stalkerHost = 'http://tv.ace4k.me';
const mac = '00:1A:79:00:00:76';
const serialNumber = '2AD07B43BA39F';
const deviceId = '908760383108EC7009D9C314299E66262AF35A1192FF72A26157C57A95B06885';

async function getToken() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C)',
    'Accept': '*/*',
    'Connection': 'Keep-Alive',
    'X-User-Agent': 'Model: MAG254; Link: Ethernet',
    'Authorization': '',
    'Cookie': '',
  };

  const response = await fetch(`${stalkerHost}/stalker_portal/server/load.php?type=stb&action=handshake&token=&prehash=false&JsHttpRequest=1-xml`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'handshake',
      type: 'stb',
      prehash: false
    }),
  });

  const data = await response.json();
  return data.js.token;
}

async function getProfile(token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Cookie': `mac=${mac}; stb_lang=en;`,
    'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C)',
    'X-User-Agent': 'Model: MAG254; Link: Ethernet',
    'Referer': `${stalkerHost}/stalker_portal/c/`,
  };

  await fetch(`${stalkerHost}/stalker_portal/server/load.php?type=stb&action=do_auth&mac=${mac}&sn=${serialNumber}&device_id=${deviceId}&JsHttpRequest=1-xml`, {
    method: 'POST',
    headers,
  });
}

async function getStreamUrl(channel, token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Cookie': `mac=${mac}; stb_lang=en;`,
    'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C)',
    'X-User-Agent': 'Model: MAG254; Link: Ethernet',
    'Referer': `${stalkerHost}/stalker_portal/c/`,
  };

  const body = new URLSearchParams();
  body.append('cmd', `ffrt http://localhost/${channel}`);
  body.append('JsHttpRequest', '1-xml');

  const response = await fetch(`${stalkerHost}/stalker_portal/server/load.php?type=itv&action=create_link&forced_storage=false&download=false`, {
    method: 'POST',
    headers,
    body,
  });

  const json = await response.json();
  return json.js?.cmd || null;
}

export default async function handler(req, res) {
  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({ error: 'Channel not specified' });
  }

  try {
    const token = await getToken();
    await getProfile(token);
    const streamUrl = await getStreamUrl(channel, token);

    if (!streamUrl) {
      throw new Error('Stream URL not found');
    }

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(`#EXTM3U
#EXTINF:-1,${channel}
${streamUrl}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
                               }
