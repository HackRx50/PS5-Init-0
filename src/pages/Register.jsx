import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Checkbox,
  Text,
  useToast,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function InsuranceClaimForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    email: "",
    incidentDate: "",
    claimType: "",
    claimAmount: "",
    incidentDescription: "",
    policyNumber: "",
    insurerName: "",
    paymentMethod: "",
    bankAccountNumber: "",
    supportingDocuments: null,
    incidentPhotos: null,
    fraudDeclaration: false,
    consentToTerms: false,
  });

  const navigate = useNavigate();
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files : value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = new FormData();
    data.append("full_name", formData.fullName);
    data.append("contact_number", formData.contactNumber);
    data.append("email_address", formData.email);
    data.append("incident_date", formData.incidentDate);
    data.append("claim_type", formData.claimType);
    data.append("claim_amount", formData.claimAmount);
    data.append("incident_description", formData.incidentDescription);
    data.append("policy_number", formData.policyNumber);
    data.append("issuer_name", formData.insurerName);
    data.append("payment_method", formData.paymentMethod);
    data.append("bank_acc_number", formData.bankAccountNumber);
  
    if (formData.supportingDocuments) {
      data.append("supporting_document", formData.supportingDocuments[0]);
    }
  
    if (formData.incidentPhotos) {
      for (let i = 0; i < formData.incidentPhotos.length; i++) {
        data.append("incident_photo", formData.incidentPhotos[i]);
      }
    }
  
    try {
      const response = await fetch("https://test-env.eba-y8shitmz.ap-south-1.elasticbeanstalk.com/claim", {
        method: "POST",
        body: data,
      });
  
      const result = await response.json(); // Move this inside the success block
  
      if (!response.ok) {
        console.error('Error response:', result); // Now `result` is defined
        throw new Error(result.message || 'Network response was not ok');
      }
  
      console.log(result);
      toast({
        title: "Claim submitted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  
      setTimeout(() => {
        toast({
          title: "Your claim is now being monitored",
          description: "We will review it and reach out to you as soon as possible.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your claim.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

  return (
    <Box maxWidth="1000px" margin="auto" mt={8} px={4}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">Insurance Claim Form</Text>
          
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* Personal Information */}
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input name="fullName" onChange={handleInputChange} />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Contact Number</FormLabel>
                <Input name="contactNumber" onChange={handleInputChange} />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input name="email" type="email" onChange={handleInputChange} />
              </FormControl>
            </GridItem>

            {/* Incident Information */}
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Incident Date</FormLabel>
                <Input name="incidentDate" type="date" onChange={handleInputChange} />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Claim Type</FormLabel>
                <Select name="claimType" placeholder="Select claim type" onChange={handleInputChange}>
                  <option value="Motor">Motor</option>
                  <option value="Health">Health</option>
                  <option value="Life">Life</option>
                  <option value="Property">Property</option>
                  <option value="Accident">Accident</option>
                </Select>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Claim Amount</FormLabel>
                <Input name="claimAmount" type="number" onChange={handleInputChange} />
              </FormControl>
            </GridItem>
            <GridItem colSpan={2}>
              <FormControl isRequired>
                <FormLabel>Incident Description</FormLabel>
                <Textarea name="incidentDescription" onChange={handleInputChange} />
              </FormControl>
            </GridItem>

            {/* Policy Information */}
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Policy Number</FormLabel>
                <Input name="policyNumber" onChange={handleInputChange} />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Insurer Name</FormLabel>
                <Input name="insurerName" onChange={handleInputChange} />
              </FormControl>
            </GridItem>

            {/* Payment Information */}
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Payment Method</FormLabel>
                <Select name="paymentMethod" placeholder="Select payment method" onChange={handleInputChange}>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </Select>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Bank Account Number</FormLabel>
                <Input name="bankAccountNumber" onChange={handleInputChange} />
              </FormControl>
            </GridItem>

            {/* Document Uploads */}
            <GridItem>
              <FormControl>
                <FormLabel>Upload Supporting Documents</FormLabel>
                <Input name="supportingDocuments" type="file" onChange={handleInputChange} />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <FormLabel>Upload Incident Photos</FormLabel>
                <Input name="incidentPhotos" type="file" multiple onChange={handleInputChange} />
              </FormControl>
            </GridItem>
          </Grid>

          {/* Consent & Declaration */}
          <GridItem colSpan={2}>
            <Checkbox name="fraudDeclaration" onChange={handleInputChange}>
              I declare that all information provided is true and accurate.
            </Checkbox>
          </GridItem>
          <GridItem colSpan={2}>
            <Checkbox name="consentToTerms" onChange={handleInputChange}>
              I consent to the terms and conditions.
            </Checkbox>
          </GridItem>

          <Button type="submit" colorScheme="blue" size="lg" width="full">Submit Claim</Button>
        </VStack>
      </form>
    </Box>
  );
}

export default InsuranceClaimForm;
