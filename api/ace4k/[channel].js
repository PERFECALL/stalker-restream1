import getStream from '../../../lib/getStream';

export default async function handler(req, res) {
  try {
    const { channel } = req.query;
    if (!channel) return res.status(400).json({ error: 'Channel not provided' });

    const url = await getStream(channel);
    if (!url) throw new Error('Stream not found');

    res.writeHead(302, { Location: url });
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
