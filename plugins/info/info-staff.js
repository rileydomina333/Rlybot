//plugin by Giuse
let handler = async (m, { conn }) => {

    // Newsletter globale ChatUnity
    const cuContext = {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363259442839354@newsletter',
            serverMessageId: 100,
            newsletterName: `𝐑𝐋𝐘𝐁𝐎𝐓-𝐌𝐃 ⸸ Staff Ufficiale`
        }
    };

    // Schede di contatto (vCard)
    const vcards = [
        { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Vale | CEO;;;\nFN:Vale | CEO\nORG:𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲\nTITLE:CEO\nitem1.TEL;waid=393773842461:+39 377 384 2461\nitem1.X-ABLabel:Cellulare\nEND:VCARD` },
        { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Diego;;;\nFN:Diego\nORG:𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲\nTITLE:Staff\nitem1.TEL;waid=393520583119:+39 352 058 3119\nitem1.X-ABLabel:Cellulare\nEND:VCARD` },
        { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Matte;;;\nFN:Matte\nORG:𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲\nTITLE:Staff\nitem1.TEL;waid=66621409462:+66 62 140 9462\nitem1.X-ABLabel:Cellulare\nEND:VCARD` },
        { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Giuse;;;\nFN:Giuse\nORG:𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲\nTITLE:Staff\nitem1.TEL;waid=393291944932:+39 329 194 4932\nitem1.X-ABLabel:Cellulare\nEND:VCARD` }
    ];

    // Testo elegante con i numeri in chiaro
    let testo = `
୧・︶ ⸸ 𝐑𝐋𝐘𝐁𝐎𝐓-𝐌𝐃 ⸸ ︶・୨
꒷꒦ ‧₊ 🛡️ 𝐒 𝐓 𝐀 𝐅 𝐅 🛡️ ₊‧ ꒷꒦
୧・︶ : ︶ : ︶ : ︶ : ︶ : ︶・୨

⸸ 👑 +1 5482861344 ~ Riley |OWN|
⸸ 👨‍💻 +39 350 198 9497 ~ endy
⸸ 👨‍💻 +81 70-9491-4530 ~ lexa
⸸ 🦾 +7 7011947373 ~ numero bot

👑 _Il team dietro 𝐑𝐋𝐘𝐁𝐎𝐓-𝐌𝐃._
୧・︶ : ︶ ꒷꒦ ‧₊ ୧`.trim();

    // 1. Invia le schede contatto (rubrica)
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: 'Staff 𝐑𝐋𝐘𝐁𝐎𝐓-𝐌𝐃',
            contacts: vcards
        },
        contextInfo: cuContext
    }, { quoted: m });

    // 2. Invia il testo stilizzato
    await conn.sendMessage(m.chat, {
        text: testo,
        contextInfo: cuContext
    });

};

handler.help = ['staff', 'owner', 'creatori'];
handler.tags = ['info'];
handler.command = /^(staff|owner|creatori|founder)$/i;

export default handler;
