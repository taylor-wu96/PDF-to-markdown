
// server.js test
const express = require('express');
const multer = require('multer');
(async () => {
  // Dynamically import fix-path and apply it
  const fixPath = await import('fix-path');
  fixPath.default(); // Apply the fix
})();
const { execFile,exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const cors = require('cors');
const os = require('os');
const log = require('electron-log');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
let taskProgress = {}; // Store progress by task ID
let log_str= ""


function getUploadDirectory() {
  const uploadDir = process.env.NODE_ENV === 'production'||true
    ? path.join(os.homedir(), '.pdf_to_markdown/uploads')
    : path.join(__dirname, 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return uploadDir;
}

function getOutputDictionary() {
  if (process.env.NODE_ENV === 'production'||true) {
    // In production, use the user's home directory
    log_str += "Output Path to join:"+ path.join(os.homedir(), '.pdf_to_markdown')+ "\n";
    return path.join(os.homedir(), '.pdf_to_markdown');
  } else {
    // In development, use the current directory
    return path.join(__dirname);
  }
}

// Ensure the writable directory exists
const uploadDir = getUploadDirectory();
const outputDir= getOutputDictionary();
// Ensure the directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const fileStorageEngine=multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null,'./src/public/images/')
    cb(null, uploadDir)
  }
})

// fs.mkdirSync(uploadDir, { recursive: true });
// const upload = multer({ dest: uploadDir });
const upload = multer({ storage: fileStorageEngine });

// Helper function to get the correct path in both development and production
function getPath(relativePath) {
  return process.env.NODE_ENV === 'production'
    ? path.join(process.resourcesPath, relativePath)
    : path.join(__dirname, relativePath);
}

app.post('/process-pdf', upload.single('pdf'), (req, res) => {
  const { outputPrefix, pagesPerChunk, maxPages, languages } = req.body;
  log_str += 'outputPrefix:'+ outputPrefix+"\n"+'pagesPerChunk:'+ pagesPerChunk+"\n"+'maxPages:'+ maxPages+"\n"+'languages:'+ languages+"\n";
  log_str += 'req.file:'+ req.file + "req.file.path:" + req.file.path+"\n";
  const inputPdf = req.file.path;

  if (!fs.existsSync(inputPdf)) {
    return res.status(500).json({ error: `Uploaded file not found: ${inputPdf}` });
  }
  const scriptPath = getPath('complete_pdf_to_marked_down.sh');
  const taskId = Date.now().toString();
  taskProgress[taskId] = 0;




  // Check if the script file exists
  if (!fs.existsSync(scriptPath)) {
    log_str += "Script not found at path:"+ scriptPath;
    console.error(`Script not found at path: ${scriptPath}`);
    taskProgress[taskId] = -1;
    return;
  }
 


  // Check if the script file is executable
  try {
    fs.accessSync(scriptPath, fs.constants.X_OK);
  } catch (err) {
    log_str += `Script is not executable: ${scriptPath}`;
    console.error(`Script is not executable: ${scriptPath}`);
    taskProgress[taskId] = -1;
    return;
  }

  const args = [inputPdf, outputPrefix, pagesPerChunk, maxPages, taskId, outputDir, ...languages.split(',')];
  log_str+="\n"+'Script path:'+ scriptPath+"\n"+'Input PDF path:', inputPdf+"\n"+'Executing script with args:', args+"\n"+'Environment:', process.env+"\n"+'Full script path:', path.resolve(scriptPath);
  // log.info('Script path:', scriptPath);
  // log.info('Input PDF path:', inputPdf);
  // log.info('Executing script with args:', args);
  // log.info('Environment:', process.env);
  // log.info('Full script path:', path.resolve(scriptPath));
  console.log('Script path:', scriptPath);
  console.log('Input PDF path:', inputPdf);
  console.log('Executing script with args:', args);
  console.log('Environment:', process.env);
  console.log('Full script path:', path.resolve(scriptPath));
  fs.chmod(scriptPath, 0o755, (err) => {
    if (err) {
        log_str+=`Failed to set executable permissions on ${scriptPath}:`+ err +'\n'
        console.error(`Failed to set executable permissions on ${scriptPath}:`, err);
        taskProgress[taskId] = -1;
    } else {
        log_str+=`${scriptPath} is now executable`+'\n'
        console.log(`${scriptPath} is now executable`);
    }
  });
  res.json({ taskId, message: "pdf start execute"});
  //   res.json({ taskId, message: "pdf start execute",stdout, error, stderr });
  execFile('/bin/bash', [scriptPath, ...args], { env: process.env, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
   
    if (error) {
      log_str+=`Error processing PDF: ${error.message}`+'\n'+`Error stack: ${error.stack}`+'\n'
      console.error(`Error processing PDF: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
      taskProgress[taskId] = -1;
      return;
    }

    if (stderr) {
        log_str+=`stderr: ${stderr}`+'\n';
        console.error(`stderr: ${stderr}`);
    }
    console.log('Current taskProgress:', taskProgress);
    console.log(`stdout: ${stdout}`);

    taskProgress[taskId] = 100;

    const finalOutputPath = path.join(outputDir,`${outputPrefix}_final_output.md`);
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
  try {
    const progress = taskProgress[taskId];
    
    if (progress === undefined) {
      res.status(404).json({ error: 'Task not found' });
    } else if (progress === -1) {
      res.status(500).json({ error: 'Task failed' });
    } else {
      res.json({ progress:progress});
    }
  } catch (error) {
    console.error(`Error retrieving progress for task ${taskId}:`, error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(outputDir,filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.get('/zip/:customizationId', (req, res) => {
  const customizationId = req.params.customizationId;
  const outputFile = path.join(outputDir,`${customizationId}_archive.zip`);
  const outputMarkdownFile = path.join(outputDir,`${customizationId}_final_output.md`);
  const picturesDir = path.join(outputDir,`${customizationId}_combined_images`);

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

    const filePath = path.join(outputDir,relativePath, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.get('/check-plugins', (req, res) => {
  // Define the commands to check for each plugin
  const commands = {
    markerPdf: 'pip show marker-pdf',
    ocrmypdf: 'pip show ocrmypdf',
    torch: 'pip show torch',
    pdftk: 'brew list pdftk-java',
  };

  const results = {};

  const checkCommand = (name, command) => {
    return new Promise((resolve) => {
      exec(command, (error, stdout) => {
        results[name] = !error ? 'Installed' : 'Not Installed';
        console.log('Plugin Name:', name ,results[name]);
        resolve();
      });
    });
  };

  // Run all checks in parallel
  Promise.all(Object.entries(commands).map(([name, command]) => checkCommand(name, command)))
    .then(() => {
      res.json(results);
    })
    .catch((err) => {
      console.log('Error checking plugins:', err);
      res.status(500).send('Error checking plugins');
    });
});



const PORT = process.env.PORT || 3000;

// Don't call app.listen() here. Instead, export the app:
module.exports = { app, PORT };
