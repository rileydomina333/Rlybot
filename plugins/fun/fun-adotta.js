
const adozioni = {}; // richieste pendenti

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

let handler = async (m, { conn, command, text, usedPrefix }) => {
  const userId = m.sender;
  const groupId = m.chat;
  const users = global.db?.data?.users || {};
  const user = users[userId];

  if (!user) throw '❌ Utente non registrato.';

  // Inizializza campi adozione
  if (!user.figli) user.figli = [];
  if (!user.genitore) user.genitore = null;
  if (!user.orfanotrofio) user.orfanotrofio = false;

  switch (command) {
    case 'adotta':
    case 'adopt':
      await handleAdotta(m, user, users, usedPrefix, conn, userId, groupId);
      break;
    case 'abbandona':
    case 'abandon':
      await handleAbbandona(m, user, users, conn, userId, groupId);
      break;
    case 'orfanotrofio':
    case 'orphanage':
      await handleOrfanotrofio(m, users, conn, userId, groupId);
      break;
    case 'famiglia':
    case 'family':
      await handleFamiglia(m, user, users, conn, userId, groupId);
      break;
    case 'diseredita':
    case 'disown':
      await handleDiseredita(m, user, users, conn, userId, groupId);
      break;
    case 'scappa':
    case 'runaway':
      await handleScappa(m, user, users, conn, userId, groupId);
      break;
  }
};

// ═══════════════════════════════════════════
// .adotta @utente — Adotta un utente
// ═══════════════════════════════════════════
async function handleAdotta(m, user, users, usedPrefix, conn, userId, groupId) {
  const mention = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
  if (!mention) throw `❌ Devi menzionare qualcuno!\n📌 Usa: *${usedPrefix}adotta @utente*`;
  if (mention === userId) throw '❌ Non puoi adottare te stesso, narcisista! 😒';

  const target = users[mention];
  if (!target) throw '❌ Quell\'utente non è registrato.';

  // Inizializza
  if (!target.figli) target.figli = [];
  if (!target.genitore) target.genitore = null;

  if (target.genitore) {
    const genitoreNome = target.genitore.split('@')[0];
    throw `❌ @${mention.split('@')[0]} ha già un genitore (*${genitoreNome}*)! Deve prima essere abbandonato o scappare.`;
  }

  if (user.figli.includes(mention)) throw `❌ @${mention.split('@')[0]} è già tuo/a figlio/a! 👨‍👧`;
  if (user.figli.length >= 5) throw '❌ Hai già 5 figli! Non puoi adottarne altri. 🏠';
  if (user.genitore === mention) throw '❌ Non puoi adottare il tuo genitore! 🤯';

  // Controlla richieste pendenti
  if (adozioni[mention]) throw '❌ C\'è già una richiesta di adozione pendente per questo utente!';

  // Costo adozione
  const costo = 500;
  if ((user.limit || 0) < costo) throw `❌ Servono almeno *${costo} UC* per adottare qualcuno! 💶`;

  adozioni[mention] = { from: userId, timeout: null };

  const frasi = [
    `🍼 @${userId.split('@')[0]} vuole adottare @${mention.split('@')[0]}!\n\n👶 Rispondi con *sì* o *no* entro 60 secondi!`,
    `🏠 @${userId.split('@')[0]} ha aperto le porte di casa sua a @${mention.split('@')[0]}!\n\n💕 Accetti di essere adottato/a? Rispondi *sì* o *no*!`,
    `👨‍👧 @${userId.split('@')[0]} vuole prendere sotto la sua ala @${mention.split('@')[0]}!\n\n🎀 Che dici, accetti? *sì* / *no*`
  ];

  await conn.sendMessage(groupId, {
    text: pickRandom(frasi),
    mentions: [mention, userId]
  }, { quoted: m });

  // Timeout 60 secondi
  adozioni[mention].timeout = setTimeout(() => {
    if (adozioni[mention]) {
      conn.sendMessage(groupId, {
        text: `⏰ La richiesta di adozione di @${userId.split('@')[0]} per @${mention.split('@')[0]} è scaduta!`,
        mentions: [userId, mention]
      });
      delete adozioni[mention];
    }
  }, 60000);
}

