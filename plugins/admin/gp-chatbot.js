const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Memoria temporanea per cronologia chat e info utenti
const chatMemory = {
    messages: new Map(), // Salva gli ultimi 5 messaggi per utente
    userInfo: new Map()  // Salva le informazioni utente
};

// Carica i dati dei gruppi utenti
function loadUserGroupData() {
    try {
        return JSON.parse(fs.readFileSync(USER_GROUP_DATA));
    } catch (error) {
        console.error('❌ Errore durante il caricamento dei dati del gruppo:', error.message);
        return { groups: [], chatbot: {} };
    }
}

// Salva i dati dei gruppi utenti
function saveUserGroupData(data) {
    try {
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Errore durante il salvataggio dei dati del gruppo:', error.message);
    }
}

// Genera un ritardo casuale tra 2-5 secondi
function getRandomDelay() {
    return Math.floor(Math.random() * 3000) + 2000;
}

// Mostra l'indicatore di digitazione
async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    } catch (error) {
        console.error('Errore indicatore digitazione:', error);
    }
}

// Estrae informazioni utente dai messaggi
function extractUserInfo(message) {
    const info = {};
    
    // Estrae il nome
    if (message.toLowerCase().includes('my name is')) {
        info.name = message.split('my name is')[1].trim().split(' ')[0];
    }
    
    // Estrae l'età
    if (message.toLowerCase().includes('i am') && message.toLowerCase().includes('years old')) {
        info.age = message.match(/\d+/)?.[0];
    }
    
    // Estrae la posizione
    if (message.toLowerCase().includes('i live in') || message.toLowerCase().includes('i am from')) {
        info.location = message.split(/(?:i live in|i am from)/i)[1].trim().split(/[.,!?]/)[0];
    }
    
    return info;
}

async function handleChatbotCommand(sock, chatId, message, match) {
    if (!match) {
        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: `*CONFIGURAZIONE CHATBOT*\n\n*.chatbot on*\nAttiva il chatbot\n\n*.chatbot off*\nDisattiva il chatbot in questo gruppo`,
            quoted: message
        });
    }

    const data = loadUserGroupData();
    
    // Ottiene il numero del bot
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    
    // Controlla se il mittente è il proprietario del bot
    const senderId = message.key.participant || message.participant || message.pushName || message.key.remoteJid;
    const isOwner = senderId === botNumber;

    // Se è il proprietario del bot, consenti accesso immediato
    if (isOwner) {
        if (match === 'on') {
            await showTyping(sock, chatId);

            if (data.chatbot[chatId]) {
                return sock.sendMessage(chatId, { 
                    text: '*Il chatbot è già attivo per questo gruppo*',
                    quoted: message
                });
            }

            data.chatbot[chatId] = true;
            saveUserGroupData(data);

            console.log(`✅ Chatbot attivato per il gruppo ${chatId}`);

            return sock.sendMessage(chatId, { 
                text: '*Il chatbot è stato attivato per questo gruppo*',
                quoted: message
            });
        }

        if (match === 'off') {
            await showTyping(sock, chatId);

            if (!data.chatbot[chatId]) {
                return sock.sendMessage(chatId, { 
                    text: '*Il chatbot è già disattivato per questo gruppo*',
                    quoted: message
                });
            }

            delete data.chatbot[chatId];
            saveUserGroupData(data);

            console.log(`✅ Chatbot disattivato per il gruppo ${chatId}`);

            return sock.sendMessage(chatId, { 
                text: '*Il chatbot è stato disattivato per questo gruppo*',
                quoted: message
            });
        }
    }

    // Per utenti non proprietari, controlla se sono admin
    let isAdmin = false;

    if (chatId.endsWith('@g.us')) {
        try {
            const groupMetadata = await sock.groupMetadata(chatId);

            isAdmin = groupMetadata.participants.some(
                p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin')
            );

        } catch (e) {
            console.warn('⚠️ Impossibile recuperare i metadati del gruppo. Il bot potrebbe non essere admin.');
        }
    }

    if (!isAdmin && !isOwner) {
        await showTyping(sock, chatId);

        return sock.sendMessage(chatId, {
            text: '❌ Solo gli admin del gruppo o il proprietario del bot possono usare questo comando.',
            quoted: message
        });
    }

    if (match === 'on') {
        await showTyping(sock, chatId);

        if (data.chatbot[chatId]) {
            return sock.sendMessage(chatId, { 
                text: '*Il chatbot è già attivo per questo gruppo*',
                quoted: message
            });
        }

        data.chatbot[chatId] = true;
        saveUserGroupData(data);

        console.log(`✅ Chatbot attivato per il gruppo ${chatId}`);

        return sock.sendMessage(chatId, { 
            text: '*Il chatbot è stato attivato per questo gruppo*',
            quoted: message
        });
    }

    if (match === 'off') {
        await showTyping(sock, chatId);

        if (!data.chatbot[chatId]) {
            return sock.sendMessage(chatId, { 
                text: '*Il chatbot è già disattivato per questo gruppo*',
                quoted: message
            });
        }

        delete data.chatbot[chatId];
        saveUserGroupData(data);

        console.log(`✅ Chatbot disattivato per il gruppo ${chatId}`);

        return sock.sendMessage(chatId, { 
            text: '*Il chatbot è stato disattivato per questo gruppo*',
            quoted: message
        });
    }

    await showTyping(sock, chatId);

    return sock.sendMessage(chatId, { 
        text: '*Comando non valido. Usa .chatbot per vedere l’utilizzo*',
        quoted: message
    });
}
