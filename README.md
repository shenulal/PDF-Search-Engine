# PDF Search Engine

A simple web application to search for text across multiple PDF files in local folders.

## Features

- 🔍 Search text across multiple PDFs
- 📁 Recursive folder scanning (Local Folder Search)
- 📤 Cumulative file upload from multiple folders (Upload Mode)
- 🎯 Case-insensitive search
- ⚡ Fast PDF text extraction
- 💻 Clean, modern web interface with gradient design
- 📊 Search statistics
- ⏳ Real-time progress bar with animated spinner
- 🔒 Button disable during processing to prevent duplicate requests
- 📋 Copy file paths to clipboard with one click
- 🎨 Professional UI with smooth animations

## Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/shenulal/PDF-Search-Engine.git
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

### Mode 1: Local Folder Search
3. Click on "📁 Local Folder Search" tab
4. Enter:
   - **Folder Path**: Full path to the folder containing PDFs (e.g., `C:\Users\YourName\Documents\PDFs`)
   - **Search Text**: Text to search for (e.g., `invoice`, `contract`)
5. Click "Search in Folder" and view results

### Mode 2: Upload PDF Files (Cumulative Upload)
3. Click on "📤 Upload PDF Files" tab (default)
4. Select PDF files from your computer
5. Click the "➕" button to add files to the list
6. Repeat steps 4-5 to add files from different folders (cumulative upload)
7. Enter search text in the search box
8. Click "Search Uploaded Files" and view results

**Features:**
- Upload up to 1000 files total
- Add files from multiple folders in batches
- View uploaded files in a scrollable list
- Remove individual files or clear all files
- Real-time progress bar shows upload and search progress
- Buttons are disabled during processing to prevent duplicate requests

## API Reference

### Health Check
```
GET /api/health
```
Returns: `{"status": "OK"}`

### Search Local Folder
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

### Upload PDF Files
```
POST /api/upload
Content-Type: multipart/form-data

files: [file1.pdf, file2.pdf, ...]
```

Response:
```json
{
  "success": true,
  "sessionId": "unique-session-id",
  "filesUploaded": 5,
  "totalSize": "25.5 MB"
}
```

### Search Uploaded Files
```
POST /api/search-uploaded
Content-Type: application/json

{
  "sessionId": "unique-session-id",
  "searchText": "search term"
}
```

Response:
```json
{
  "success": true,
  "searchText": "search term",
  "totalPdfs": 5,
  "matchingPdfs": 2,
  "results": [
    {
      "fileName": "document1.pdf",
      "filePath": "/path/to/uploaded/document1.pdf"
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

### Local Folder Search
1. Click "📁 Local Folder Search" tab
2. Enter folder path: `./test-pdfs`
3. Enter search text: `invoice`
4. Click "Search in Folder"
5. Observe progress bar and results

### Upload Mode
1. Click "📤 Upload PDF Files" tab (default)
2. Select PDF files from `test-pdfs/` folder
3. Click "➕" to add files
4. Enter search text: `invoice`
5. Click "Search Uploaded Files"
6. Observe progress bar, button disable, and results

### Troubleshooting

**Search returns no results**
- Verify the folder path is correct
- Ensure PDFs are in the specified folder
- Check that search text matches content in PDFs

**Upload fails**
- Check file size (max 100MB per file)
- Ensure files are valid PDFs
- Check browser console for errors

**Progress bar not showing**
- Clear browser cache
- Try a different browser
- Check browser console for JavaScript errors

## License

ISC