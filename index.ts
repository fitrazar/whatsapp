import makeWASocket, { DisconnectReason, useMultiFileAuthState, MessageType, makeInMemoryStore } from '@adiwajshing/baileys';
import { Boom } from '@hapi/boom';
import axios from 'axios';
import MessageOptions from "@adiwajshing/baileys";
import Mimetype from "@adiwajshing/baileys";

async function connectToWhatsApp () {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state
    })
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        // await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
        if (!msg.key.fromMe && m.type === 'notify') {

        }
    })
    
    return sock;
}

async function blast() {
    const sockWa = await connectToWhatsApp();
    // MY API
    axios.get(`YOUR_API`)
    .then(async (response) => {
        
        // await sock.sendMessage("6281385931773@s.whatsapp.net", { caption: "ini caption", image: {url: ""} })
        const data = response.data.data;
        let x = 0;
        
        sockWa.ev.on('messages.upsert', async ({ messages }) => {
            const num = data[x].whatsapp+"@s.whatsapp.net";
            const str = `Halo ${data[x].nama} \njumlah nilai kamu ${data[x].jumlah}`;
            console.log(str);

            await sockWa.sendMessage(num, { text: str });
        })
    })
}
// run in main file
blast()
