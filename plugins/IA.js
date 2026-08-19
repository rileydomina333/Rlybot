const https = require('https');

module.exports = {
  name: 'bot',
  command: '.bot',
  description: 'IA gratis senza API key e senza installare',

  async execute(sock, msg, args) {
    const groupId = msg.key.remoteJid;
    const prompt = args.join(' ');
    if (!prompt) return sock.sendMessage(groupId, { text: 'Usa:.bot raccontami una barzelletta' });

    await sock.sendMessage(groupId, { text: '🧠 Ci penso...' });

    const data = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer gsk_TUA_CHIAVE_QUI' // Groq dà chiavi gratis
      }
    };

    // VERSIONE DAVVERO SENZA KEY: usiamo un proxy pubblico
    const req = https.request('https://api.pawan.krd/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const reply = json.choices[0].message.content;
          sock.sendMessage(groupId, { text: `🤖 ${reply}` });
        } catch {
          sock.sendMessage(groupId, { text: 'Errore API. Riprova' });
        }
      });
    });

    req.on('error', () => sock.sendMessage(groupId, { text: 'API offline' }));
    req.write(JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    }));
    req.end();
  }
};