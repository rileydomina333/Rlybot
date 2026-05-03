let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝚂𝚅𝚃 𝙱𝚢 𝙻𝙴𝚇𝙰`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    await conn.sendMessage(m.chat, {
        text: "𝐋𝐄𝐗𝐀 𝐄̀ 𝐐𝐔𝐈 𝐄 𝐋𝐀𝐒𝐂𝐄𝐑𝐀̀ 𝐋𝐄 𝐂𝐈𝐂𝐀𝐓𝐑𝐈𝐂𝐈 𝐒𝐔𝐋𝐋𝐀 𝐕𝐎𝐒𝐓𝐑𝐀 𝐏𝐄𝐋𝐋𝐄, 𝐄𝐒𝐏𝐀𝐍𝐃𝐄𝐍𝐃𝐎 𝐈𝐋 𝐒𝐔𝐎 𝐃𝐎𝐌𝐈𝐍𝐎 𝐀𝐍𝐂𝐇𝐄 𝐐𝐔𝐈."
    });

    await conn.sendMessage(m.chat, {
        text: "𝑶𝑹𝑨 𝑬𝑵𝑻𝑹𝑨𝑻𝑬 𝑻𝑼𝑻𝑻𝑰 𝑸𝑼𝑰:\n\nhttps://https://chat.whatsapp.com/JTKER5857iy3JdnebDmpQ6?mode=gi_t",
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['lexadomina'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;
