module.exports = {
  name: 'bot',
  command: '.bot',
  description: 'IA gratis con DuckDuckGo. Nessuna install',

  async execute(sock, msg, args) {
    const groupId = msg.key.remoteJid;
    const prompt = args.join(' ');
    if (!prompt) return sock.sendMessage(groupId, { text: 'Usa:.bot scrivimi una poesia' });

    await sock.sendMessage(groupId, { text: '🧠 Ci penso...' });

    try {
      // Usiamo DuckDuckGo AI Chat - gratis e senza key
      const res = await fetch('https://api.duckgo.com/d.js?q=' + encodeURIComponent(prompt), {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      // DDG non ha IA testuale, usiamo HuggingFace Inference API pubblica
      const hfRes = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: `<s>[INST] ${prompt} [/INST]` })
      });

      const data = await hfRes.json();
      let reply = data[0]?.generated_text || "Non ho risposta";
      
      // Pulisce la risposta di Mistral
      reply = reply.split('[/INST]').pop().trim();
      if(reply.length > 1000) reply = reply.slice(0, 1000) + "...";

      sock.sendMessage(groupId, { text: `🤖 ${reply}` });

    } catch (e) {
      console.log(e);
      sock.sendMessage(groupId, { text: 'Errore: API satura. Riprova tra 10s' });
    }
  }
};