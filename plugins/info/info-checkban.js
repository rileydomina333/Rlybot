let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Uso: ${usedPrefix + command} 39xxxxxxxxxx\nEsempio: ${usedPrefix}check 393331234567`)

    let number = text.replace(/[^0-9]/g, '')
    if (number.length < 10) return m.reply('Numero non valido. Metti il prefisso: 39xxxxxxxxxx')

    let jid = number + '@s.whatsapp.net'

    await m.reply('Controllo in corso...')

    try {
        // 1. Controlla se il numero esiste su WhatsApp
        let [result] = await conn.onWhatsApp(jid)

        if (!result?.exists) {
            return m.reply(`❌ *NON ESISTE*\nNumero: +${number}\n\nQuesto numero non è registrato su WhatsApp o è stato bannato.`)
        }

        // 2. Prova a prendere lo status - se è bannato spesso da errore
        let status = 'Non disponibile'
        let pfp = null
        try {
            status = await conn.fetchStatus(result.jid)
            status = status.status || status.setAt? status.status : 'Vuoto'
        } catch {
            status = 'Privato o limitato'
        }

        // 3. Prova a prendere la foto profilo
        try {
            pfp = await conn.profilePictureUrl(result.jid, 'image')
        } catch {
            pfp = 'Nessuna foto o privata'
        }

        let info = `✅ *ESISTE SU WHATSAPP*\n
*Numero:* +${number}
*JID:* ${result.jid}
*Status:* ${status}
*Foto profilo:* ${pfp!== 'Nessuna foto o privata'? 'Presente' : 'No'}\n
*Nota:* Se il numero è bannato da poco potrebbe ancora risultare esistente. Se non riesci a messaggiare o chiamare, probabilmente è sospeso.`

        if (pfp!== 'Nessuna foto o privata') {
            await conn.sendMessage(m.chat, { image: { url: pfp }, caption: info }, { quoted: m })
        } else {
            m.reply(info)
        }

    } catch (e) {
        console.log(e)
        m.reply(`❌ *ERRORE / PROBABILE BAN*\nNumero: +${number}\n\nNon riesco a recuperare info. Il numero potrebbe essere bannato, inesistente o con privacy alta.`)
    }
}

handler.help = ['checkban <numero>']
handler.tags = ['tools']
handler.command = /^checkban(ban)?$/i

export default handler