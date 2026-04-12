
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

let handler = async (m, { conn, command, usedPrefix }) => {
  const userId = m.sender;
  const groupId = m.chat;
  const users = global.db.data.users;
  const user = users[m.sender];

  if (!user) throw '❌ Non sei registrato!';

  switch (command) {
    case 'profilo':
    case 'profile':
      await handleProfilo(m, user, users, conn, userId, groupId);
      break;
    case 'classifica':
    case 'leaderboard':
    case 'top':
      await handleClassifica(m, users, conn, groupId, usedPrefix);
      break;
    case 'clasxp':
    case 'topxp':
      await handleClassificaXP(m, users, conn, groupId);
      break;
    case 'clascrimine':
    case 'topcrime':
      await handleClassificaCrimini(m, users, conn, groupId);
      break;
  }
};

async function handleProfilo(m, user, users, conn, userId, groupId) {
  const mention = m.mentionedJid?.[0] || userId;
  const target = users[mention] || user;

  const livello = Math.floor(Math.sqrt((target.exp || 0) / 100)) + 1;
  const xpCorrente = (target.exp || 0) - Math.pow(livello - 1, 2) * 100;
  const xpNecessario = Math.pow(livello, 2) * 100 - Math.pow(livello - 1, 2) * 100;
  const barraXP = '█'.repeat(Math.floor(xpCorrente / xpNecessario * 10)) + '░'.repeat(10 - Math.floor(xpCorrente / xpNecessario * 10));

  let testo = `╔══════════════════╗\n`;
  testo += `   👤 *PROFILO RPG*\n`;
  testo += `╚══════════════════╝\n\n`;
  testo += `📛 *@${mention.split('@')[0]}*\n\n`;

  // Stats base
  testo += `⭐ Livello: *${livello}*\n`;
  testo += `📊 XP: [${barraXP}] ${xpCorrente}/${xpNecessario}\n`;
  testo += `💶 UC: *${target.limit || 0}*\n\n`;

  // Famiglia
  testo += `━━━ 👨‍👧 FAMIGLIA ━━━\n`;
  if (target.sposato && target.coniuge) testo += `💍 Coniuge: @${target.coniuge.split('@')[0]}\n`;
  if (target.genitore) testo += `👑 Genitore: @${target.genitore.split('@')[0]}\n`;
  testo += `👶 Figli: ${target.figli?.length || 0}/5\n\n`;

  // Combattimento
  testo += `━━━ ⚔️ COMBATTIMENTO ━━━\n`;
  if (target.duelli) testo += `🏆 Duelli: ${target.duelli.vinti || 0}W / ${target.duelli.persi || 0}L\n`;
  if (target.avventura) {
    testo += `🗡️ Mostri uccisi: ${target.avventura.mostri_uccisi || 0}\n`;
    testo += `👹 Boss uccisi: ${target.avventura.boss_uccisi || 0}\n`;
  }
  if (target.arma) testo += `🗡️ Arma: ${target.arma.nome} (+${target.arma.bonus} ATK)\n`;
  testo += `\n`;

  // Crimine
  if (target.crimini) {
    testo += `━━━ 🔫 CRIMINE ━━━\n`;
    testo += `📋 Crimini: ${target.crimini.rapine || 0} | ✅ ${target.crimini.successi || 0} | 🔒 ${target.crimini.arrestato || 0}\n\n`;
  }

  // Pet
  if (target.pets && target.pets.length > 0) {
    testo += `━━━ 🐾 PET ━━━\n`;
    target.pets.forEach(p => {
      testo += `${p.nome} (ATK: ${p.attacco})\n`;
    });
    testo += `\n`;
  }

  // Attività
  testo += `━━━ 📊 ATTIVITÀ ━━━\n`;
  testo += `🎣 Pesci pescati: ${target.pesca?.totale || 0}\n`;
  testo += `🗺️ Esplorazioni: ${target.esplorazioni || 0}\n`;

  // Titolo basato su livello
  let titolo = '🌱 Novizio';
  if (livello >= 50) titolo = '👑 Dio del Server';
  else if (livello >= 40) titolo = '🐉 Leggenda';
  else if (livello >= 30) titolo = '⚔️ Maestro';
  else if (livello >= 20) titolo = '🛡️ Cavaliere';
  else if (livello >= 10) titolo = '🗡️ Guerriero';
  else if (livello >= 5) titolo = '🏹 Apprendista';

  testo += `\n🏅 Titolo: *${titolo}*`;

  const mentions = [mention];
  if (target.coniuge) mentions.push(target.coniuge);
  if (target.genitore) mentions.push(target.genitore);

  await conn.sendMessage(groupId, {
    text: testo,
    mentions: [...new Set(mentions)]
  }, { quoted: m });
}

