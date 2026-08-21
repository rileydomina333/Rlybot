import { existsSync, promises as fsPromises } from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  if (global.conn.user.jid!== conn.user.jid) {
    return conn.sendMessage(m.chat, { text: `*⟡ ACCESSO NEGATO ⟡*\n\n💠 *Usa questo comando solo dal numero del bot*` }, { quoted: m })
  }

  const sessionFolder = "./sessioni/"
  if (!existsSync(sessionFolder)) {
    return conn.sendMessage(m.chat, { text: `*⟡ CARTELLA NON TROVATA ⟡*\n\n💠 *La cartella./sessioni/ non esiste*` }, { quoted: m })
  }

  let deletedCount = 0
  try {
    const files = await fsPromises.readdir(sessionFolder)
    for (let file of files) {
      if (file!== "creds.json") {
        await fsPromises.unlink(path.join(sessionFolder, file))
        deletedCount++
      }
    }
  } catch(e) {
    return conn.sendMessage(m.chat, { text: `*⟡ ERRORE ⟡*\n\n💠 ${e.message}` }, { quoted: m })
  }

  let text = deletedCount === 0
   ? `*⟡ SVUOTAMENTO COMPLETATO ⟡*\n\n💠 *Le sessioni sono già vuote*`
    : `*⟡ SESSIONI ELIMINATE ⟡*\n\n💠 > Sono stati eliminati ${deletedCount} archivi dalle sessioni\n
💠 > Grazie per avermi svuotato!\n\n`

  await conn.sendMessage(m.chat, {
    text,
    footer: 'RLY BOT',
    buttons: [
      {buttonId: '.svuota', buttonText: {displayText: '💠 Svuota di nuovo'}, type: 1},
      {buttonId: '.ping', buttonText: {displayText: '💠 Ping'}, type: 1}
    ]
  }, { quoted: m })
}

handler.help = ['ds']
handler.tags = ['owner']
handler.command = /^(ds|clearsession)$/i
handler.owner = true
export default handler