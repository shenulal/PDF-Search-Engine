const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const extract = require('pdf-text-extract');
const cors = require('cors');
const multer = require('multer');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(express.static('public'));

// Configure multer for file uploads
const uploadDir = path.join(os.tmpdir(), 'pdf-search-uploads');
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        // Use timestamp + original name to avoid conflicts
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        cb(null, `${timestamp}-${randomStr}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB per file
    }
});

/**
 * Recursively get all PDF files from a directory
 */
async function getAllPdfFiles(dirPath) {
    const pdfFiles = [];
    
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively search subdirectories
                const subDirPdfs = await getAllPdfFiles(fullPath);
                pdfFiles.push(...subDirPdfs);
            } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.pdf') {
                pdfFiles.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error.message);
    }
    
    return pdfFiles;
}

/**
 * Search for text in a PDF file
 */
async function searchInPdf(pdfPath, searchText) {
    return new Promise((resolve) => {
        extract(pdfPath, (err, pages) => {
            if (err) {
                console.error(`Error parsing PDF ${pdfPath}:`, err.message);
                resolve(false);
                return;
            }

            try {
                // Combine all pages into one text
                const fullText = pages.join(' ').toLowerCase();
                const search = searchText.toLowerCase();

                resolve(fullText.includes(search));
            } catch (error) {
                console.error(`Error searching PDF ${pdfPath}:`, error.message);
                resolve(false);
            }
        });
    });
}

/**
 * Store uploaded files in session
 */
const uploadedFiles = new Map();

/**
 * API endpoint for uploading PDF files
 */
app.post('/api/upload', upload.array('files', 1000), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const sessionId = Date.now().toString();
        const fileInfo = req.files.map(file => ({
            originalName: file.originalname,
            storagePath: file.path,
            size: file.size
        }));

        uploadedFiles.set(sessionId, fileInfo);

        // Auto-cleanup after 1 hour
        setTimeout(() => {
            uploadedFiles.delete(sessionId);
            req.files.forEach(file => {
                fs.unlink(file.path).catch(err => console.error('Error deleting file:', err));
            });
        }, 60 * 60 * 1000);

        res.json({
            success: true,
            sessionId,
            filesCount: req.files.length,
            files: fileInfo.map(f => ({ name: f.originalName, size: f.size }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * API endpoint for searching in uploaded PDFs
 */
app.post('/api/search-uploaded', async (req, res) => {
    const { sessionId, searchText } = req.body;

    if (!sessionId || !searchText) {
        return res.status(400).json({ error: 'sessionId and searchText are required' });
    }

    const files = uploadedFiles.get(sessionId);
    if (!files) {
        return res.status(400).json({ error: 'Session expired or invalid' });
    }

    try {
        const results = [];
        const totalFiles = files.length;

        for (let index = 0; index < totalFiles; index++) {
            const fileInfo = files[index];
            const found = await searchInPdf(fileInfo.storagePath, searchText);
            if (found) {
                results.push({
                    fileName: fileInfo.originalName,
                    fileSize: fileInfo.size
                });
            }
        }

        res.json({
            success: true,
            searchText,
            totalPdfs: files.length,
            matchingPdfs: results.length,
            results,
            processingTime: Date.now()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * API endpoint to search PDFs
 */
app.post('/api/search', async (req, res) => {
    const { folderPath, searchText } = req.body;
    
    // Validate input
    if (!folderPath || !searchText) {
        return res.status(400).json({
            success: false,
            error: 'Both folderPath and searchText are required'
        });
    }
    
    try {
        // Check if folder exists
        const stats = await fs.stat(folderPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({
                success: false,
                error: 'The provided path is not a directory'
            });
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: `Folder not found: ${folderPath}`
        });
    }
    
    try {
        // Get all PDF files
        console.log(`Searching for PDFs in: ${folderPath}`);
        const pdfFiles = await getAllPdfFiles(folderPath);
        console.log(`Found ${pdfFiles.length} PDF files`);
        
        if (pdfFiles.length === 0) {
            return res.json({
                success: true,
                message: 'No PDF files found in the specified folder',
                results: []
            });
        }
        
        // Search in each PDF
        const results = [];
        let processedCount = 0;
        
        for (const pdfPath of pdfFiles) {
            processedCount++;
            console.log(`Processing ${processedCount}/${pdfFiles.length}: ${path.basename(pdfPath)}`);
            
            const found = await searchInPdf(pdfPath, searchText);
            
            if (found) {
                results.push({
                    fileName: path.basename(pdfPath),
                    filePath: pdfPath.replace(/\\/g, '/'),
                    relativePath: path.relative(folderPath, pdfPath).replace(/\\/g, '/')
                });
            }
        }
        
        console.log(`Search complete. Found ${results.length} matching PDFs`);
        
        res.json({
            success: true,
            searchText: searchText,
            folderPath: folderPath,
            totalPdfs: pdfFiles.length,
            matchingPdfs: results.length,
            results: results
        });
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during the search: ' + error.message
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'PDF Search Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`PDF Search Server is running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/search`);
});

