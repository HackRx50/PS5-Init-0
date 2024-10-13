import React, { useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const Invoices = () => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState({});
  const [classificationData, setClassificationData] = useState({});
  const [petitionerCaseDetails, setPetitionerCaseDetails] = useState([]);
  const [advocateCaseDetails, setAdvocateCaseDetails] = useState([]);
  const [commonCaseDetails, setCommonCaseDetails] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const response = await axios.post("https://04b7-125-16-34-110.ngrok-free.app/test", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data) {
          const { parsed_data, classification_data, petitioner_case_details, advocate_case_details, common_case_details } = response.data;
          setParsedData(parsed_data);
          setClassificationData(classification_data);
          
          // Assign unique IDs for DataGrid
          setPetitionerCaseDetails(petitioner_case_details.map((item, index) => ({ ...item, id: index })));
          setAdvocateCaseDetails(advocate_case_details.map((item, index) => ({ ...item, id: index })));
          setCommonCaseDetails(common_case_details.map((item, index) => ({ ...item, id: index })));
        }
      } catch (error) {
        console.error("Error uploading the PDF: ", error);
      }
    }
  };

  return (
    <Box>
      <input type="file" onChange={handleFileChange} />
      <Button variant="contained" onClick={handleSubmit}>Submit</Button>

      <Typography variant="h6" sx={{ marginTop: 2 }}>Parsed Data</Typography>
      <Grid container spacing={2}>
        {Object.entries(parsedData).map(([key, value]) => (
          <Grid item xs={12} sm={6} key={key}>
            <Typography>
              <strong>{key}:</strong> {value}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ marginTop: 2 }}>Classification Data</Typography>
      <Typography>
        <strong>Fraud Analysis:</strong> {classificationData["Fraud Analysis"]}
      </Typography>
      <Typography>
        <strong>Reasoning:</strong>
      </Typography>
      <ul>
        {classificationData.Reasoning?.map((reason, index) => (
          <li key={index}>{reason}</li>
        ))}
      </ul>
      {/* <Typography>
        <strong>Fraud Flag:</strong> {classificationData.Fraud_Flag ? "Yes" : "No"}
      </Typography> */}

      <Typography variant="h6" sx={{ marginTop: 2 }}>Petitioner Case Details</Typography>
      <DataGrid
        rows={petitionerCaseDetails}
        columns={[
          { field: "id", headerName: "ID", width: 90 },
          { field: "caseNumber", headerName: "Case Number", width: 150 },
          // Add more columns based on your case details structure
        ]}
        pageSize={5}
        autoHeight
        getRowId={(row) => row.id} // Specify which field to use as the unique ID
      />

      <Typography variant="h6" sx={{ marginTop: 2 }}>Advocate Case Details</Typography>
      <DataGrid
        rows={advocateCaseDetails}
        columns={[
          { field: "id", headerName: "ID", width: 90 },
          { field: "caseNumber", headerName: "Case Number", width: 150 },
          // Add more columns based on your case details structure
        ]}
        pageSize={5}
        autoHeight
        getRowId={(row) => row.id} // Specify which field to use as the unique ID
      />

      <Typography variant="h6" sx={{ marginTop: 2 }}>Common Case Details</Typography>
      <DataGrid
        rows={commonCaseDetails}
        columns={[
          { field: "id", headerName: "ID", width: 90 },
          { field: "caseNumber", headerName: "Case Number", width: 150 },
          // Add more columns based on your case details structure
        ]}
        pageSize={5}
        autoHeight
        getRowId={(row) => row.id} // Specify which field to use as the unique ID
      />
    </Box>
  );
};

export default Invoices;
