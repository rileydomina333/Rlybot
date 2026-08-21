const { g4f } = require("g4f");

let handler = async (m, { text }) => {
  if (!text) return m.reply('Scrivi qualcosa dopo .bot')
  m.reply('🤖 Sto pensando...')
  const response = await g4f.chatCompletion([
    { role: "user", content: text }
  ]);
  m.reply(response)
}
handler.command = ['bot','ai']
module.exports = handler