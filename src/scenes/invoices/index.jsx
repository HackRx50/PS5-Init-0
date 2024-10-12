import React, { useState } from "react";
import { Box, Button, Typography, Grid, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const Invoices = () => {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle submit button click
  const handleSubmit = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("api_key", "your-api-key-here"); // Replace with actual API key

      try {
        const response = await axios.post("http://localhost:5000/process-pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data) {
          const data = response.data.choices[0].message.content; // Adjust based on actual response structure
          const jsonData = JSON.parse(data);

          // Set columns and rows based on the response
          const newColumns = Object.keys(jsonData).map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            flex: 1,
          }));

          setColumns(newColumns);
          setTableData([jsonData]);
        }
      } catch (error) {
        console.error("Error uploading the PDF: ", error);
      }
    }
  };

  // Sample static data for parsed information (can be replaced with dynamic data later)
  const parsedData = {
    "Petitioner Name": "John Doe",
    "Petitioner Advocate": "Adv. Smith",
    "State": "California",
    "District": "Los Angeles",
    "Court Complex": "Downtown Court Complex",
    "Claim Amount": "$500,000",
  };

  return (
    <Box m="20px">
      <Typography variant="h4">PDF OCR and Analysis</Typography>

      {/* File upload section */}
      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <input type="file" onChange={handleFileChange} />
          <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ ml: 2 }}>
            Upload and Process
          </Button>
        </Grid>

        {/* Parsed data next to the button */}
        <Grid item xs={12} mt={2}>
          <Typography variant="h6" gutterBottom>Parsed Data (Static)</Typography>
          <Grid container spacing={2}>
            {Object.keys(parsedData).map((key) => (
              <Grid item xs={6} sm={4} key={key}>
                <Typography><strong>{key}:</strong> {parsedData[key]}</Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Multiple analysis tables below the button and parsed data */}
      <Box mt={5}>
        <Typography variant="h5" gutterBottom>Analysis Tables</Typography>

        {/* Table 1 */}
        <Box mb={4}>
          <Typography variant="h6">Table 1: Example Data</Typography>
          <Box height="40vh" mt={2}>
            {columns.length > 0 && tableData.length > 0 ? (
              <DataGrid rows={tableData} columns={columns} />
            ) : (
              <Typography>No data yet. Please upload a PDF.</Typography>
            )}
          </Box>
        </Box>

        {/* Table 2 - Placeholder for another analysis table */}
        <Box mb={4}>
          <Typography variant="h6">Table 2: Another Data Analysis</Typography>
          <Box height="40vh" mt={2}>
            {/* Replace with another DataGrid or analysis content */}
            {columns.length > 0 && tableData.length > 0 ? (
              <DataGrid rows={tableData} columns={columns} />
            ) : (
              <Typography>No data yet. Please upload a PDF.</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Invoices;
