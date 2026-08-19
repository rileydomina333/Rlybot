import { pipeline } from '@xenova/transformers';

let generator;
(async () => {
  generator = await pipeline('text-generation', 'Xenova/gpt2');
})();

module.exports = {
  name: 'bot',
  command: '.bot',
  description: 'IA offline con GPT2',

  async execute(sock, msg, args) {
    const groupId = msg.key.remoteJid;
    const prompt = args.join(' ');
    if (!generator) return sock.sendMessage(groupId, { text: 'Carico il modello, riprova tra 30s...' });

    const output = await generator(prompt, { max_new_tokens: 100 });
    sock.sendMessage(groupId, { text: `🤖 ${output[0].generated_text}` });
  }
};