import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    // Get the channel name from the query params
    const { channel } = req.query;

    if (!channel) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    // Stalker Portal Details
    const mac = '00:1A:79:00:00:76';
    const deviceId = '908760383108EC7009D9C314299E66262AF35A1192FF72A26157C57A95B06885';
    const serial = '2AD07B43BA39F';
    const stalkerUrl = 'http://tv.ace4k.me/stalker_portal/server/load.php?type=itv&action=create_link&forced_storage=false&download=false';

    // Request headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C)',
      'Accept': '*/*',
      'Connection': 'Keep-Alive',
      'X-User-Agent': 'Model: MAG254; Link: Ethernet',
    };

    // Prepare the request body to fetch the stream URL for the channel
    const formData = new URLSearchParams();
    formData.append('cmd', `ffrt http://localhost/${channel}`);
    formData.append('JsHttpRequest', '1-xml');

    // Fetch the stream URL from the Stalker Portal
    const response = await fetch(stalkerUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await response.json();
    const streamUrl = json.js?.cmd;

    if (!streamUrl) {
      throw new Error('Unable to fetch the stream URL with token');
    }

    // Set the correct headers for M3U
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Cache-Control', 'no-cache');

    // Prepare the M3U content with the dynamic stream URL and token
    const m3uContent = `#EXTM3U
#EXTINF:-1,${channel}
${streamUrl}`;

    // Send the M3U playlist content as the response
    res.status(200).send(m3uContent);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
}
