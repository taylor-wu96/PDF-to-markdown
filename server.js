const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/process-pdf', upload.single('pdf'), (req, res) => {
    const { outputPrefix, pagesPerChunk, maxPages } = req.body;
    const inputPdf = req.file.path;
    const scriptPath = path.join(__dirname, 'pdf_processor.sh');

    // Ensure the script is executable
    fs.chmodSync(scriptPath, '755');

    execFile(scriptPath, [inputPdf, outputPrefix, pagesPerChunk, maxPages], (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send(`Error: ${error.message}`);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send(`Error: ${stderr}`);
        }
        res.send(`PDF processed successfully. Output: ${stdout}`);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
