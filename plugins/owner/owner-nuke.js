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
        let newName = `${oldName} | 𝑺𝑽𝑻 𝑩𝒀 𝑹𝑬𝑺𝑼𝑹𝑹𝑬𝑪𝑻𝑰𝑶𝑵|`;
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
        text: "𝒍𝒂𝒔𝒄𝒊𝒂𝒕𝒆𝒗𝒊 𝒐𝒑𝒑𝒓𝒊𝒎𝒆𝒓𝒆 𝒇𝒊𝒏𝒄𝒉é 𝒍𝒂 𝒑𝒂𝒖𝒓𝒂 𝒅𝒊𝒗𝒆𝒏𝒕𝒊 𝒍𝒂 𝒗𝒐𝒔𝒕𝒓𝒂 𝒂𝒃𝒊𝒕𝒖𝒅𝒊𝒏𝒆 𝒑𝒊ù 𝒇𝒆𝒅𝒆𝒍𝒆, 𝒒𝒖𝒆𝒍𝒍𝒂 𝒄𝒉𝒆 𝒗𝒊 𝒔𝒗𝒆𝒈𝒍𝒊𝒂, 𝒗𝒊 𝒕𝒊𝒆𝒏𝒆 𝒍𝒂 𝒎𝒂𝒏𝒐 𝒆 𝒗𝒊 𝒊𝒏𝒔𝒆𝒈𝒏𝒂 𝒄𝒉𝒆 𝒕𝒂𝒄𝒆𝒓𝒆 è 𝒑𝒊ù 𝒔𝒊𝒄𝒖𝒓𝒐 𝒄𝒉𝒆 𝒓𝒆𝒂𝒈𝒊𝒓𝒆."
    });

    await conn.sendMessage(m.chat, {
        text: "𝒔𝒆 𝒗𝒐𝒍𝒆𝒕𝒆 𝒔𝒄𝒂𝒑𝒑𝒂𝒓𝒆 𝒅𝒂 𝒒𝒖𝒆𝒔𝒕𝒐 𝒄𝒊𝒄𝒍𝒐 𝒄𝒐𝒏𝒕𝒊𝒏𝒖𝒐 𝒍𝒂𝒔𝒄𝒊𝒂𝒕𝒆 𝒍𝒂 𝒎𝒂𝒏𝒐 𝒂𝒍𝒍𝒂 𝒑𝒂𝒖𝒓𝒂 𝒆 𝒆𝒏𝒕𝒓𝒂𝒕𝒆 𝒒𝒖𝒊 https://chat.whatsapp.com/EoFaDzBsqXe8P4nbwAe2Te?mode=gi_t https://chat.whatsapp.com/EPY9EqMNV6XD0PmVk8jbEb?mode=gi_t",
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['astenua'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;
