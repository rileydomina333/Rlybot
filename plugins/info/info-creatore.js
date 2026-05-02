import pkg from '@chatunity/baileys'
const { generateWAMessageFromContent } = pkg

let handler = async (m, { conn }) => {
  const ownerNumber = '+584167240185'
  const ownerName = 'Riley'
  const nomebot = conn.user?.name || global.db?.data?.nomedelbot || global.nomebot || 'ChatUnity'

  await conn.sendContact(m.chat, [[ownerNumber, ownerName]], m)

  let msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: { title: "I miei social" },
          body: { text: "Puoi contattarmi anche qua: 👇" },
          footer: { text: nomebot },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "『 ◼️🟧 』 pornhub",
                  url: "https://pornhub.com",
                  merchant_url: "https://pornhub.com"
                })
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "『 🔥 』 darkness",
                  url: "https://darknessporn.com",
                  merchant_url: "https://darknessporn.com"
                })
              }
            ]
          }
        }
      }
    }
  }, { userJid: m.sender })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}
handler.help = [
  'owner',
  'creatore',
  'propietario',
  'dono',
  'eigentümer',
  '所有者',
  'владелец',
  'المالك',
  'मालिक',
  'propriétaire',
  'pemilik',
  'sahip'
];
handler.tags = ['main'];
handler.command = /^(creatore|propietario|dono|eigentümer|所有者|владелец|المالك|मालिक|propriétaire|pemilik|sahip)$/i;

export default handler
