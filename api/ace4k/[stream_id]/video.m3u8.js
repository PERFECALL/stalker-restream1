import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { stream_id } = req.query;

  if (!stream_id) {
    return res.status(400).json({ error: 'Missing stream_id' });
  }

  const mac = '00:1A:79:00:00:76';
  const serial = '2AD07B43BA39F';
  const deviceId = '908760383108EC7009D9C314299E66262AF35A1192FF72A26157C57A95B06885';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C)',
    'Accept': '*/*',
    'Connection': 'Keep-Alive',
    'X-User-Agent': 'Model: MAG254; Link: Ethernet',
    'Cookie': `mac=${mac}; stb_lang=en; timezone=Asia/Dhaka`
  };

  const body = new URLSearchParams();
  body.append('cmd', `ffrt http://localhost/${stream_id}`);
  body.append('JsHttpRequest', '1-xml');

  try {
    const response = await fetch(
      'http://tv.ace4k.me/stalker_portal/server/load.php?type=itv&action=create_link&forced_storage=false&download=false',
      {
        method: 'POST',
        headers,
        body,
      }
    );

    const json = await response.json();
    const streamUrl = json?.js?.cmd;

    if (!streamUrl) throw new Error('Stream URL not found from Stalker');

    // Redirect to actual stream
    return res.writeHead(302, { Location: streamUrl }).end();

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
