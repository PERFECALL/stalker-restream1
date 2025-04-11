import getStream from '../../../lib/getStream.js';

export default async function handler(req, res) {
  try {
    const { channel } = req.query;
    const url = await getStream(channel);
    if (!url) throw new Error('No stream found');
    
    // Set the proper content type for M3U
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Cache-Control', 'no-cache');

    // Write the M3U content dynamically
    const m3uContent = `#EXTM3U
#EXTINF:-1,${channel}
${url}`;

    res.status(200).send(m3uContent); // Send the M3U content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}