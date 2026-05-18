// by deadly

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ 𝐑𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌: Inserisci il testo che devo pronunciare.*\n\n*Esempio:* _${usedPrefix}${command} Ciao a tutti_`)

    try {
        let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=it&client=tw-ob`

        let res = await fetch(ttsUrl)
        if (!res.ok) throw new Error()
        let buffer = await res.buffer()

        await conn.sendFile(m.chat, buffer, 'tts.mp3', '', m, true, {
            mimetype: 'audio/mp4',
            ptt: true
        })

    } catch (e) {
        return m.reply('*❌ 𝐑𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌: Impossibile generare l\'audio in questo momento.*')
    }
}

handler.help = ['parla']
handler.tags = ['group', 'fun']
handler.command = /^(parla|tts)$/i

handler.group = true

export default handler
