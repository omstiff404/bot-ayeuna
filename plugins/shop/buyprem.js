module.exports = {
    name: 'buyprem',
    command: ['buyprem', 'beli'],
    tags: 'shop',
    desc: 'Beli status Premium untuk diri sendiri atau pengguna lain.',
    prefix: true,

    run: async (conn, msg, {
        chatInfo,
        prefix,
        commandText,
        args,
        sender
    }) => {
        const { chatId } = chatInfo;

        const hargaPerHari = 100000; // Harga untuk 1 hari

        if (args.length < 1) {
            return conn.sendMessage(chatId, {
                text: `Gunakan format:\n${prefix}${commandText} nomor|durasi\nContoh: ${prefix}${commandText} 628xxxxxxxxxx|1d`
            }, { quoted: msg });
        }

        const [nomor, durasi] = args[0].split('|');

        if (!nomor || !durasi) {
            return conn.sendMessage(chatId, {
                text: 'Format salah. Gunakan format: nomor|durasi\nContoh: 628xxxxxxxxxx|1d'
            }, { quoted: msg });
        }

        const targetNumber = nomor.startsWith('62') ? nomor + '@s.whatsapp.net' : nomor + '@s.whatsapp.net';

        const match = durasi.match(/^(\d+)([hmd])$/);
        if (!match) {
            return conn.sendMessage(chatId, {
                text: 'Format durasi salah. Contoh: 7h (jam), 1d (hari), 30m (menit)'
            }, { quoted: msg });
        }

        const [_, valueStr, unit] = match;
        const value = parseInt(valueStr);
        const durationMs = unit === 'h' ? value * 3600000 :
            unit === 'd' ? value * 86400000 :
            unit === 'm' ? value * 60000 : null;

        if (!durationMs) {
            return conn.sendMessage(chatId, { text: 'Satuan waktu tidak dikenal' }, { quoted: msg });
        }

        intDB();
        const db = getDB();

        if (!db) {
            return conn.sendMessage(chatId, { text: 'Database tidak tersedia.' }, { quoted: msg });
        }

        // Ambil data pengguna dari database
        const userDb = Object.values(db?.Private || {}).find(u => u.Nomor === targetNumber) || {};
        if (!userDb.Nomor) {
            return conn.sendMessage(chatId, { text: 'Pengguna tidak terdaftar di database.' }, { quoted: msg });
        }

        let harga = 0;
        if (unit === 'h') {
            harga = Math.ceil(value / 24) * hargaPerHari; // Dihitung berdasarkan jumlah hari
        } else if (unit === 'd') {
            harga = value * hargaPerHari;
        } else if (unit === 'm') {
            harga = Math.ceil(value / (24 * 60)) * hargaPerHari; // Dihitung berdasarkan jumlah hari
        }

        const saldoPengguna = userDb.money?.amount || 0;

        // Periksa apakah saldo mencukupi
        if (saldoPengguna < harga) {
            return conn.sendMessage(chatId, { text: `Saldo Anda tidak mencukupi. Harga: Rp${harga}, Saldo Anda: Rp${saldoPengguna}` }, { quoted: msg });
        }

        // Proses pembelian
        userDb.money.amount -= harga; // Kurangi saldo pengguna
        userDb.isPremium = {
            isPrem: true,
            time: durationMs,
            activatedAt: Date.now()
        };

        // Update database
        const userKey = Object.keys(db.Private).find(k => db.Private[k].Nomor === targetNumber);
        if (userKey) {
            db.Private[userKey] = userDb;
            saveDB(db);
        }

        const satuan = unit === 'h' ? 'jam' : unit === 'd' ? 'hari' : 'menit';
        conn.sendMessage(chatId, {
            text: `Berhasil membeli Premium untuk ${targetNumber} selama ${value} ${satuan}. Harga: Rp${harga}, Sisa saldo: Rp${userDb.money.amount}`
        }, { quoted: msg });
    }
};
