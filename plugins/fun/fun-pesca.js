
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

let cooldowns = {};

const pesci = [
  { nome: '🐟 Sardina', rarità: 'comune', valore: 10, peso: '0.2kg' },
  { nome: '🐠 Pesce Pagliaccio', rarità: 'comune', valore: 15, peso: '0.3kg' },
  { nome: '🐡 Pesce Palla', rarità: 'comune', valore: 20, peso: '0.5kg' },
  { nome: '🐟 Sgombro', rarità: 'comune', valore: 25, peso: '0.8kg' },
  { nome: '🐟 Merluzzo', rarità: 'non comune', valore: 40, peso: '1.5kg' },
  { nome: '🐟 Branzino', rarità: 'non comune', valore: 50, peso: '2kg' },
  { nome: '🐟 Orata', rarità: 'non comune', valore: 55, peso: '1.8kg' },
  { nome: '🦈 Squalo Martello', rarità: 'raro', valore: 150, peso: '50kg' },
  { nome: '🐙 Polpo Gigante', rarità: 'raro', valore: 120, peso: '8kg' },
  { nome: '🦑 Calamaro', rarità: 'raro', valore: 100, peso: '5kg' },
  { nome: '🐋 Balena', rarità: 'epico', valore: 500, peso: '2000kg' },
  { nome: '🧜‍♀️ Sirena', rarità: 'leggendario', valore: 1000, peso: '???' },
  { nome: '🐉 Pesce Drago', rarità: 'leggendario', valore: 800, peso: '15kg' },
  { nome: '👢 Stivale Vecchio', rarità: 'spazzatura', valore: 1, peso: '0.5kg' },
  { nome: '🪣 Secchio Arrugginito', rarità: 'spazzatura', valore: 2, peso: '1kg' },
  { nome: '📱 iPhone Rotto', rarità: 'spazzatura', valore: 5, peso: '0.2kg' },
  { nome: '💀 Teschio Misterioso', rarità: 'epico', valore: 300, peso: '2kg' },
  { nome: '🗡️ Spada Antica', rarità: 'epico', valore: 400, peso: '3kg' },
  { nome: '🦀 Granchio d\'Oro', rarità: 'raro', valore: 200, peso: '1kg' },
  { nome: '🐢 Tartaruga Marina', rarità: 'non comune', valore: 60, peso: '30kg' },
];

const raritàProb = {
  spazzatura: 15,
  comune: 40,
  'non comune': 25,
  raro: 12,
  epico: 6,
  leggendario: 2
};

const raritàEmoji = {
  spazzatura: '🗑️',
  comune: '⬜',
  'non comune': '🟩',
  raro: '🟦',
  epico: '🟪',
  leggendario: '🟨'
};

function pescaPesce() {
  const roll = Math.random() * 100;
  let cumulativo = 0;
  let raritàScelta = 'comune';

  for (const [rarità, prob] of Object.entries(raritàProb)) {
    cumulativo += prob;
    if (roll < cumulativo) {
      raritàScelta = rarità;
      break;
    }
  }

  const disponibili = pesci.filter(p => p.rarità === raritàScelta);
  return pickRandom(disponibili);
}

let handler = async (m, { conn, command, usedPrefix }) => {
  const userId = m.sender;
  const groupId = m.chat;
  const users = global.db.data.users;
  const user = users[m.sender];

  if (!user) throw '❌ Non sei registrato!';

  switch (command) {
    case 'pesca':
    case 'fish':
      await handlePesca(m, user, conn, userId, groupId);
      break;
    case 'inventariopesca':
    case 'fishinv':
      await handleInventarioPesca(m, user, conn, userId, groupId);
      break;
    case 'vendipesce':
    case 'sellfish':
      await handleVendiPesce(m, user, conn, userId, groupId);
      break;
  }
};

