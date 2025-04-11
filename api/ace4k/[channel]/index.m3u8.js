import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({ error: 'Channel not specified' });
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C)',
      'Accept': '*/*',
      'Connection': 'Keep-Alive',
      'X-User-Agent': 'Model: MAG254; Link: Ethernet',
      'Cookie': 'mac=00:1A:79:00:00:76; stb_lang=en; timezone=Asia/Dhaka'
    };

    const body = new URLSearchParams();
    body.append('cmd', `ffrt http://localhost/${channel}`);
    body.append('JsHttpRequest', '1-xml');

    const response = await fetch(
      'http://tv.ace4k.me/stalker_portal/server/load.php?type=itv&action=create_link&forced_storage=false&download=false',
      {
        method: 'POST',
        headers,
        body
      }
    );

    const contentType = response.headers.get("content-type");
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Unexpected content: ${text.slice(0, 100)}`);
    }

    const data = await response.json();
    const streamUrl = data?.js?.cmd;

    if (!streamUrl) throw new Error('Stream URL not found');

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(`#EXTM3U\n#EXTINF:-1,${channel}\n${streamUrl}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
