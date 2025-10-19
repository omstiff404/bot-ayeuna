const fs = require('fs');
const path = require('path');
const emtData = require('./transmitter.js');
const reactId = require('./reaction.js');
const Sys = require('./helper');

const databasePath = './toolkit/db/database.json';
const packageJsonPath = path.join(__dirname, '../package.json');
const settingPath = './toolkit/set/config.json';
const tokoPath = './toolkit/set/toko.json';
const SysGame = require('./funcGame.js');

const setting = JSON.parse(fs.readFileSync(settingPath, 'utf-8'));
const toko = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

function readDatabase() {
    if (!fs.existsSync(databasePath)) return { Private: {} };
    return JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
}

global.getUserData = (userId) => {
    const database = readDatabase();
    return Object.values(database.Private).find(user => user.Nomor === userId) || null;
};

global.premium = (userId) => {
    const userData = global.getUserData(userId);
    return userData ? userData.isPremium?.isPrem ?? false : false;
};

global.chtEmt = Sys.chtEmt;
global.enGcL = Sys.enGcL;
global.enGcW = Sys.enGcW;
global.exCht = Sys.exCht;
global.Format = Sys.Format;
global.gcData = Sys.getGrpDB;
global.loadGc = Sys.loadGrpDB;
global.getLftTxt = Sys.getLeftTxt;
global.getUser = Sys.getUser;
global.getWlcTxt = Sys.getWelcTxt;
global.intDB = Sys.intDB;
global.isOwner = Sys.chkOwner;
global.isPrem = Sys.chkPrem;
global.parseMessage = Sys.parseMessage;
global.parseNoPrefix = Sys.parseNoPrefix;
global.getDB = Sys.getDB;
global.saveDB = Sys.saveDB;
global.stGcL = Sys.stGcL;
global.stGcW = Sys.stGcW;
global.stGrup = Sys.exGrp;
global.updateBio = Sys.updateBio;
global.authUser = Sys.authUser;

global.afkCencel = emtData.afkCencel;
global.afkTgR = emtData.afkTgR;
global.ai = emtData.ai;
global.bdWrd = emtData.bdWord;
global.Bella = emtData.logicBella;
global.calNumber = emtData.colNumb;
global.gcFilter = emtData.gcFilter;
global.gbLink = emtData.gbLink;
global.getStId = emtData.getStId;
global.gtMJid = emtData.gtMention;
global.loadFunc = emtData.loadFunc;
global.mtData = emtData.mtData;
global.translate = emtData.translate;
global.tryFree = emtData.tryPrem;
global.watchCfg = emtData.watchCfg;

global.rctKey = reactId.rctKey;

global.load = SysGame.load;
global.save = SysGame.save;
global.bersih = SysGame.bersih;
global.pPath = SysGame.p;
global.loadBank = SysGame.loadBank;
global.saveBank = SysGame.saveBank;
global.loadStore = SysGame.loadStore;
global.saveStore = SysGame.saveStore;

Object.assign(global, {
    autoBio: setting.botSetting.autoBio,
    autoTyping: setting.botSetting.autoTyping,
    baileys: Object.keys(packageJson.dependencies).find(dep => dep.includes('baileys')),
    bioText: setting.botSetting.bioText,
    body: setting.menuSetting.frame.body,
    botFullName: setting.botSetting.botFullName || 'Belum Diset',
    botName: setting.botSetting.botName || 'Belum Diset',
    btn: setting.menuSetting.btn,
    Cbrack: setting.menuSetting.brackets?.[1],
    chshort: setting.botSetting.sendTextLink.chshort,
    contact: setting.ownerSetting.contact,
    footer: setting.botSetting.footer,
    foot: setting.menuSetting.frame.foot,
    garis: setting.menuSetting.garis,
    HamzKey: setting.apiKey.HamzApi.key,
    HamzWeb: setting.apiKey.HamzApi.web,
    head: setting.menuSetting.frame.head,
    idCh: setting.menuSetting.idCh,
    isPrefix: setting.menuSetting.isPrefix,
    logic: setting.botSetting.logic,
    Obrack: setting.menuSetting.brackets?.[0],
    owner: setting.msg.rejectMsg.isOwner,
    ownerName: setting.ownerSetting.ownerName || 'default',
    ownerNumber: setting.ownerSetting.ownerNumber,
    ownerStore: {
        dana: setting.ownerSetting.ownerStore?.dana || 'Tidak tersedia',
        gopay: setting.ownerSetting.ownerStore?.gopay || 'Tidak tersedia',
        ovo: setting.ownerSetting.ownerStore?.ovo || 'Tidak tersedia'
    },
    packageJson,
    prem: setting.msg.rejectMsg.isPremium,
    public: setting.botSetting.public,
    readGroup: setting.botSetting.autoread?.group,
    readPrivate: setting.botSetting.autoread?.private,
    sewaList: toko.storeSetting.sewa || [],
    setting,
    side: setting.menuSetting.side,
    storeList: Object.keys(toko.storeSetting).filter(k => k !== 'sewa'),
    target: Sys.target,
    thumbnail: setting.botSetting.thumbnail,
    toko,
    type: setting.botSetting.type || 'default',
    version: packageJson.version,
    siptzKey: setting.apiKey.siputKey.web,
    termaiKey: setting.apiKey.termai.key,
    termaiWeb: setting.apiKey.termai.web,
    zellApi: setting.apiKey.zellApi.web
});

module.exports = { ...global };