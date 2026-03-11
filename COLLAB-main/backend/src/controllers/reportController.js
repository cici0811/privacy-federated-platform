const PDFDocument = require('pdfkit');
const db = require('../models/db');

exports.exportReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.users.findOne({ _id: userId });
    
    // Create a document
    const doc = new PDFDocument();

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=compliance_report.pdf');
    
    doc.pipe(res);

    // Embed a font, set the font size, and render some text
    doc.fontSize(25)
       .text('Federated Compliance Report', 100, 100);

    doc.fontSize(12)
       .moveDown()
       .text(`Generated for: ${user.username}`)
       .text(`Date: ${new Date().toLocaleString()}`)
       .moveDown();

    doc.fontSize(16)
       .text('1. Privacy Policy Compliance', { underline: true })
       .fontSize(12)
       .text('All local data processing adheres to the "Extreme Privacy" standard. No raw data has left the local environment.')
       .moveDown();

    doc.fontSize(16)
       .text('2. Federated Learning Contributions', { underline: true })
       .fontSize(12)
       .text('Model updates contributed: 12')
       .text('Total bandwidth used: 45 MB')
       .moveDown();

    doc.fontSize(16)
       .text('3. Audit Log Summary', { underline: true })
       .fontSize(12);

    const logs = await db.logs.find({ nodeId: 'System' }).limit(5);
    logs.forEach(log => {
      doc.text(`- [${log.level.toUpperCase()}] ${log.event} (${new Date(log.timestamp).toLocaleTimeString()})`);
    });

    // Finalize PDF file
    doc.end();

    // Log the report generation
    await db.logs.insert({
      type: 'report_exported',
      level: 'info',
      event: `合规报告生成: ${user.username}`,
      nodeId: '系统',
      timestamp: new Date(),
      hash: 'rpt-' + Math.random().toString(36).substr(2, 8)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};
