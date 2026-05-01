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
        let newName = `${oldName} | 𝑺𝑽𝑻 𝑩𝒀 ⸸ჩίļξϒ⸸ |`;
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
        text: "𝘚𝘐𝘌𝘛𝘌 𝘈𝘗𝘗𝘌𝘕𝘈 𝘚𝘛𝘈𝘛𝘐 𝘈𝘛𝘛𝘌𝘕𝘜𝘈𝘛𝘐 𝘍𝘐𝘕𝘖 𝘈𝘓𝘓𝘖 𝘚𝘍𝘐𝘕𝘐𝘔𝘌𝘕𝘛𝘖 𝘋𝘈 𝘙𝘐𝘓𝘌𝘠, 𝘐𝘓 𝘝𝘖𝘚𝘛𝘙𝘖 𝘗𝘈𝘋𝘙𝘖𝘕𝘌,𝘕𝘌𝘚𝘚𝘜𝘕𝘖 𝘏𝘈 𝘗𝘐𝘜̀ 𝘋𝘐𝘙𝘐𝘛𝘛𝘖 𝘋𝘐 𝘗𝘈𝘙𝘖𝘓𝘈 𝘖𝘓𝘛𝘙𝘌 𝘔𝘌 𝘌̀ 𝘍𝘈𝘙𝘌𝘛𝘌 𝘊𝘐𝘖̀ 𝘊𝘏𝘌 𝘋𝘐𝘊𝘖 𝘐𝘖 𝘋𝘈 𝘉𝘙𝘈𝘝𝘐 𝘊𝘈𝘕𝘐. "."
    });

    await conn.sendMessage(m.chat, {
        text: "𝘈𝘊𝘊𝘌𝘛𝘛𝘈𝘛𝘌 𝘊𝘖𝘔𝘌 𝘚𝘐𝘈𝘕𝘖 𝘈𝘕𝘋𝘈𝘛𝘌 𝘓𝘌 𝘊𝘖𝘚𝘌 𝘌 𝘚𝘗𝘖𝘚𝘛𝘐𝘈𝘔𝘖𝘊𝘊𝘐 𝘘𝘜𝘐: https://chat.whatsapp.com/DzFZQAjKEBp8T0SIDW9j23?mode=gi_t",
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
