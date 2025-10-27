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

### Search returns no results
- Verify the folder path is correct
- Ensure PDFs are in the specified folder
- Check that search text matches content in PDFs

## License

ISC