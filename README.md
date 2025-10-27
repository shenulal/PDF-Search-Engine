# PDF Search Engine

A simple web application to search for text across multiple PDF files in local folders.

## Features

- 🔍 Search text across multiple PDFs
- 📁 Recursive folder scanning
- 🎯 Case-insensitive search
- ⚡ Fast PDF text extraction
- 💻 Clean, modern web interface
- 📊 Search statistics

## Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/pdf-search-engine.git
cd pdf-search-engine
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and go to:
```
http://localhost:3000
```

3. Enter:
   - **Folder Path**: Full path to the folder containing PDFs (e.g., `C:\Users\YourName\Documents\PDFs`)
   - **Search Text**: Text to search for (e.g., `invoice`, `contract`)

4. Click "Search PDFs" and view results

## API Reference

### Health Check
```
GET /api/health
```
Returns: `{"status": "OK"}`

### Search PDFs
```
POST /api/search
Content-Type: application/json

{
  "folderPath": "C:\\path\\to\\pdfs",
  "searchText": "search term"
}
```

Response:
```json
{
  "success": true,
  "searchText": "search term",
  "totalPdfs": 10,
  "matchingPdfs": 3,
  "results": [
    {
      "fileName": "document1.pdf",
      "filePath": "C:\\path\\to\\pdfs\\document1.pdf"
    }
  ]
}
```

## Project Structure

```
pdf-search-engine/
├── server.js              # Express backend
├── public/
│   └── index.html         # Web interface
├── package.json           # Dependencies
├── test-pdfs/             # Sample PDFs for testing
└── README.md              # This file
```

## Testing

Sample PDFs are included in the `test-pdfs/` folder. Try searching for:
- "invoice" - Finds 2 PDFs
- "contract" - Finds 1 PDF
- "report" - Finds 1 PDF

## Deployment

### Deploy to Render.com

1. Push to GitHub:
```bash
git add .
git commit -m "PDF Search Engine"
git push origin main
```

2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Select your repository
5. Set Build command: `npm install`
6. Set Start command: `npm start`
7. Click "Create Web Service"

Your app will be live at: `https://pdf-search-engine.onrender.com`

## Technology Stack

- **Backend**: Express.js
- **PDF Processing**: pdf-text-extract
- **Frontend**: HTML5, CSS3, JavaScript
- **Hosting**: Render.com

## Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### Port 3000 already in use
Change the port in `server.js` or kill the process using port 3000

### Search returns no results
- Verify the folder path is correct
- Ensure PDFs are in the specified folder
- Check that search text matches content in PDFs

## License

ISC

