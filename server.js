// const express = require('express');
// const multer = require('multer');
// const { execFile } = require('child_process');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const upload = multer({ dest: 'uploads/' });

// app.use(express.static('public'));
// app.use(express.json());

// app.post('/process-pdf', upload.single('pdf'), (req, res) => {
//     const { outputPrefix, pagesPerChunk, maxPages, languages } = req.body;
//     const inputPdf = req.file.path;
//     const scriptPath = path.join(__dirname, 'complete_pdf_to_marked_down.sh');

//     // Ensure the script is executable
//     fs.chmodSync(scriptPath, '755');

//     // Prepare arguments for the shell script
//     const args = [
//         inputPdf,
//         outputPrefix,
//         pagesPerChunk,
//         maxPages,
//         ...languages.split(',') // Split languages into separate arguments
//     ];

//     execFile(scriptPath, args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Error: ${error.message}`);
//             return res.status(500).json({ error: error.message, stdout, stderr });
//         }
//         if (stderr) {
//             console.error(`stderr: ${stderr}`);
//         }
        
//         // Check if the final output file exists
//         const finalOutputPath = `${outputPrefix}_final_output.md`;
//         if (fs.existsSync(finalOutputPath)) {
//             res.json({
//                 message: 'PDF processed successfully',
//                 outputFile: finalOutputPath,
//                 stdout,
//                 stderr
//             });
//         } else {
//             res.status(500).json({
//                 error: 'Final output file not found',
//                 stdout,
//                 stderr
//             });
//         }
//     });
// });

// app.get('/download/:filename', (req, res) => {
//     const filename = req.params.filename;
//     const filePath = path.join(__dirname, filename);
    
//     if (fs.existsSync(filePath)) {
//         res.download(filePath);
//     } else {
//         res.status(404).send('File not found');
//     }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());

app.post('/process-pdf', upload.single('pdf'), (req, res) => {
    const { outputPrefix, pagesPerChunk, maxPages, languages } = req.body;
    const inputPdf = req.file.path;
    const scriptPath = path.join(__dirname, 'complete_pdf_to_marked_down.sh');

    // Ensure the script is executable
    fs.chmodSync(scriptPath, '755');

    // Prepare arguments for the shell script
    const args = [
        inputPdf,
        outputPrefix,
        pagesPerChunk,
        maxPages,
        ...languages.split(',') // Split languages into separate arguments
    ];

    // Print the command that will be executed
    console.log(`Executing shell script: ${scriptPath}`);
    console.log(`With arguments: ${args.join(' ')}`);

    execFile(scriptPath, args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message, stdout, stderr });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }

        // Print the stdout and stderr from the shell script
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        // Check if the final output file exists
        const finalOutputPath = `${outputPrefix}_final_output.md`;
        if (fs.existsSync(finalOutputPath)) {
            res.json({
                message: 'PDF processed successfully',
                outputFile: finalOutputPath,
                stdout,
                stderr
            });
        } else {
            res.status(500).json({
                error: 'Final output file not found',
                stdout,
                stderr
            });
        }
    });
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

