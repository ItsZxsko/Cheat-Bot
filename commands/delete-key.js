const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/sub.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletekey')
    .setDescription('Delete a specific key for a product.')
    .addStringOption(option =>
      option
        .setName('product')
        .setDescription('The product name')
        .setRequired(true)
        .addChoices(
          { name: 'Fortnite Private', value: 'Fortnite Private' },
          { name: 'Temp Spoofer', value: 'Temp Spoofer' },
          { name: 'Perm Spoofer', value: 'Perm Spoofer' }
        )
    )
    .addStringOption(option =>
      option
        .setName('key')
        .setDescription('The key to delete')
        .setRequired(true)
    ),

  async execute(interaction) {
    const product = interaction.options.getString('product');
    const key = interaction.options.getString('key');

    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

      const index = data.findIndex(
        entry => entry.product === product && entry.key === key
      );

      if (index === -1) {
        return await interaction.reply({
          content: `❌ Key \`${key}\` for product \`${product}\` not found.`,
          ephemeral: true,
        });
      }

      data.splice(index, 1);

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      await interaction.reply({
        content: `✅ Key \`${key}\` for product \`${product}\` has been deleted.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error deleting key:', error);

      await interaction.reply({
        content: '❌ An error occurred while deleting the key.',
        ephemeral: true,
      });
    }
  },
};
