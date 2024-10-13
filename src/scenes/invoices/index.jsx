import React, { useState } from "react";
import { Box, Typography, Button, Grid, Card, CardContent } from "@mui/material";
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

  const handleApiCall = async (formData, retryCount = 0) => {
    try {
      const response = await axios.post("https://04b7-125-16-34-110.ngrok-free.app/api/process-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        const {
          parsed_data,
          classification_data,
          petitioner_case_details = [],
          advocate_case_details = [],
          common_case_details = [],
        } = response.data;

        setParsedData(parsed_data);
        setClassificationData(classification_data);
        setPetitionerCaseDetails(petitioner_case_details);
        setAdvocateCaseDetails(advocate_case_details);
        setCommonCaseDetails(common_case_details);
      }
    } catch (error) {
      console.error("Error uploading the PDF: ", error);

      // Retry if it's a 500 error and we have attempts left
      if (error.response && error.response.status === 500 && retryCount < 3) {
        console.log(Retrying... Attempt ${retryCount + 1});
        await handleApiCall(formData, retryCount + 1); // Recursive call
      }
    }
  };

  const handleSubmit = () => {
    if (file) {
      const formData = new FormData();
      formData.append("pdf", file);
      handleApiCall(formData); // Call the API function
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <input type="file" onChange={handleFileChange} />
      <Button variant="contained" onClick={handleSubmit} sx={{ marginTop: 2 }}>
        Submit
      </Button>

      {/* Parsed Data Section */}
      <Typography variant="h5" sx={{ marginTop: 4, fontWeight: 'bold' }}>Parsed Data</Typography>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {Object.entries(parsedData).map(([key, value]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1">
                  <strong>{key}:</strong> {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Classification Data Section */}
      <Typography variant="h5" sx={{ marginTop: 4, fontWeight: 'bold' }}>Classification Data</Typography>
      <Card variant="outlined" sx={{ marginTop: 2 }}>
        <CardContent>
          <Typography variant="body1">
            <strong>Fraud Analysis:</strong> {classificationData["Fraud Analysis"] || "N/A"}
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            <strong>Reasoning:</strong>
          </Typography>
          <ul>
            {classificationData.Reasoning?.length > 0 ? (
              classificationData.Reasoning.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))
            ) : (
              <li>No reasoning available.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Petitioner Case Details */}
      <Typography variant="h5" sx={{ marginTop: 4, fontWeight: 'bold' }}>Petitioner Case Details</Typography>
      <DataGrid
        rows={petitionerCaseDetails.map((caseDetail, index) => ({ ...caseDetail, id: index }))}
        columns={[
          { field: "case_number", headerName: "Case Number", width: 150 },
          { field: "case_year", headerName: "Case Year", width: 100 },
          { field: "petitioner", headerName: "Petitioner", width: 200 },
          { field: "respondent", headerName: "Respondent", width: 200 },
          { field: "unique_case_number", headerName: "Unique Case Number", width: 150 },
          { field: "cnr", headerName: "CNR", width: 150 },
          { field: "state", headerName: "State", width: 150 },
          { field: "district", headerName: "District", width: 150 },
          { field: "court_complex", headerName: "Court Complex", width: 200 },
          { field: "case_type", headerName: "Case Type", width: 150 },
          { field: "filing_date", headerName: "Filing Date", width: 150 },
          { field: "regi_number", headerName: "Reg. Number", width: 150 },
          { field: "first_hearing_date", headerName: "First Hearing Date", width: 180 },
          { field: "decision_date", headerName: "Decision Date", width: 150 },
          { field: "hearing_count", headerName: "Hearing Count", width: 130 },
          { field: "nature_of_disposal", headerName: "Nature of Disposal", width: 180 },
          { field: "court_number_and_judge", headerName: "Court & Judge", width: 200 },
          { field: "petitioner_advocate", headerName: "Petitioner Advocate", width: 200 },
          { field: "respondent_advocate", headerName: "Respondent Advocate", width: 200 },
          { field: "under_act", headerName: "Under Act", width: 150 },
          { field: "under_section", headerName: "Under Section", width: 150 },
          { field: "incident_details", headerName: "Incident Details", width: 250 },
          { field: "claim_amount", headerName: "Claim Amount", width: 150 },
          { field: "settlement_amount", headerName: "Settlement Amount", width: 180 },
          { field: "interest_rate", headerName: "Interest Rate", width: 120 },
          { field: "payment_mode", headerName: "Payment Mode", width: 150 },
          { field: "judge_name", headerName: "Judge Name", width: 150 },
          { field: "summary", headerName: "Summary", width: 250 },
        ]}
        pageSize={5}
        autoHeight
        sx={{ marginTop: 2 }}
      />

      {/* Advocate Case Details */}
      <Typography variant="h5" sx={{ marginTop: 4, fontWeight: 'bold' }}>Advocate Case Details</Typography>
      <DataGrid
        rows={advocateCaseDetails.map((caseDetail, index) => ({ ...caseDetail, id: index }))}
        columns={[
          { field: "case_number", headerName: "Case Number", width: 150 },
          { field: "case_year", headerName: "Case Year", width: 100 },
          { field: "petitioner", headerName: "Petitioner", width: 200 },
          { field: "respondent", headerName: "Respondent", width: 200 },
          { field: "unique_case_number", headerName: "Unique Case Number", width: 150 },
          { field: "cnr", headerName: "CNR", width: 150 },
          { field: "state", headerName: "State", width: 150 },
          { field: "district", headerName: "District", width: 150 },
          { field: "court_complex", headerName: "Court Complex", width: 200 },
          { field: "case_type", headerName: "Case Type", width: 150 },
          { field: "filing_date", headerName: "Filing Date", width: 150 },
          { field: "regi_number", headerName: "Reg. Number", width: 150 },
          { field: "first_hearing_date", headerName: "First Hearing Date", width: 180 },
          { field: "decision_date", headerName: "Decision Date", width: 150 },
          { field: "hearing_count", headerName: "Hearing Count", width: 130 },
          { field: "nature_of_disposal", headerName: "Nature of Disposal", width: 180 },
          { field: "court_number_and_judge", headerName: "Court & Judge", width: 200 },
          { field: "petitioner_advocate", headerName: "Petitioner Advocate", width: 200 },
          { field: "respondent_advocate", headerName: "Respondent Advocate", width: 200 },
          { field: "under_act", headerName: "Under Act", width: 150 },
          { field: "under_section", headerName: "Under Section", width: 150 },
          { field: "incident_details", headerName: "Incident Details", width: 250 },
          { field: "claim_amount", headerName: "Claim Amount", width: 150 },
          { field: "settlement_amount", headerName: "Settlement Amount", width: 180 },
          { field: "interest_rate", headerName: "Interest Rate", width: 120 },
          { field: "payment_mode", headerName: "Payment Mode", width: 150 },
          { field: "judge_name", headerName: "Judge Name", width: 150 },
          { field: "summary", headerName: "Summary", width: 250 },
        ]}
        pageSize={5}
        autoHeight
        sx={{ marginTop: 2 }}
      />

      {/* Common Case Details */}
      <Typography variant="h5" sx={{ marginTop: 4, fontWeight: 'bold' }}>Common Case Details</Typography>
      <DataGrid
        rows={commonCaseDetails.map((caseDetail, index) => ({ ...caseDetail, id: index }))}
        columns={[
          { field: "case_number", headerName: "Case Number", width: 150 },
          { field: "case_year", headerName: "Case Year", width: 100 },
          { field: "petitioner", headerName: "Petitioner", width: 200 },
          { field: "respondent", headerName: "Respondent", width: 200 },
          { field: "unique_case_number", headerName: "Unique Case Number", width: 150 },
          { field: "cnr", headerName: "CNR", width: 150 },
          { field: "state", headerName: "State", width: 150 },
          { field: "district", headerName: "District", width: 150 },
          { field: "court_complex", headerName: "Court Complex", width: 200 },
          { field: "case_type", headerName: "Case Type", width: 150 },
          { field: "filing_date", headerName: "Filing Date", width: 150 },
          { field: "regi_number", headerName: "Reg. Number", width: 150 },
          { field: "first_hearing_date", headerName: "First Hearing Date", width: 180 },
          { field: "decision_date", headerName: "Decision Date", width: 150 },
          { field: "hearing_count", headerName: "Hearing Count", width: 130 },
          { field: "nature_of_disposal", headerName: "Nature of Disposal", width: 180 },
          { field: "court_number_and_judge", headerName: "Court & Judge", width: 200 },
          { field: "petitioner_advocate", headerName: "Petitioner Advocate", width: 200 },
          { field: "respondent_advocate", headerName: "Respondent Advocate", width: 200 },
          { field: "under_act", headerName: "Under Act", width: 150 },
          { field: "under_section", headerName: "Under Section", width: 150 },
          { field: "incident_details", headerName: "Incident Details", width: 250 },
          { field: "claim_amount", headerName: "Claim Amount", width: 150 },
          { field: "settlement_amount", headerName: "Settlement Amount", width: 180 },
          { field: "interest_rate", headerName: "Interest Rate", width: 120 },
          { field: "payment_mode", headerName: "Payment Mode", width: 150 },
          { field: "judge_name", headerName: "Judge Name", width: 150 },
          { field: "summary", headerName: "Summary", width: 250 },
        ]}
        pageSize={5}
        autoHeight
        sx={{ marginTop: 2 }}
      />
    </Box>
  );
};

export default Invoices;