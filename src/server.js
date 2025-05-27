const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.static('.'));
function hasHtmlFiles(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.some(file => file.endsWith('.html'));
  } catch (err) {
    return false;
  }
}

function findIndexFile(dirPath) {
  const indexFiles = ['index.html', 'index.htm', 'main.html', 'app.html'];
  for (const indexFile of indexFiles) {
    if (fs.existsSync(path.join(dirPath, indexFile))) {
      return indexFile;
    }
  }

  try {
    const files = fs.readdirSync(dirPath);
    const htmlFile = files.find(file => file.endsWith('.html'));
    return htmlFile || null;
  } catch (err) {
    return null;
  }
}

app.get('/', (req, res) => {
  const htmlFiles = [];
  const projectFolders = [];
  const otherFiles = [];

  const scanDirectory = (dirPath, type) => {
    if (!fs.existsSync(dirPath)) return;
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      entries.forEach(entry => {
        if (type === 'packages' && entry.isDirectory()) {
          // Scan subdirectories in packages folder for projects
          const subDirPath = path.join(dirPath, entry.name);
          if (hasHtmlFiles(subDirPath)) {
            const indexFile = findIndexFile(subDirPath);
            projectFolders.push({
              name: entry.name,
              path: `packages/${entry.name}`,
              indexFile: indexFile,
              type: 'project'
            });
          }
        } else if (type === 'files') {
          if (entry.name.endsWith('.html')) {
            htmlFiles.push({
              name: entry.name,
              path: `files/${entry.name}`,
              type: 'standalone'
            });
          } else {
            otherFiles.push({
              name: entry.name,
              path: `files/${entry.name}`
            });
          }
        }
      });
    } catch (err) {
      console.error(`Error reading ${dirPath}:`, err);
    }
  };
  
  scanDirectory('./packages', 'packages');
  scanDirectory('./files', 'files');
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Development Server</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          h1 { 
            color: #333; 
            margin-bottom: 10px;
            font-size: 2.5em;
          }
          h2 { 
            color: #555; 
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-top: 30px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          .card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #667eea;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .project-card {
            border-left-color: #28a745;
          }
          .file-card {
            border-left-color: #ffc107;
          }
          a { 
            text-decoration: none; 
            color: #333;
            font-weight: 500;
          }
          a:hover { 
            color: #667eea;
          }
          .project-title {
            font-size: 1.2em;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .project-subtitle {
            color: #666;
            font-size: 0.9em;
          }
          .info { 
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #2196f3;
          }
          .stats {
            display: flex;
            gap: 30px;
            margin: 15px 0;
          }
          .stat {
            text-align: center;
          }
          .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
          }
          .stat-label {
            color: #666;
            font-size: 0.9em;
          }
          .icon {
            font-size: 1.5em;
            margin-right: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Development Server</h1>
          
          <div class="info">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>Server Status:</strong> Running on http://localhost:${PORT}<br>
                <strong>Directory:</strong> ${path.resolve('.')}
              </div>
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">${projectFolders.length}</div>
                  <div class="stat-label">Projects</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${htmlFiles.length}</div>
                  <div class="stat-label">HTML Files</div>
                </div>
              </div>
            </div>
          </div>
    `;
    
    if (projectFolders.length > 0) {
      html += '<h2>📁 Mini Projects</h2><div class="grid">';
      projectFolders.forEach(project => {
        const projectUrl = project.indexFile ? 
          `/${project.path}/${project.indexFile}` : 
          `/${project.path}/`;
        
        html += `
          <div class="card project-card">
            <a href="${projectUrl}">
              <div class="project-title">
                <span class="icon">🎯</span>${project.name}
              </div>
              <div class="project-subtitle">
                Entry point: ${project.indexFile || 'Browse files'}
              </div>
            </a>
          </div>
        `;
      });
      html += '</div>';
    }
    
    // Individual HTML Files Section
    if (htmlFiles.length > 0) {
      html += '<h2>📄 Individual HTML Files</h2><div class="grid">';
      htmlFiles.forEach(file => {
        html += `
          <div class="card file-card">
            <a href="/${file.path}">
              <div class="project-title">
                <span class="icon">📝</span>${file.name}
              </div>
              <div class="project-subtitle">
                Standalone HTML file
              </div>
            </a>
          </div>
        `;
      });
      html += '</div>';
    }
    
    // Other Files Section (if any)
    if (otherFiles.length > 0) {
      html += '<h2>📂 Other Files</h2><div class="grid">';
      otherFiles.forEach(file => {
        html += `
          <div class="card">
            <a href="/${file.path}">
              <div class="project-title">
                <span class="icon">📄</span>${file.name}
              </div>
              <div class="project-subtitle">
                ${path.extname(file.name) || 'File'}
              </div>
            </a>
          </div>
        `;
      });
      html += '</div>';
    }
    
    if (projectFolders.length === 0 && htmlFiles.length === 0) {
      html += `
        <div class="card">
          <h3>No projects found</h3>
          <p>Add some HTML files or create folders with HTML projects to get started!</p>
        </div>
      `;
    }
    
    html += `
        </div>
      </body>
      </html>
    `;
    
    res.send(html);
  });

// Handle project folder routing - serve index file for directories
app.get('/packages/:folder', (req, res, next) => {
  const folderPath = path.join('./packages', req.params.folder);
  
  // Check if it's a directory
  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    const indexFile = findIndexFile(folderPath);
    if (indexFile) {
      res.redirect(`/packages/${req.params.folder}/${indexFile}`);
    } else {
      // Show directory listing for folders without index files
      fs.readdir(folderPath, (err, files) => {
        if (err) return next();
        
        let html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${req.params.folder} - Directory</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .back-link { margin-bottom: 20px; }
              a { display: block; padding: 8px; margin: 4px 0; background: #f4f4f4; text-decoration: none; border-radius: 4px; }
              a:hover { background: #e0e0e0; }
            </style>
          </head>
          <body>
            <div class="back-link"><a href="/">← Back to Home</a></div>
            <h1>📁 ${req.params.folder}</h1>
            <ul style="list-style: none; padding: 0;">
        `;
        
        files.forEach(file => {
          const ext = path.extname(file);
          const icon = ext === '.html' ? '📄' : ext === '.css' ? '🎨' : ext === '.js' ? '⚡' : '📄';
          html += `<li><a href="/packages/${req.params.folder}/${file}">${icon} ${file}</a></li>`;
        });
        
        html += '</ul></body></html>';
        res.send(html);
      });
    }
  } else {
    next(); // Let express.static handle it
  }
});

// Handle files directory routing
app.get('/files/:filename', (req, res, next) => {
  const filePath = path.join('./files', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Development Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${path.resolve('.')}`);
  console.log(`🌐 Open your browser to see all projects and files`);
});