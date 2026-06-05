let handler = async (m, { conn, command, usedPrefix }) => {
    let staff = `
💠『 𝐒𝐓𝐀𝐅𝐅 𝙍𝙄𝙇𝙀𝙔 𝘽𝙊𝙏』💠

╭───────────────╮
│ 🤖 Bot: ${global.nomebot}
│ 🆚 Versione: ${global.versione}
╰───────────────╯

╭─── 👑 *_CREATORE_* ───╮
│ ✦ Nome: Riley
│ ✦ Ruolo: Creatore / Dev
│ ✦ Contatto: @25776236110
╰────────────────────╯

╭─── 🛡️ *_STAFF_* ───╮
│ ✦ Elixir
│   ├ Ruolo: *Staffer*
│   └ Contatto: @2348174457298
│
│ ✦ deadly
│   ├ Ruolo: *Staffer*
│   └Contatto: @212784392820
│
│
│ ✦ Moon
│   ├ Ruolo: *Collaboratore*
│   └Contatto: @393509594333
╰────────────────────╯

╭─── 📌 INFO UTILI ───╮
│ ✦ GitHub: github.com/rileydomina333
│ ✦ Supporto: @584163724695
╰────────────────────╯

💠 𝙍𝙄𝙇𝙀𝙔 𝘽𝙊𝙏 💠

    await conn.reply(
        m.chat, 
        staff.trim(), 
        m, 
        { 
            contextInfo: {
                mentionedJid: ['393509594333@s.whatsapp.net', '25776236110@s.whatsapp.net', '212784392820@s.whatsapp.net']
            }
        }
    );

    await conn.sendMessage(m.chat, {
        contacts: {
            contacts: [
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:Riley
ORG:𝙍𝙄𝙇𝙀𝙔 𝘽𝙊𝙏 - Creatore
TEL;type=CELL;type=VOICE;waid=+25776236110:+584163724695
END:VCARD`
                },
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:Deadly
ORG:𝙍𝙄𝙇𝙀𝙔 𝘽𝙊𝙏 - Staffer
TEL;type=CELL;type=VOICE;waid=393509594333:+212784392820
END:VCARD`
                },
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:elixir
ORG:𝙍𝙄𝙇𝙀𝙔 𝘽𝙊𝙏 - Staffer
TEL;type=CELL;type=VOICE;waid=2348174457298:+2348174457298
END:VCARD`
                }
            ]
        }
    }, { quoted: m });

    m.react('💠');
};

handler.help = ['staff'];
handler.tags = ['main'];
handler.command = ['staff', 'moderatori', 'collaboratori'];

export default handler;