// ═══════════════════════════════════════════
// Gestione risposte adozione (sì/no)
// ═══════════════════════════════════════════
handler.before = async function (m, { conn }) {
  const userId = m.sender;
  const users = global.db?.data?.users || {};

  if (!adozioni[userId]) return;

  const risposta = m.text?.toLowerCase().trim();
  if (risposta !== 'sì' && risposta !== 'si' && risposta !== 'no') return;

  const { from } = adozioni[userId];
  const genitore = users[from];
  const figlio = users[userId];

  clearTimeout(adozioni[userId].timeout);
  delete adozioni[userId];

  if (risposta === 'no') {
    return conn.sendMessage(m.chat, {
      text: `💔 @${userId.split('@')[0]} ha rifiutato l'adozione di @${from.split('@')[0]}...`,
      mentions: [userId, from]
    });
  }

  // Accettato!
  const costo = 500;
  if ((genitore.limit || 0) < costo) {
    return conn.sendMessage(m.chat, {
      text: `❌ @${from.split('@')[0]} non ha più abbastanza UC per l'adozione!`,
      mentions: [from]
    });
  }

  genitore.limit -= costo;
  if (!genitore.figli) genitore.figli = [];
  genitore.figli.push(userId);
  figlio.genitore = from;
  figlio.orfanotrofio = false;

  const frasi = [
    `🎉🍼 È UFFICIALE! @${from.split('@')[0]} ha adottato @${userId.split('@')[0]}!\n\n👨‍👧 Benvenuto/a in famiglia! 💕\n💸 Costo adozione: ${costo} UC`,
    `🏠✨ NUOVA FAMIGLIA! @${userId.split('@')[0]} è stato/a adottato/a da @${from.split('@')[0]}!\n\n🎀 Che bello, una nuova casa! 🥰\n💸 -${costo} UC`,
    `👨‍👧‍👦 ADOZIONE COMPLETATA!\n@${from.split('@')[0]} → genitore\n@${userId.split('@')[0]} → figlio/a\n\n🎊 La famiglia si allarga! 💕\n💸 -${costo} UC`
  ];

  await conn.sendMessage(m.chat, {
    text: pickRandom(frasi),
    mentions: [from, userId]
  });

  await conn.sendMessage(m.chat, { react: { text: '👨‍👧', key: m.key } });
};

// ═══════════════════════════════════════════
// .abbandona @figlio — Abbandona un figlio
// ═══════════════════════════════════════════
async function handleAbbandona(m, user, users, conn, userId, groupId) {
  const mention = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
  if (!mention) throw '❌ Devi menzionare il figlio da abbandonare!';

  if (!user.figli || !user.figli.includes(mention)) {
    throw `❌ @${mention.split('@')[0]} non è tuo/a figlio/a!`;
  }

  const figlio = users[mention];
  user.figli = user.figli.filter(f => f !== mention);
  if (figlio) {
    figlio.genitore = null;
    figlio.orfanotrofio = true;
  }

  const frasi = [
    `😢 @${userId.split('@')[0]} ha abbandonato @${mention.split('@')[0]}...\n\n🏚️ @${mention.split('@')[0]} è stato/a mandato/a all'orfanotrofio.`,
    `💔 @${userId.split('@')[0]} ha lasciato @${mention.split('@')[0]} all'orfanotrofio...\n\n🧸 Povero/a piccolo/a...`,
    `🚪 @${userId.split('@')[0]} ha chiuso la porta in faccia a @${mention.split('@')[0]}!\n\n🏚️ Nuovo residente dell'orfanotrofio...`
  ];

  await conn.sendMessage(groupId, {
    text: pickRandom(frasi),
    mentions: [userId, mention]
  }, { quoted: m });

  await conn.sendMessage(m.chat, { react: { text: '😢', key: m.key } });
}

// ═══════════════════════════════════════════
// .orfanotrofio — Lista degli orfani disponibili
// ═══════════════════════════════════════════
async function handleOrfanotrofio(m, users, conn, userId, groupId) {
  let orfani = [];

  for (const [jid, u] of Object.entries(users)) {
    if (u.orfanotrofio === true && !u.genitore) {
      orfani.push(jid);
    }
  }

  if (orfani.length === 0) {
    return conn.sendMessage(groupId, {
      text: '🏠 L\'orfanotrofio è vuoto! Nessun bambino in attesa di adozione. 🎉',
    }, { quoted: m });
  }

  let lista = '🏚️ *ORFANOTROFIO* 🏚️\n\n';
  lista += '👶 Bambini in attesa di adozione:\n\n';

  orfani.slice(0, 20).forEach((jid, i) => {
    lista += `${i + 1}. @${jid.split('@')[0]}\n`;
  });

  if (orfani.length > 20) {
    lista += `\n... e altri ${orfani.length - 20} orfani.`;
  }

  lista += `\n\n📌 Usa *.adotta @utente* per adottare!`;
  lista += `\n👥 Totale orfani: ${orfani.length}`;

  await conn.sendMessage(groupId, {
    text: lista,
    mentions: orfani.slice(0, 20)
  }, { quoted: m });
}

