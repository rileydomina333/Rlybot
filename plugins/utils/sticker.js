import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/image|video|webp/.test(mime)) 
        return m.reply(`Rispondi a una foto/video/gif con ${usedPrefix + command}`)
    
    if (/video/.test(mime) && (q.msg || q).seconds > 10) 
        return m.reply('Video max 10 secondi')
    
    await m.react('⏳')
    
    try {
        let media = await q.download()
        if (!media) throw 'Errore download'
        
        let stickerOptions = {
            packname: global.packname || 'RLY BOT',
            author: global.author || 'Sticker'
        }
        
        // Baileys 6.x ha sendImageAsSticker/sendVideoAsSticker integrato
        if (/image/.test(mime)) {
            await conn.sendImageAsSticker(m.chat, media, m, stickerOptions)
        } else if (/video/.test(mime)) {
            await conn.sendVideoAsSticker(m.chat, media, m, stickerOptions)
        } else if (/webp/.test(mime)) {
            await conn.sendMessage(m.chat, { sticker: media }, { quoted: m })
        }
        
        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(`Errore: ${e.message || e}\n\nControlla che ffmpeg sia installato sul server.`)
    }
}

handler.help = ['sticker', 's']
handler.tags = ['converter'] 
handler.command = /^s(tic?ker)?$/i

export default handler