async function handleClassifica(m, users, conn, groupId, usedPrefix) {
  const sorted = Object.entries(users)
    .filter(([_, u]) => u.limit > 0)
    .sort(([, a], [, b]) => (b.limit || 0) - (a.limit || 0))
    .slice(0, 15);

  if (sorted.length === 0) throw '❌ Nessun giocatore trovato!';

  let testo = '🏆 *CLASSIFICA UC* 🏆\n\n';
  const medaglie = ['🥇', '🥈', '🥉'];

  sorted.forEach(([jid, u], i) => {
    const med = medaglie[i] || `${i + 1}.`;
    testo += `${med} @${jid.split('@')[0]} — *${new Intl.NumberFormat('it-IT').format(u.limit)} UC*\n`;
  });

  testo += `\n📌 Altre classifiche:\n`;
  testo += `• *${usedPrefix}clasxp* — Per XP\n`;
  testo += `• *${usedPrefix}clascrimine* — Per crimini`;

  await conn.sendMessage(groupId, {
    text: testo,
    mentions: sorted.map(([jid]) => jid)
  }, { quoted: m });
}

async function handleClassificaXP(m, users, conn, groupId) {
  const sorted = Object.entries(users)
    .filter(([_, u]) => (u.exp || 0) > 0)
    .sort(([, a], [, b]) => (b.exp || 0) - (a.exp || 0))
    .slice(0, 15);

  if (sorted.length === 0) throw '❌ Nessun giocatore con XP!';

  let testo = '✨ *CLASSIFICA XP* ✨\n\n';
  const medaglie = ['🥇', '🥈', '🥉'];

  sorted.forEach(([jid, u], i) => {
    const med = medaglie[i] || `${i + 1}.`;
    const liv = Math.floor(Math.sqrt((u.exp || 0) / 100)) + 1;
    testo += `${med} @${jid.split('@')[0]} — Lv.*${liv}* (${u.exp} XP)\n`;
  });

  await conn.sendMessage(groupId, {
    text: testo,
    mentions: sorted.map(([jid]) => jid)
  }, { quoted: m });
}

async function handleClassificaCrimini(m, users, conn, groupId) {
  const sorted = Object.entries(users)
    .filter(([_, u]) => u.crimini && u.crimini.rapine > 0)
    .sort(([, a], [, b]) => (b.crimini?.successi || 0) - (a.crimini?.successi || 0))
    .slice(0, 15);

  if (sorted.length === 0) throw '❌ Nessun criminale trovato!';

  let testo = '🔫 *CLASSIFICA CRIMINALI* 🔫\n\n';
  const medaglie = ['🥇', '🥈', '🥉'];

  sorted.forEach(([jid, u], i) => {
    const med = medaglie[i] || `${i + 1}.`;
    const ratio = Math.floor((u.crimini.successi / u.crimini.rapine) * 100);
    testo += `${med} @${jid.split('@')[0]} — ✅${u.crimini.successi} | 🔒${u.crimini.arrestato} (${ratio}%)\n`;
  });

  await conn.sendMessage(groupId, {
    text: testo,
    mentions: sorted.map(([jid]) => jid)
  }, { quoted: m });
}

handler.help = [
  'profilo — Vedi il tuo profilo RPG',
  'classifica — Top 15 per UC',
  'clasxp — Top 15 per XP',
  'clascrimine — Top 15 criminali'
];
handler.tags = ['rpg', 'fun'];
handler.command = /^(profilo|profile|classifica|leaderboard|top|clasxp|topxp|clascrimine|topcrime)$/i;
handler.register = true;
handler.group = true;

export default handler;