// ═══════════════════════════════════════════
// .famiglia — Mostra il tuo albero familiare
// ═══════════════════════════════════════════
async function handleFamiglia(m, user, users, conn, userId, groupId) {
  let mention = m.mentionedJid?.[0] || userId;
  let target = users[mention];
  if (!target) throw '❌ Utente non trovato!';

  if (!target.figli) target.figli = [];

  let testo = `👨‍👧‍👦 *FAMIGLIA DI* @${mention.split('@')[0]}\n\n`;

  // Genitore
  if (target.genitore) {
    testo += `👑 Genitore: @${target.genitore.split('@')[0]}\n`;
  } else {
    testo += `👑 Genitore: Nessuno\n`;
  }

  // Coniuge (se esiste dal sistema sposa)
  if (target.sposato && target.coniuge) {
    testo += `💍 Coniuge: @${target.coniuge.split('@')[0]}\n`;
  }

  // Figli
  testo += `\n👶 Figli (${target.figli.length}/5):\n`;
  if (target.figli.length === 0) {
    testo += '  Nessun figlio adottato\n';
  } else {
    target.figli.forEach((f, i) => {
      testo += `  ${i + 1}. @${f.split('@')[0]}\n`;
    });
  }

  // Fratelli (altri figli dello stesso genitore)
  if (target.genitore && users[target.genitore]?.figli) {
    const fratelli = users[target.genitore].figli.filter(f => f !== mention);
    if (fratelli.length > 0) {
      testo += `\n👫 Fratelli/Sorelle:\n`;
      fratelli.forEach((f) => {
        testo += `  • @${f.split('@')[0]}\n`;
      });
    }
  }

  // Status
  testo += `\n📍 Stato: ${target.orfanotrofio ? '🏚️ In orfanotrofio' : '🏠 In famiglia'}`;

  const mentions = [mention];
  if (target.genitore) mentions.push(target.genitore);
  if (target.coniuge) mentions.push(target.coniuge);
  if (target.figli.length > 0) mentions.push(...target.figli);
  if (target.genitore && users[target.genitore]?.figli) {
    mentions.push(...users[target.genitore].figli.filter(f => f !== mention));
  }

  await conn.sendMessage(groupId, {
    text: testo,
    mentions: [...new Set(mentions)]
  }, { quoted: m });
}

// ═══════════════════════════════════════════
// .diseredita @figlio — Diseredita un figlio (più cattivo)
// ═══════════════════════════════════════════
async function handleDiseredita(m, user, users, conn, userId, groupId) {
  const mention = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
  if (!mention) throw '❌ Devi menzionare il figlio da diseredare!';

  if (!user.figli || !user.figli.includes(mention)) {
    throw `❌ @${mention.split('@')[0]} non è tuo/a figlio/a!`;
  }

  const figlio = users[mention];
  user.figli = user.figli.filter(f => f !== mention);

  if (figlio) {
    figlio.genitore = null;
    figlio.orfanotrofio = true;
    // Perde un po' di UC per il trauma
    const perso = Math.min(figlio.limit || 0, 200);
    figlio.limit = (figlio.limit || 0) - perso;
  }

  await conn.sendMessage(groupId, {
    text: `⚡ @${userId.split('@')[0]} ha *DISEREDATO* @${mention.split('@')[0]}!\n\n📜 Tagliato fuori dalla famiglia!\n🏚️ Mandato/a all'orfanotrofio\n💸 Ha perso 200 UC per il trauma emotivo 😭`,
    mentions: [userId, mention]
  }, { quoted: m });
}

// ═══════════════════════════════════════════
// .scappa — Scappa dal genitore
// ═══════════════════════════════════════════
async function handleScappa(m, user, users, conn, userId, groupId) {
  if (!user.genitore) throw '❌ Non hai un genitore da cui scappare!';

  const genitoreJid = user.genitore;
  const genitore = users[genitoreJid];

  if (genitore?.figli) {
    genitore.figli = genitore.figli.filter(f => f !== userId);
  }

  user.genitore = null;
  user.orfanotrofio = true;

  const frasi = [
    `🏃 @${userId.split('@')[0]} è SCAPPATO/A da @${genitoreJid.split('@')[0]}!\n\n🌙 Ha fatto le valigie di notte e se n'è andato/a...\n🏚️ Ora è all'orfanotrofio.`,
    `🚪 @${userId.split('@')[0]} ha sbattuto la porta e se n'è andato/a!\n\n😤 "Non sei il mio vero genitore!" ha urlato a @${genitoreJid.split('@')[0]}\n🏚️ Ora vive all'orfanotrofio.`,
    `🧳 @${userId.split('@')[0]} ha preso il suo orsacchiotto e se n'è andato/a!\n\n💔 @${genitoreJid.split('@')[0]} è rimasto/a solo/a...\n🏚️ Destinazione: orfanotrofio`
  ];

  await conn.sendMessage(groupId, {
    text: pickRandom(frasi),
    mentions: [userId, genitoreJid]
  }, { quoted: m });

  await conn.sendMessage(m.chat, { react: { text: '🏃', key: m.key } });
}

handler.help = [
  'adotta @utente — Adotta qualcuno (500 UC)',
  'abbandona @utente — Abbandona un figlio',
  'orfanotrofio — Lista orfani disponibili',
  'famiglia — Mostra albero familiare',
  'diseredita @utente — Diseredita un figlio',
  'scappa — Scappa dal tuo genitore'
];
handler.tags = ['fun', 'rpg'];
handler.command = /^(adotta|adopt|abbandona|abandon|orfanotrofio|orphanage|famiglia|family|diseredita|disown|scappa|runaway)$/i;
handler.register = true;
handler.group = true;

export default handler;
