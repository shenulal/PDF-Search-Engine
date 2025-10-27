const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const extract = require('pdf-text-extract');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

