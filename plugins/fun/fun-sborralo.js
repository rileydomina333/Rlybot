import { performance } from "perf_hooks";

// Funzione per selezionare un elemento casuale da un array
function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

let handler = async (m, { conn, text }) => {
    let destinatario;

    // Se è una risposta a un messaggio
    if (m.quoted && m.quoted.sender) {
        destinatario = m.quoted.sender;
    }
    // Se ci sono utenti menzionati
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        destinatario = m.mentionedJid[0];
    }
    // Se non c'è nulla
    else {
        return m.reply("Tagga qualcuno o rispondi a un messaggio per iniziare l'imbiancamento.");
    }

    let nomeDestinatario = `@${destinatario.split('@')[0]}`;

    // Messaggi personalizzati
    let sequenza = [
        `*inizio a segarmi su*🥵*${nomeDestinatario}*...`,
        " *mi sta pulsando preparati*🍆...",
        "*preparati alla sborrata*💦💦"
    ];

    // Invia i messaggi uno alla volta
    for (let msg of sequenza) {
        await m.reply(msg, null, { mentions: [destinatario] });
    }

    // Calcolo del tempo
    let startTime = performance.now();
    // Finto tempo di elaborazione (puoi sostituirlo con operazioni reali)
    let endTime = performance.now();
    let elapsedTime = (endTime - startTime).toFixed(2);

    let resultMessage = `✨ *${nomeDestinatario}*  *è stato/a imbiancato da riley*,🤤 *mi hai fatto venire dopo*😏 *${elapsedTime}*ms*!`;
    conn.reply(m.chat, resultMessage, m, { mentions: [destinatario] });
};


handler.command = /^(sega2|segariley)$/i;
handler.help = ['sega2', 'segariley'];  
handler.tags = ['giochi']; 
export default handler;
