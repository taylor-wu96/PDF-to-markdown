// // const express = require('express');
// // const multer = require('multer');
// // const { execFile } = require('child_process');
// // const path = require('path');
// // const fs = require('fs');

// // const app = express();
// // const upload = multer({ dest: 'uploads/' });
// // const archiver = require('archiver');

// // app.use(express.static('public'));
// // app.use(express.json());


// // let taskProgress = {}; // Store progress by task ID

// // app.post('/process-pdf', upload.single('pdf'), (req, res) => {
// //   const { outputPrefix, pagesPerChunk, maxPages, languages } = req.body;
// //   const inputPdf = req.file.path;
// //   const scriptPath = path.join(__dirname, 'complete_pdf_to_marked_down.sh');
// //   const taskId = Date.now().toString();
// //   taskProgress[taskId] = 0;

// //   // Send the taskId immediately to the client
// //   res.json({ taskId, message: 'PDF processing started' });

// //   // Prepare arguments for the shell script
// //   const args = [inputPdf, outputPrefix, pagesPerChunk, maxPages, taskId, ...languages.split(',')];

// //   execFile(scriptPath, args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
// //     if (error) {
// //       console.error(`Error processing PDF: ${error.message}`);
// //       taskProgress[taskId] = -1; // Use a negative value to indicate error
// //       return;
// //     }

// //     if (stderr) {
// //       console.error(`stderr: ${stderr}`);
// //     }

// //     // Update progress as processing is done
// //     taskProgress[taskId] = 100;

// //     const finalOutputPath = `${outputPrefix}_final_output.md`;
// //     if (fs.existsSync(finalOutputPath)) {
// //       console.log(`PDF processed successfully: ${finalOutputPath}`);
// //     } else {
// //       console.error('Final output file not found');
// //       taskProgress[taskId] = -1; // Use a negative value to indicate error
// //     }

// //     fs.unlink(inputPdf, (err) => {
// //       if (err) {
// //         console.error(`Failed to delete uploaded file ${inputPdf}:`, err);
// //       } else {
// //         console.log(`Uploaded file ${inputPdf} deleted.`);
// //       }
// //     });
// //   });
// // });

// // app.post('/update-progress', express.json(), (req, res) => {
// //   const { taskId, progress } = req.body;
// //   if (taskId && progress !== undefined) {
// //     taskProgress[taskId] = progress;
// //     res.sendStatus(200);
// //   } else {
// //     res.status(400).json({ error: 'Invalid progress update' });
// //   }
// // });

// // app.get('/progress/:taskId', (req, res) => {
// //   const taskId = req.params.taskId;
// //   const progress = taskProgress[taskId];
  
// //   if (progress === undefined) {
// //     res.status(404).json({ error: 'Task not found' });
// //   } else if (progress === -1) {
// //     res.status(500).json({ error: 'Task failed' });
// //   } else {
// //     res.json({ progress });
// //   }
// // });

// // app.get('/download/:filename', (req, res) => {
// //   const filename = req.params.filename;
// // //   const filename = 'output_final_output.md';
// //   const filePath = path.join(__dirname, filename);
// //   if (fs.existsSync(filePath)) {
// //     res.download(filePath);
// //   } else {
// //     res.status(404).send('File not found');
// //   }
// // });

// // app.get('/zip/:customizationId', (req, res) => {
// //   const customizationId = req.params.customizationId;
// //   const outputFile = path.join(__dirname, `${customizationId}_archive.zip`);
// //   const outputMarkdownFile = path.join(__dirname, `${customizationId}_final_output.md`);
// //   const picturesDir = path.join(__dirname, customizationId+'_combined_images');

// //   // Ensure the output file is writable
// //   const output = fs.createWriteStream(outputFile);
// //   const archive = archiver('zip', {
// //       zlib: { level: 9 } // Set the compression level
// //   });

// //   output.on('close', () => {
// //       console.log(`${archive.pointer()} total bytes`);
// //       console.log('ZIP file created successfully');

// //       // Send the ZIP file to the client
// //       res.download(outputFile, err => {
// //           if (err) {
// //               console.error('Error sending ZIP file:', err);
// //               res.status(500).send('Error sending ZIP file');
// //           }

