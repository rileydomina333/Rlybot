import { sticker } from '../lib/sticker.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    
    if (!/image|video|webp/.test(mime)) 
        return m.reply(`Rispondi a una foto/video/gif o invia con didascalia\nEsempio: ${usedPrefix + command}`)
    
    if (/video/.test(mime) && (q.msg || q).seconds > 10) 
        return m.reply('Video troppo lungo! Max 10 secondi.')
    
    let img = await q.download?.()
    if (!img) return m.reply('Errore download media. Riprova.')
    
    // Packname e author dello sticker
    let packname = args[0] ? args.join(' ') : 'RLY BOT'
    let author = global.author || 'WhatsApp'
    
    try {
        let stiker = await sticker(img, false, packname, author)
        await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
    } catch (e) {
        console.error(e)
        m.reply('Errore creazione sticker. Usa un formato valido: jpg, png, mp4, gif')
    }
}

handler.help = ['sticker', 's']
handler.tags = ['converter']
handler.command = /^s(tic?ker)?$/i

export default handler