require('dotenv').config();
const {
	Client,
	GatewayIntentBits,
	Partials,
	EmbedBuilder,
	BaseChannel,
	ApplicationCommandType,
	ApplicationCommandOptionType,
	ChannelType,
	SlashCommandBuilder,
	PresenceUpdateStatus,
	DMChannel,
	Constants
} = require("discord.js"), {
	entersState,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	StreamType,
	AudioPlayerStatus
} = require("@discordjs/voice"),
	client = new Client({
		partials: [
			Partials.Channel,
			Partials.GuildMember,
			Partials.GuildScheduledEvent,
			Partials.Message,
			Partials.Reaction,
			Partials.ThreadMember,
			Partials.User
		],
		intents: [
			GatewayIntentBits.DirectMessageReactions,
			GatewayIntentBits.DirectMessageTyping,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildBans,
			GatewayIntentBits.GuildEmojisAndStickers,
			GatewayIntentBits.GuildIntegrations,
			GatewayIntentBits.GuildInvites,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildMessageTyping,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildScheduledEvents,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildWebhooks,
			GatewayIntentBits.Guilds,
			GatewayIntentBits.MessageContent
		]
	}),
	ytdl = require('ytdl-core'), //YouTube Downloadのコア
	data = require("./data.json");
let SlashCommands = [
	new SlashCommandBuilder()
		.setName("help")
		.setDescription("ヘルプを表示します。")
	,
	new SlashCommandBuilder()
		.setName("welcomelocation")
		.setDescription("ようこそメッセージの場所を設定・変更出来ます。")
		.addStringOption(option => option
			.setName("chname")
			.setDescription("チャンネル名を決定してください。")
		)
];
for (let i = 0; i != data.data.length; i++) {
	SlashCommands.push(
		new SlashCommandBuilder()
			.setName(data.data[i].command)
			.setDescription(data.data[i].name)
	);
};
//トークンが設定されてない場合、あらかじめ警告し終了
if (!process.env.IBUKI_BOT_TOKEN) {
	console.log("トークンが存在しませんでした...\n.envファイルの確認、変数の確認をしましょう。");
	process.exit(0); //nodeを終了
};
client.on('ready', () => {
	try {
		//ステータス設定
		client.user.setPresence({
			activities: [{
				name: data.playing
			}],
			status: "online"
		});
		//コマンドセット
		client.guilds.cache.map(guild => {
			client.guilds.cache.get(guild.id).commands.set(SlashCommands);
		});
		//ログインできたか確認＆バージョン参照
		console.log("Bot準備完了～\nnode.js:" + process.version + "\nDiscord.js:v" + require('discord.js').version);
	} catch (e) {
		console.log(e);
	};
});
client.on('interactionCreate', interaction => {
	try {
		//入力されたコマンドを出力
		console.log(interaction.commandName);
		switch (interaction.commandName) {
			case "help": {
				interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("ヘルプ")
							.setDescription("今調べられる都道府県の数は、`" + data.data.length + "`個調べられます")
							.setColor(0x7289da)
							.addFields({ name: "botについて", value: autobr(data.texts[0]) })
					]
				}); //送信
				break;
			}
			default: {
				let set = false; //これコマンドがjsonの中から当たらなかったかどうか判断するために使う
				for (let i = 0; i != data.data.length; i++) { //dataの数だけ
					if (interaction.commandName == data.data[i].command) { //コマンドがあってるか繰り返す(ループして一つ一つ当たるかifで判断)
						interaction.reply({ //当たったら返信する
							embeds: [
								new EmbedBuilder()
									.setTitle(data.data[i].name)
									.setDescription(data.data[i].explanation)
									.setColor(0x7289da)
							]
						});
						set = true; //当たったことにする
						break;
					};
				};
				//当たらなかったらif実行。でも他のコマンドはないから、下の文字列を返す
				if (!set) interaction.reply({ content: autobr(data.texts[1]), ephemeral: true });
				break;
			}
		};
	} catch (e) { console.log(e); };
});
client.on('messageCreate', message => {
	try {
		//bot自身なら実行停止
		if (message.author.bot) return;
		/**
		 * ### ?と:の使い方  
		 * 例えばこのような条件があるとします。  
		 * ```javascript
		 * const Num = 20;
		 * if (Num == 20) {
		 * 	console.log("20です。"); //こっちが動く
		 * } else {
		 * 	console.log("20ではありません。");
		 * };
		 * ```
		 * このコードをたったの3行にすることが出来ます。
		 * ```javascript
		 * const Num = 20;
		 * const numis = (Num == 20) ? "20です。" : "20ではありません。";
		 * console.log(numis); //20です。
		 * ```
		 * 仕組みは`条件 : 成功１ : 失敗２`のようになっていて、  
		 * 条件でtrueが返ってくると成功１を変数に格納、falseなら失敗２を格納という形です。
		 */
		const mentionis = message.mentions.roles.some(r => [client.user.username].includes(r.name)) ? true : false;
		if (message.mentions.users.has(client.user.id) || mentionis) {
			message.reply("呼びましたか？コマンド使ってくれないと怒りますっ！");
		};
		for (let i = 0; data.reply.length != i; i++) {
			for (let Ii = 0; data.reply[i].message.length != Ii; Ii++) {
				if (message.content.match(data.reply[i].message[Ii])) {
					message.channel.send(data.reply[i].reply[Math.floor(Math.random() * data.reply[i].reply.length)]);
				};
			};
		};
		switch (message.content) {
			//CreateChannel チャンネル作成チャットコマンド
			case "createch": {
				const channelName = message.content.split(" ")[1];
				/**
				 * 「||」の意味。
				 *  (1 || 2)とし、1がfalseやundefinedを返した場合、2が使用されます。
				 */
				message.guild.channels.create({
					name: channelName || "new Channel"
				}).then((channel) => {
					message.channel.send("<#" + channel.id + "> チャンネルの作成をしました。");
				});
			}
		};
	} catch (e) { console.log(e); };
});
client.on("guildMemberAdd", async member => {
	try {
		const channel = data.replychannels.channel;
		const chObject = Object.keys(channel);
		for (let i = 0; i != chObject.length; i++) {
			let id = chObject[i];
			if (member.guild.id == id) {
				client.channels.fetch(channel[id].welcome).then(channel => {
					channel.send(
						"**" + member.user.username + "**さんようこそ" + member.guild.name + "へ！\n" +
						"あなたは" + member.guild.memberCount + "人目のメンバーです！"
					);
				});
			};
		};
	} catch (e) { console.log(e); };
});
function autobr(textdata) {
	let outdata = "";
	for (let i = 0; i != textdata.length; i++) {
		if (outdata != "") outdata += "\n";
		outdata += textdata[i];
	};
	return outdata;
};
client.login(process.env.IBUKI_BOT_TOKEN);