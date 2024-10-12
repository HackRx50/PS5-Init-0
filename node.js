const express = require("express");
const multer = require("multer");
const axios = require("axios");
const Tesseract = require("tesseract.js");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 5000;

// Set up Multer to handle file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Endpoint to handle PDF upload and OCR processing
app.post("/process-pdf", upload.single("pdf"), (req, res) => {
  const pdfPath = path.join(__dirname, "uploads", req.file.filename);

  // Use Tesseract.js for OCR
  Tesseract.recognize(pdfPath, "eng", {
    logger: (m) => console.log(m),
  })
    .then(({ data: { text } }) => {
      // After extracting text, call Gemma API with the text
      const api_key = req.body.api_key; // Get API key from request
      const prompt = `
        I have extracted the following text from a legal document:

        ${text}

        Please analyze the text and provide the following information in JSON format:
        1. Petitioner name
        2. Petitioner Advocate
        3. State
        4. District
        5. Court Complex
        6. Claim Amount
      `;

      // Call Gemma API
      axios
        .post(
          "https://cloud.olakrutrim.com/v1/chat/completions",
          {
            model: "Gemma-2-27B-IT",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 512,
            n: 1,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${api_key}`,
            },
          }
        )
        .then((gemmaRes) => {
          res.json(gemmaRes.data);
        })
        .catch((err) => {
          res.status(500).json({ error: "Error processing the PDF", details: err.message });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: "Error in OCR processing", details: error.message });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
