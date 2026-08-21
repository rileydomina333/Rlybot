//Plugin fatto da riley
import { existsSync, promises as fsPromises } from 'fs'
import path from 'path'

const handler = async (message, { conn }) => {

  if (global.conn.user.jid!== conn.user.jid) {
    return conn.reply(message.chat, `
*⟡ ACCESSO NEGATO ⟡*

💠 *Usa questo comando direttamente dal numero del bot*
    `.trim(), message)
  }

  try {
    const sessionFolder = "./sessioni/"

    if (!existsSync(sessionFolder)) {
      return conn.reply(message.chat, `
*⟡ CARTELLA NON TROVATA ⟡*

💠 *La cartella delle sessioni è vuota o non esiste*
      `.trim(), message)
    }

    const sessionFiles = await fsPromises.readdir(sessionFolder)
    let deletedCount = 0

    for (const file of sessionFiles) {
      if (file!== "creds.json") {
        await fsPromises.unlink(path.join(sessionFolder, file))
        deletedCount++
      }
    }

    const caption = deletedCount === 0
     ? `
*⟡ SVUOTAMENTO COMPLETATO ⟡*

💠 *Le sessioni sono già vuote*
      `.trim()
      : `
*⟡ SVUOTAMENTO COMPLETATO ⟡*

💠 *Sono stati eliminati ${deletedCount} archivi dalle sessioni*
💠 *Grazie per avermi svuotato!*

*━━━━━━━━━━━━━━*
> RLY BOT*
*━━━━━━━━━━━━━━*
      `.trim()

    await conn.sendMessage(message.chat, {
      text: caption,
      footer: 'RLY BOT',
      buttons: [
        { buttonId: '.svuota', buttonText: { displayText: '💠 Svuota di nuovo' } },
        { buttonId: '.ping', buttonText: { displayText: '💠 Ping' } }
      ],
      headerType: 1
    }, { quoted: message })

  } catch (error) {
    await conn.reply(message.chat, `
*⟡ ERRORE ⟡*

💠 *Errore:* ${error.message}
    `.trim(), message)
  }
}

handler.help = ['ds', 'clearsession']
handler.tags = ['owner']
handler.command = ['ds', 'clearsession']
handler.owner = true
export default handler