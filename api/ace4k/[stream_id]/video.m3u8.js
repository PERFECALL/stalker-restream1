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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': '*/*',
    'Connection': 'keep-alive',
    'Cookie': 'cookie_name=cookie_value;', // Add any necessary cookies here if you have them
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'http://tv.ace4k.me/stalker_portal/',
    'Origin': 'http://tv.ace4k.me',
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const streamUrl = json?.js?.cmd;

    if (!streamUrl) {
      throw new Error('Stream URL not found from Stalker');
    }

    // Return the actual stream URL as a direct .m3u8 link for playback
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    return res.send(`#EXTM3U\n#EXTINF:-1,Channel Name\n${streamUrl}\n`);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}