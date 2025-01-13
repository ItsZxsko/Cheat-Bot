const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/uuids.json');

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('showmyuuid')
    .setDescription('Shows your unique UUID (HWID).'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    let userEntry = data.find(entry => entry.id === userId);

    if (!userEntry) {
      const uuid = `UUID-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      userEntry = { id: userId, username, uuid };
      data.push(userEntry);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    }

    const embed = new EmbedBuilder()
      .setTitle('Your Unique UUID')
      .setColor('Blue')
      .setDescription(`**Username:** ${username}\n**UUID:** \`${userEntry.uuid}\``)
      .setFooter({ text: 'AIO BOT | Unique UUID System', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
