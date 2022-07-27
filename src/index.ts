import path from 'path'
import { Player, PluginApi } from './@interface/pluginApi.i'
const { MessageEmbed } = require('discord.js');
const { Client, Collection, Intents } = require('discord.js');
const { Authflow } = require('prismarine-auth')
import axios from 'axios'
const fs = require('fs')
const { TOKEN, REALMCHATID, BANNED, LOGID, MOD, DISCORD, REALMID, EMAIL, GAMERSCOREMAX } = require('../config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.login(TOKEN)
process.on('uncaughtException',(e)=>{
  console.log("BeRP attempted to crash but error was caught.")
  console.log(e)
})

class DiscordmodPlugin {
    private api: PluginApi

    constructor(api: PluginApi) {
      this.api = api
    }

    public onLoaded(): void {
      this.api.getLogger().info('Plugin loaded!')
    this.api.autoConnect(EMAIL,REALMID)
        this.api.autoReconnect(EMAIL,REALMID)
    }
    public onEnabled(): void {
      this.api.getLogger().info('Plugin enabled!')
      this.api.getEventManager().on('PlayerJoin', async (userJoin) => {
        if(!DISCORD) return;
        new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then(async (t)=>{
          const MicrosoftGT = (await axios.get(`https://profile.xboxlive.com/users/xuid(${userJoin.getXuid()})/profile/settings?settings=Gamertag`, {
            headers:{
              'x-xbl-contract-version': '2',
              'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
              "Accept-Language": "en-US"
            }
          })).data.profileUsers[0].settings[0].value

          const PFP = (await axios.get(`https://profile.xboxlive.com/users/xuid(${userJoin.getXuid()})/profile/settings?settings=GameDisplayPicRaw`, {
            headers:{
              'x-xbl-contract-version': '2',
              'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
              "Accept-Language": "en-US"
            }
          })).data.profileUsers[0].settings[0].value
        this.api.getLogger().info(`${userJoin.getName()} Has Joined ${this.api.getConnection().realm.name}`)
        const JoinMSG = new MessageEmbed()
        .setAuthor(MicrosoftGT,PFP)
        .setColor(`#36ff20`)
        .setDescription(`${userJoin.getName()} Has Joined ${this.api.getConnection().realm.name}`)
        client.channels.fetch(REALMCHATID).then(async channel => await channel.send({embeds: [JoinMSG]})).catch();
      })
    })
      this.api.getEventManager().on(`PlayerInitialized`,(p)=>{
        this.automod(p)
      })
      this.api.getEventManager().on(`PlayerLeft`,async (userLeft)=>{
        if(!DISCORD) return;
        new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then(async (t)=>{
          const MicrosoftGT = (await axios.get(`https://profile.xboxlive.com/users/xuid(${userLeft.getXuid()})/profile/settings?settings=Gamertag`, {
            headers:{
              'x-xbl-contract-version': '2',
              'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
              "Accept-Language": "en-US"
            }
          })).data.profileUsers[0].settings[0].value

          new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then(async (t)=>{
          const PFP = (await axios.get(`https://profile.xboxlive.com/users/xuid(${userLeft.getXuid()})/profile/settings?settings=GameDisplayPicRaw`, {
            headers:{
              'x-xbl-contract-version': '2',
              'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
              "Accept-Language": "en-US"
            }
          })).data.profileUsers[0].settings[0].value
        this.api.getLogger().info(`${userLeft.getName()} Has Left ${this.api.getConnection().realm.name}`)
        const LeftMSG = new MessageEmbed()
        .setAuthor(MicrosoftGT,PFP)
        .setColor(`#ff0000`)
        .setDescription(`${userLeft.getName()} Has Left ${this.api.getConnection().realm.name}`)
        client.channels.fetch(REALMCHATID).then(async channel => await channel.send({embeds: [LeftMSG]})).catch();
      })
    })
  })
      this.api.getEventManager().on(`PlayerMessage`,async (userMessage)=>{
        if(!DISCORD) return;
        this.api.getLogger().info(`(REALM) ${userMessage.sender.getName()}: ${userMessage.message}`)
        client.channels.fetch(REALMCHATID).then(async channel => await channel.send(`**${userMessage.sender.getName()}**: ${userMessage.message.replace(`@`,``)}`)).catch();
      })
  client.on(`messageCreate`,(message)=>{
    if(!DISCORD) return;
    if(message.author.bot) return;
   if(message.channel.id == REALMCHATID){
    this.api.getLogger().info(`(Discord) ${message.author.username}: ${message.content}`)
    this.api.getCommandManager().executeCommand(`tellraw @a {\"rawtext\":[{\"text\":\"§l§9Discord §l§3[${message.author.username}]§r§f:${message.content}\"}]}`)
   }
    })
    client.on('interactionCreate', async interaction => {
      this.api.getCommandManager().executeCommand('list', async (res) => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;
      
        if (commandName === 'ping') {
          await interaction.reply('Pong!');
        }
      else if (commandName === 'list-players') {
        for (const [, c] of this.api.getConnection().getConnectionManager().getConnections()) {
          const pl = c.getPlugins().get(this.api.getConfig().name)
          const api = pl.api
        }
        const prefix = '*-*';
        const realmName = this.api.getConnection().realm.name
        const playersOnline = res.output[0].paramaters.join('/');
        const listPlayersOnline = res.output[1].paramaters[0].replace(/, /g, `\n${prefix} `);
        
        const response = `** ${playersOnline} Players Online**:\n${prefix} ${listPlayersOnline}`;
        const fancyResponse = new MessageEmbed()
          .setColor('#5a0cc0')
          .setTitle(`${realmName}`)
          .setDescription(`${response}`)
        await interaction.reply({embeds: [fancyResponse]})
      } else if (commandName === 'user') {
        await interaction.reply('User info.');
      }
        else if(commandName === `realm-whitelist`){
          if (!interaction.memberPermissions.has('ADMINISTRATOR')) return interaction.reply(`You Dont Have Permissions To Tun This`)
          new Authflow('', `.\\auth`, { relyingParty: 'http://xboxlive.com' }).getXboxToken().then(async (t: { userHash: any; XSTSToken: any; }) => {
            const  { data }  = await axios(`https://profile.xboxlive.com/users/gt(${interaction.options.getString(`gamertag`)})/profile/settings?settings=Gamertag`, {
              headers:{ 'x-xbl-contract-version': '2','Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,"Accept-Language": "en-US" }
            })
            const xuid = data.profileUsers[0].id
          interaction.reply({ content: `${interaction.options.getString('gamertag')} has been Whitelisted!`, ephemeral: true })
          fs.readFile('./plugins/Berp-DiscordMod-main/whitelist.json', 'utf8', (err,data)=>{
            var obj = JSON.parse(data)
            if(obj.includes(xuid)) return
            obj.push(xuid)
            var json = JSON.stringify(obj)
            fs.writeFile('./plugins/Berp-DiscordMod-main/whitelist.json', json,err =>{
              if(err) {
                console.log(err)
                return
              }
            })
          })
          })
        }
        else if(commandName === 'realm-unwhitelist') {
          if (!interaction.memberPermissions.has('ADMINISTRATOR')) return interaction.reply(`You Dont Have Permissions To Tun This`)
            new Authflow('', `.\\auth`, { relyingParty: 'http://xboxlive.com' }).getXboxToken().then(async (t: { userHash: any; XSTSToken: any; }) => {
            const  { data }  = await axios(`https://profile.xboxlive.com/users/gt(${interaction.options.getString(`gamertag`)})/profile/settings?settings=Gamertag`, {
              headers:{ 'x-xbl-contract-version': '2','Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,"Accept-Language": "en-US" }
            })
            const xuid = data.profileUsers[0].id
          fs.readFile('./plugins/Berp-DiscordMod-main/whitelist.json', 'utf8', (err,data)=>{
            if(err) return interaction.reply("Could not read whitelist list! An unexpected error occurred! Try again.")
            var obj = JSON.parse(data)
            if(!obj.includes(xuid)) return interaction.reply(`User isn't whitelisted yet!`)
            for(var i = 0; i < obj.length; i++) {
              if(obj[i].includes(xuid)) obj.splice(i, 1)
            }
            var json = JSON.stringify(obj)
            fs.writeFile('./plugins/Berp-DiscordMod-main/whitelist.json', json,err =>{
              if(err) {
                console.log(err)
                return interaction.reply("Unexpected error when trying to remove from whitelist!")
              }
              else {
                interaction.reply(`Sucessfully removed user from whitelist`);
              }
            })
          })
        })
        }
      })
      
      })
        }
  public automod(p: Player): void {
    if(!MOD) return;
    new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then(async (t)=>{
      const GamerScore =  (await axios.get(`https://profile.xboxlive.com/users/xuid(${p.getXuid()})/profile/settings?settings=Gamerscore`, {
        headers:{
          'x-xbl-contract-version': '2',
          'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
          "Accept-Language": "en-US"
        }
      })).data.profileUsers[0].settings[0].value
      console.log(GamerScore)
    fs.readFile(path.resolve('./plugins/Berp-DiscordMod-main/whitelist.json'), 'utf8',  async (err,data)=>{
      if(!data || err) return console.log(err);
      if(data.includes(p.getXuid())) return 
if(p.getName().length > 16){this.kickplayer(p,`Invald Gamertag`)}
    if(BANNED.includes(p.getDevice())){this.kickplayer(p,`AutoMod Violation`)}
    new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then((t)=>{
      axios.get(`https://titlehub.xboxlive.com/users/xuid(${p.getXuid()})/titles/titlehistory/decoration/scid,image,detail`, {
        headers:{
          'x-xbl-contract-version': '2',
          'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
          "Accept-Language": "en-US"
        }
      }).then((res)=>{
        if(!res.data.title[0].type.includes(`Game`)){this.kickplayer(p,`MAJOR ERROR Recently Played Isnt Minecraft Game`)}
        if(GamerScore < GAMERSCOREMAX){this.kickplayer(p,`Alt Account Detected Low Gamerscore`)}
        if(!res.data.titles[0]){this.kickplayer(p,`Account On Private`)} 
        if(BANNED.includes(res.data.titles[0].name.replace(new RegExp('Minecraft for ','g'),''))){this.kickplayer(p,`Recently Played An illigal Device`)}
        if(BANNED.includes(res.data.titles[0].name.replace(new RegExp('Minecraft for ','g'),''))){this.kickplayer(p,`Recently Played An illigal Device`)}
        if(BANNED.includes(res.data.titles[0].name.replace(new RegExp('Minecraft for ','g'),''))){this.kickplayer(p,`Recently Played An illigal Device`)}
      if(!res.data.titles[0].name.includes(`Minecraft`)){this.kickplayer(p,`Xbox Api Says Your Not Playing Minecraft`)}
      })
    })
  })
})
  }
  public kickplayer(p: Player, r: string): void{
this.api.getCommandManager().executeCommand(`Kick "${p.getXuid()}" ${r}`)
      if(!DISCORD) return;
const AUTOMODLOG = new MessageEmbed()
.setTimestamp()
.setColor(`#ff0000`)
.setDescription(`**UserName**:${p.getName()}\n**XUID**\n${p.getXuid()}\n**Device**:${p.getDevice()}\n**Reason**:${r}`)
client.channels.fetch(LOGID).then(async channel => await channel.send({embeds: [AUTOMODLOG]})).catch();
  }
    public onDisabled(): void {
      this.api.getLogger().info('Plugin disabled!')
    }
}

export = DiscordmodPlugin
