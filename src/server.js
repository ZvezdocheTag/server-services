// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Serve static files from current directory
app.use(express.static('./files'));

// Root route - list all HTML files
app.get('/', (req, res) => {
  // Read all HTML files in current directory
  fs.readdir('./files', (err, files) => {
    if (err) {
      return res.status(500).send('Error reading directory');
    }
    
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>HTML Files Directory</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 10px 0; }
          a { 
            display: block; 
            padding: 10px; 
            background: #f4f4f4; 
            text-decoration: none; 
            color: #333; 
            border-radius: 4px;
          }
          a:hover { background: #e0e0e0; }
          .info { background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Available HTML Files</h1>
        <div class="info">
          <strong>Server Info:</strong><br>
          • Running on: http://localhost:${PORT}<br>
          • Serving from: ${__dirname}<br>
          • Found ${htmlFiles.length} HTML files
        </div>
    `;
    
    if (htmlFiles.length === 0) {
      html += '<p>No HTML files found in current directory.</p>';
    } else {
      html += '<ul>';
      htmlFiles.forEach(file => {
        html += `<li><a href="/${file}">${file}</a></li>`;
      });
      html += '</ul>';
    }
    
    html += `
        <h2>Directory Contents</h2>
        <ul>
    `;
    
    files.forEach(file => {
      const ext = path.extname(file);
      const icon = ext === '.html' ? '📄' : ext === '.css' ? '🎨' : ext === '.js' ? '⚡' : '📁';
      html += `<li>${icon} ${file}</li>`;
    });
    
    html += `
        </ul>
      </body>
      </html>
    `;
    
    res.send(html);
  });
});

// Remove the catch-all route so individual HTML files can be accessed directly

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open your browser to see all available HTML files`);
});