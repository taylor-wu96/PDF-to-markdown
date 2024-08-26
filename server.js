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

let taskProgress = {}; // Store progress by task ID

app.post('/process-pdf', upload.single('pdf'), (req, res) => {
  const { outputPrefix, pagesPerChunk, maxPages, languages } = req.body;
  const inputPdf = req.file.path;
  const scriptPath = path.join(__dirname, 'complete_pdf_to_marked_down.sh');
  const taskId = Date.now().toString();
  taskProgress[taskId] = 0;

  // Send the taskId immediately to the client
  res.json({ taskId, message: 'PDF processing started' });

  // Prepare arguments for the shell script
  const args = [inputPdf, outputPrefix, pagesPerChunk, maxPages, taskId, ...languages.split(',')];

  execFile(scriptPath, args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error processing PDF: ${error.message}`);
      taskProgress[taskId] = -1; // Use a negative value to indicate error
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }

    // Update progress as processing is done
    taskProgress[taskId] = 100;

    const finalOutputPath = `${outputPrefix}_final_output.md`;
    if (fs.existsSync(finalOutputPath)) {
      console.log(`PDF processed successfully: ${finalOutputPath}`);
    } else {
      console.error('Final output file not found');
      taskProgress[taskId] = -1; // Use a negative value to indicate error
    }
  });
});

app.post('/update-progress', express.json(), (req, res) => {
  const { taskId, progress } = req.body;
  if (taskId && progress !== undefined) {
    taskProgress[taskId] = progress;
    res.sendStatus(200);
  } else {
    res.status(400).json({ error: 'Invalid progress update' });
  }
});

app.get('/progress/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  const progress = taskProgress[taskId];
  
  if (progress === undefined) {
    res.status(404).json({ error: 'Task not found' });
  } else if (progress === -1) {
    res.status(500).json({ error: 'Task failed' });
  } else {
    res.json({ progress });
  }
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
//   const filename = 'output_final_output.md';
  const filePath = path.join(__dirname, filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