async function handlePesca(m, user, conn, userId, groupId) {
  const tempoAttesa = 15 * 1000;
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoAttesa) {
    const restante = Math.ceil((cooldowns[m.sender] + tempoAttesa - Date.now()) / 1000);
    throw `⏳ La canna è ancora in acqua! Aspetta *${restante}s* 🎣`;
  }

  cooldowns[m.sender] = Date.now();

  if (!user.pesca) user.pesca = { pesci: [], totale: 0 };

  // 10% chance di non pescare nulla
  if (Math.random() < 0.10) {
    const nulla = [
      '🎣 Hai lanciato la lenza ma... niente! I pesci ti hanno ignorato. 🐟💨',
      '🎣 L\'esca è stata mangiata senza che tu prendessi nulla! 😤',
      '🎣 Un pesce enorme ha spezzato il filo! Che sfortuna! 💀',
      '🎣 Hai aspettato ore ma il mare era vuoto... 🌊'
    ];
    return conn.sendMessage(groupId, { text: pickRandom(nulla) }, { quoted: m });
  }

  const pesce = pescaPesce();
  user.pesca.pesci.push(pesce);
  user.pesca.totale++;

  const emoji = raritàEmoji[pesce.rarità] || '⬜';

  let testo = '🎣 *PESCA* 🎣\n\n';
  testo += `Hai lanciato la lenza e...\n\n`;
  testo += `${emoji} *${pesce.nome}*\n`;
  testo += `📏 Peso: ${pesce.peso}\n`;
  testo += `⭐ Rarità: ${pesce.rarità.toUpperCase()}\n`;
  testo += `💰 Valore: ${pesce.valore} UC\n\n`;

  if (pesce.rarità === 'leggendario') {
    testo += '🎊 *INCREDIBILE! UN PESCE LEGGENDARIO!* 🎊\n';
    await conn.sendMessage(m.chat, { react: { text: '🎊', key: m.key } });
  } else if (pesce.rarità === 'epico') {
    testo += '✨ Wow, una cattura epica! ✨\n';
    await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
  } else if (pesce.rarità === 'spazzatura') {
    testo += '🗑️ Beh... almeno hai preso qualcosa...\n';
    await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } });
  } else {
    await conn.sendMessage(m.chat, { react: { text: '🎣', key: m.key } });
  }

  testo += `\n🐟 Pesci nel secchio: ${user.pesca.pesci.length}`;
  testo += `\n📌 Usa *.vendipesce* per vendere tutto!`;

  await conn.sendMessage(groupId, { text: testo }, { quoted: m });
}

async function handleInventarioPesca(m, user, conn, userId, groupId) {
  if (!user.pesca || user.pesca.pesci.length === 0) {
    throw '🪣 Il tuo secchio è vuoto! Vai a pescare con *.pesca*';
  }

  let testo = '🪣 *IL TUO SECCHIO* 🪣\n\n';
  let valTotale = 0;

  const conteggio = {};
  for (const p of user.pesca.pesci) {
    const key = p.nome;
    if (!conteggio[key]) conteggio[key] = { ...p, quantità: 0 };
    conteggio[key].quantità++;
    valTotale += p.valore;
  }

  for (const [_, p] of Object.entries(conteggio)) {
    const emoji = raritàEmoji[p.rarità] || '⬜';
    testo += `${emoji} ${p.nome} x${p.quantità} — ${p.valore * p.quantità} UC\n`;
  }

  testo += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  testo += `💰 Valore totale: *${valTotale} UC*\n`;
  testo += `🐟 Pesci totali: ${user.pesca.pesci.length}\n`;
  testo += `📌 Usa *.vendipesce* per incassare!`;

  await conn.sendMessage(groupId, { text: testo }, { quoted: m });
}

async function handleVendiPesce(m, user, conn, userId, groupId) {
  if (!user.pesca || user.pesca.pesci.length === 0) {
    throw '🪣 Non hai pesci da vendere! Vai a pescare con *.pesca*';
  }

  let valTotale = 0;
  for (const p of user.pesca.pesci) {
    valTotale += p.valore;
  }

  const quantità = user.pesca.pesci.length;
  user.limit = (user.limit || 0) + valTotale;
  user.pesca.pesci = [];

  await conn.sendMessage(groupId, {
    text: `🏪 *VENDITA PESCE* 🏪\n\n🐟 Hai venduto *${quantità} pesci*\n💰 Guadagno: *+${valTotale} UC*\n\n💶 Saldo attuale: ${user.limit} UC`,
  }, { quoted: m });

  await conn.sendMessage(m.chat, { react: { text: '💰', key: m.key } });
}

handler.help = ['pesca — Vai a pescare', 'inventariopesca — Vedi pesci', 'vendipesce — Vendi tutti'];
handler.tags = ['rpg', 'fun'];
handler.command = /^(pesca|fish|inventariopesca|fishinv|vendipesce|sellfish)$/i;
handler.register = true;
handler.group = true;

export default handler;