// //           // Optionally delete the ZIP file after sending it
// //           fs.unlink(outputFile, (err) => {
// //               if (err) {
// //                   console.error(`Failed to delete ZIP file ${outputFile}:`, err);
// //               } else {
// //                   console.log(`ZIP file ${outputFile} deleted.`);
// //               }
// //           });
// //       });
// //   });

// //   archive.on('error', (err) => {
// //       console.error('Error creating ZIP archive:', err);
// //       res.status(500).send('Error creating ZIP archive');
// //   });

// //   // Pipe archive data to the file
// //   archive.pipe(output);

// //   // Add the Markdown file to the archive
// //   if (fs.existsSync(outputMarkdownFile)) {
// //       archive.file(outputMarkdownFile, { name: `${customizationId}_final_output.md` });
// //   } else {
// //       console.error(`Markdown file ${outputMarkdownFile} not found`);
// //   }

// //   // Add all PNG files from the pictures directory to the archive
// //   if (fs.existsSync(picturesDir)) {
// //       const files = fs.readdirSync(picturesDir);
// //       files.forEach(file => {
// //           const filePath = path.join(picturesDir, file);
// //           if (path.extname(file).toLowerCase() === '.png') {
// //               archive.file(filePath, { name: path.join(customizationId+'_combined_images', file) });
// //           }
// //       });
// //   } else {
// //       console.error(`Pictures directory ${picturesDir} not found`);
// //   }

// //   // Finalize the archive (this is required)
// //   archive.finalize();
// // });

// // app.get('/picture', (req, res) => {
// //     const filename = req.query.filename;
// //     const relativePath = req.query.relativePath;

// //     if (!filename || !relativePath) {
// //         return res.status(400).send('Missing filename or relativePath parameter');
// //     }

// //     const filePath = path.join(__dirname, relativePath, filename);

// //     if (fs.existsSync(filePath)) {
// //         res.download(filePath);
// //     } else {
// //         res.status(404).send('File not found');
// //     }
// // });
// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const express = require('express');
// const { app } = require('electron');
// const multer = require('multer');
// const { execFile } = require('child_process');
// const path = require('path');
// const fs = require('fs');
// const archiver = require('archiver');
// const cors = require('cors');
// const upload = multer({ dest: 'uploads/' });
// const app = express();
// app.use(cors());
// app.use(express.static('public'));
// app.use(express.json());

// let taskProgress = {}; // Store progress by task ID

// app.post('/process-pdf', upload.single('pdf'), (req, res) => {
//   const { outputPrefix, pagesPerChunk, maxPages, languages } = req.body;
//   const inputPdf = req.file.path;
//   // const scriptPath = path.join(__dirname, 'complete_pdf_to_marked_down.sh');
//   const scriptPath = path.join(app.getPath('resources'), 'complete_pdf_to_marked_down.sh');
//   const taskId = Date.now().toString();
//   taskProgress[taskId] = 0;

//   res.json({ taskId, message: 'PDF processing started' });

//   const args = [inputPdf, outputPrefix, pagesPerChunk, maxPages, taskId, ...languages.split(',')];

//   execFile(scriptPath, args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error processing PDF: ${error.message}`);
//       taskProgress[taskId] = -1; 
//       return;
//     }

//     if (stderr) {
//       console.error(`stderr: ${stderr}`);
//     }

//     taskProgress[taskId] = 100;

//     const finalOutputPath = `${outputPrefix}_final_output.md`;
//     if (fs.existsSync(finalOutputPath)) {
//       console.log(`PDF processed successfully: ${finalOutputPath}`);
//     } else {
//       console.error('Final output file not found');
//       taskProgress[taskId] = -1; 
//     }

//     fs.unlink(inputPdf, (err) => {
//       if (err) {
//         console.error(`Failed to delete uploaded file ${inputPdf}:`, err);
//       } else {
//         console.log(`Uploaded file ${inputPdf} deleted.`);
//       }
//     });
//   });
// });

