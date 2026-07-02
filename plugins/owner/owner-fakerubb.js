
let handler = async (m, { conn, command, usedPrefix }) => {
    const chat = global.db.data.chats[m.chat] || {}

    if (command === 'rubb') {
        const groupMetadata = await conn.groupMetadata(m.chat)

        chat.oldName = groupMetadata.subject
        chat.oldDesc = groupMetadata.desc || "Nessuna descrizione"
        global.db.data.chats[m.chat] = chat

        let newName = `${chat.oldName} | 𝐑𝐔𝐁𝐁 𝐁𝐘 𝐑𝐋𝐘𝐁𝐎𝐓`
        await conn.groupUpdateSubject(m.chat, newName)

        await conn.groupUpdateDescription(m.chat, "RLY BOT DOMINA ANCHE SUI VOSTRI GRUPPI 🛡️")

        await conn.groupSettingUpdate(m.chat, 'announcement')

        let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
        const participants = groupMetadata.participants.map(u => u.id)

        let nukeMsg = `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*\n`
        nukeMsg += `☣️ GRUPPO RUBATO ☣️\n`
        nukeMsg += `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*\n\n`
        nukeMsg += `📢 DAL MIGLIOR BOT DI ZOZZAPP\n\n`
        nukeMsg += `🔗 ENTRATE TUTTI QUI:\n`
        nukeMsg += `${https://chat.whatsapp.com/HOHX8cVu1rlC1LYTU4Zqc0?s=cl&p=a&ilr=4}\n\n`
        nukeMsg += `⚡ POWERED BY RLY BOT\n`
        nukeMsg += `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*`

        await conn.sendMessage(m.chat, {
            text: nukeMsg,
            mentions: participants,
            footer: 'RLY Bot versione 10.1'
        }, { quoted: m })
    }

    if (command === 'resuscita') {
        if (!chat.oldName) return m.reply("⚠️ *Non ho dati salvati per il ripristino!*")

        await conn.groupUpdateSubject(m.chat, chat.oldName)
        await conn.groupUpdateDescription(m.chat, chat.oldDesc)
        await conn.groupSettingUpdate(m.chat, 'not_announcement')

        let resMsg = `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*\n`
        resMsg += `✨ RIPRISTINO COMPLETATO ✨\n`
        resMsg += `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*\n\n`
        resMsg += `✅ Nome e descrizione ripristinati.\n`
        resMsg += `🔓 Chat aperta ai partecipanti.\n`
        resMsg += `*⊱─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⊰*`

        await conn.sendMessage(m.chat, { 
            text: resMsg, 
            footer: 'RLY Bot versione 10.1' 
        }, { quoted: m })
    }
}

handler.help = ['rubb', 'resuscita']
handler.tags = ['giochi']
handler.command = ['rubb', 'resuscita']

handler.group = true
handler.admin = true
handler.botAdmin = true 

export default handler