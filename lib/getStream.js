import fetch from 'node-fetch';

export default async function getStream(channelName) {
  const mac = '00:1A:79:00:00:76';
  const deviceId = '908760383108EC7009D9C314299E66262AF35A1192FF72A26157C57A95B06885';
  const serial = '2AD07B43BA39F';
  const stalkerUrl = 'http://tv.ace4k.me/stalker_portal/server/load.php?type=itv&action=create_link&forced_storage=false&download=false';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C)',
    'Accept': '*/*',
    'Connection': 'Keep-Alive',
    'X-User-Agent': 'Model: MAG254; Link: Ethernet',
  };

  const formData = new URLSearchParams();
  formData.append('cmd', `ffrt http://localhost/${channelName}`);
  formData.append('JsHttpRequest', '1-xml');

  const response = await fetch(stalkerUrl, {
    method: 'POST',
    headers,
    body: formData
  });

  const json = await response.json();
  const url = json.js?.cmd;

  return url;
}