// app.post('/update-progress', express.json(), (req, res) => {
//   const { taskId, progress } = req.body;
//   if (taskId && progress !== undefined) {
//     taskProgress[taskId] = progress;
//     res.sendStatus(200);
//   } else {
//     res.status(400).json({ error: 'Invalid progress update' });
//   }
// });

// app.get('/progress/:taskId', (req, res) => {
//   const taskId = req.params.taskId;
//   const progress = taskProgress[taskId];
  
//   if (progress === undefined) {
//     res.status(404).json({ error: 'Task not found' });
//   } else if (progress === -1) {
//     res.status(500).json({ error: 'Task failed' });
//   } else {
//     res.json({ progress });
//   }
// });

// app.get('/download/:filename', (req, res) => {
//   const filename = req.params.filename;
//   const filePath = path.join(__dirname, filename);
//   if (fs.existsSync(filePath)) {
//     res.download(filePath);
//   } else {
//     res.status(404).send('File not found');
//   }
// });

// app.get('/zip/:customizationId', (req, res) => {
//   const customizationId = req.params.customizationId;
//   const outputFile = path.join(__dirname, `${customizationId}_archive.zip`);
//   const outputMarkdownFile = path.join(__dirname, `${customizationId}_final_output.md`);
//   const picturesDir = path.join(__dirname, customizationId+'_combined_images');

//   const output = fs.createWriteStream(outputFile);
//   const archive = archiver('zip', {
//       zlib: { level: 9 } 
//   });

//   output.on('close', () => {
//       console.log(`${archive.pointer()} total bytes`);
//       console.log('ZIP file created successfully');

//       res.download(outputFile, err => {
//           if (err) {
//               console.error('Error sending ZIP file:', err);
//               res.status(500).send('Error sending ZIP file');
//           }

//           fs.unlink(outputFile, (err) => {
//               if (err) {
//                   console.error(`Failed to delete ZIP file ${outputFile}:`, err);
//               } else {
//                   console.log(`ZIP file ${outputFile} deleted.`);
//               }
//           });
//       });
//   });

//   archive.on('error', (err) => {
//       console.error('Error creating ZIP archive:', err);
//       res.status(500).send('Error creating ZIP archive');
//   });

//   archive.pipe(output);

//   if (fs.existsSync(outputMarkdownFile)) {
//       archive.file(outputMarkdownFile, { name: `${customizationId}_final_output.md` });
//   } else {
//       console.error(`Markdown file ${outputMarkdownFile} not found`);
//   }

//   if (fs.existsSync(picturesDir)) {
//       const files = fs.readdirSync(picturesDir);
//       files.forEach(file => {
//           const filePath = path.join(picturesDir, file);
//           if (path.extname(file).toLowerCase() === '.png') {
//               archive.file(filePath, { name: path.join(customizationId+'_combined_images', file) });
//           }
//       });
//   } else {
//       console.error(`Pictures directory ${picturesDir} not found`);
//   }

//   archive.finalize();
// });

// app.get('/picture', (req, res) => {
//     const filename = req.query.filename;
//     const relativePath = req.query.relativePath;

//     if (!filename || !relativePath) {
//         return res.status(400).send('Missing filename or relativePath parameter');
//     }

//     const filePath = path.join(__dirname, relativePath, filename);

//     if (fs.existsSync(filePath)) {
//         res.download(filePath);
//     } else {
//         res.status(404).send('File not found');
//     }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// v.test

const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

let taskProgress = {}; // Store progress by task ID

// Helper function to get the correct path in both development and production
function getPath(relativePath) {
  return process.env.NODE_ENV === 'production'
    ? path.join(process.resourcesPath, relativePath)
    : path.join(__dirname, relativePath);
}

