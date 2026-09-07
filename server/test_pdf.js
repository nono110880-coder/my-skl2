const { PDFDocument } = require('pdf-lib');

async function test() {
    try {
        const transkripPdfLoad = await PDFDocument.create();
        transkripPdfLoad.addPage([500, 500]);
        const transkripBuffer = await transkripPdfLoad.save();

        const kopSuratPdfLoad = await PDFDocument.create();
        kopSuratPdfLoad.addPage([500, 500]);
        const kopSuratBuffer = await kopSuratPdfLoad.save();

        const tLoad = await PDFDocument.load(transkripBuffer);
        const kLoad = await PDFDocument.load(kopSuratBuffer);

        const tempMergedPdf = await PDFDocument.create();
        const embeddedKopSurat = await tempMergedPdf.embedPage(kLoad.getPages()[0]);
        console.log("Success embeddedKopSurat");
    } catch(err) {
        console.error("Error:", err);
    }
}
test();
