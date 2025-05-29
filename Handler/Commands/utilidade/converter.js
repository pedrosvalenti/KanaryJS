const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { fromPath } = require('pdf2pic');
const { Document, Packer, Paragraph, ImageRun } = require('docx');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const tmp = require('tmp');
const pageCount = require('pdf-page-counter');

// Função para baixar o PDF anexado
async function downloadAttachment(url, filename) {
   const res = await fetch(url);
   const buffer = await res.arrayBuffer();
   fs.writeFileSync(filename, Buffer.from(buffer));
}

// Função para converter PDF em imagens e depois em DOCX
async function pdfToDocx(pdfPath, docxPath) {
   const options = {
      density: 100,
      saveFilename: "page",
      savePath: tmp.dirSync().name,
      format: "png",
      width: 800,
      height: 1000,
   };

   const storeAsImage = fromPath(pdfPath, options);
   const dataBuffer = fs.readFileSync(pdfPath);
   const pageData = await pageCount(dataBuffer);

   const paragraphs = [];

   for (let i = 1; i <= pageData.numpages; i++) {
      const page = await storeAsImage(i);
      const imageBuffer = fs.readFileSync(page.path);
      paragraphs.push(
         new Paragraph({
            children: [
               new ImageRun({
                  data: imageBuffer,
                  transformation: {
                     width: 600,
                     height: 800,
                  },
               }),
            ],
         })
      );
   }

   const doc = new Document({
      sections: [
         {
            children: paragraphs,
         },
      ],
   });

   const packer = new Packer();
   const docxBuffer = await packer.toBuffer(doc);
   fs.writeFileSync(docxPath, docxBuffer);
}

module.exports = {
   data: new SlashCommandBuilder()
      .setName('converter')
      .setDescription('Converta um arquivo PDF em DOCX.')
      .addAttachmentOption(option =>
         option.setName('pdf')
            .setDescription('Envie o arquivo PDF para converter')
            .setRequired(true)
      ),
   async execute(interaction) {
      const pdfAttachment = interaction.options.getAttachment('pdf');
      if (!pdfAttachment || !pdfAttachment.name.endsWith('.pdf')) {
         return interaction.reply({ content: 'Por favor, envie um arquivo PDF válido.', ephemeral: true });
      }

      await interaction.deferReply();

      // Caminhos temporários
      const pdfPath = path.join(tmp.dirSync().name, `${Date.now()}.pdf`);
      const docxPath = path.join(tmp.dirSync().name, `${Date.now()}.docx`);

      try {
         await downloadAttachment(pdfAttachment.url, pdfPath);
         await pdfToDocx(pdfPath, docxPath);

         const docxBuffer = fs.readFileSync(docxPath);
         const attachment = new AttachmentBuilder(docxBuffer, { name: 'convertido.docx' });
         await interaction.editReply({ content: 'Aqui está seu arquivo convertido:', files: [attachment] });
      } catch (err) {
         console.error(err);
         await interaction.editReply({ content: 'Ocorreu um erro ao converter o arquivo.' });
      } finally {
         if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
         if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
      }
   }
};