app.post('/process-pdf', upload.single('pdf'), (req, res) => {
  const { outputPrefix, pagesPerChunk, maxPages, languages } = req.body;
  const inputPdf = req.file.path;
  const scriptPath = getPath('complete_pdf_to_marked_down.sh');
  const taskId = Date.now().toString();
  taskProgress[taskId] = 0;

  res.json({ taskId, message: 'PDF processing started' });



  // Check if the script file exists
  if (!fs.existsSync(scriptPath)) {
    console.error(`Script not found at path: ${scriptPath}`);
    taskProgress[taskId] = -1;
    return;
  }
 


  // Check if the script file is executable
  try {
    fs.accessSync(scriptPath, fs.constants.X_OK);
  } catch (err) {
    console.error(`Script is not executable: ${scriptPath}`);
    taskProgress[taskId] = -1;
    return;
  }

  const args = [inputPdf, outputPrefix, pagesPerChunk, maxPages, taskId, ...languages.split(',')];
  console.log('Script path:', scriptPath);
  console.log('Input PDF path:', inputPdf);
  console.log('Executing script with args:', args);
  console.log('Environment:', process.env);
  console.log('Full script path:', path.resolve(scriptPath));
  fs.chmod(scriptPath, 0o755, (err) => {
    if (err) {
        console.error(`Failed to set executable permissions on ${scriptPath}:`, err);
    } else {
        console.log(`${scriptPath} is now executable`);
    }
  });
  execFile('/bin/bash', [scriptPath, ...args], { env: process.env, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error processing PDF: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
      taskProgress[taskId] = -1;
      return;
    }

    if (stderr) {
        console.error(`stderr: ${stderr}`);
    }

    console.log(`stdout: ${stdout}`);

    taskProgress[taskId] = 100;

    const finalOutputPath = getPath(`${outputPrefix}_final_output.md`);
    if (fs.existsSync(finalOutputPath)) {
        console.log(`PDF processed successfully: ${finalOutputPath}`);
    } else {
        console.error('Final output file not found');
        taskProgress[taskId] = -1;
    }

    fs.unlink(inputPdf, (err) => {
        if (err) {
            console.error(`Failed to delete uploaded file ${inputPdf}:`, err);
        } else {
            console.log(`Uploaded file ${inputPdf} deleted.`);
        }
    });
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
  const filePath = getPath(filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.get('/zip/:customizationId', (req, res) => {
  const customizationId = req.params.customizationId;
  const outputFile = getPath(`${customizationId}_archive.zip`);
  const outputMarkdownFile = getPath(`${customizationId}_final_output.md`);
  const picturesDir = getPath(`${customizationId}_combined_images`);

  const output = fs.createWriteStream(outputFile);
  const archive = archiver('zip', {
      zlib: { level: 9 } 
  });

  output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('ZIP file created successfully');

      res.download(outputFile, err => {
          if (err) {
              console.error('Error sending ZIP file:', err);
              res.status(500).send('Error sending ZIP file');
          }

          fs.unlink(outputFile, (err) => {
              if (err) {
                  console.error(`Failed to delete ZIP file ${outputFile}:`, err);
              } else {
                  console.log(`ZIP file ${outputFile} deleted.`);
              }
          });
      });
  });

  archive.on('error', (err) => {
      console.error('Error creating ZIP archive:', err);
      res.status(500).send('Error creating ZIP archive');
  });

  archive.pipe(output);

  if (fs.existsSync(outputMarkdownFile)) {
      archive.file(outputMarkdownFile, { name: `${customizationId}_final_output.md` });
  } else {
      console.error(`Markdown file ${outputMarkdownFile} not found`);
  }

  if (fs.existsSync(picturesDir)) {
      const files = fs.readdirSync(picturesDir);
      files.forEach(file => {
          const filePath = path.join(picturesDir, file);
          if (path.extname(file).toLowerCase() === '.png') {
              archive.file(filePath, { name: path.join(customizationId+'_combined_images', file) });
          }
      });
  } else {
      console.error(`Pictures directory ${picturesDir} not found`);
  }

  archive.finalize();
});

app.get('/picture', (req, res) => {
    const filename = req.query.filename;
    const relativePath = req.query.relativePath;

    if (!filename || !relativePath) {
        return res.status(400).send('Missing filename or relativePath parameter');
    }

    const filePath = getPath(path.join(relativePath, filename));

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

const PORT = process.env.PORT || 3000;

// Don't call app.listen() here. Instead, export the app:
module.exports = { app, PORT };
