import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Stack,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ViewIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "../components/Dashboard";

const dummyPhoto = "https://via.placeholder.com/50";
const ITEMS_PER_PAGE = 5;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claims, setClaims] = useState([]);
  
  const borderColor = useColorModeValue("blue.400", "blue.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const hoverBgColor = useColorModeValue("gray.100", "gray.600");

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch(
          "https://test-env.eba-y8shitmz.ap-south-1.elasticbeanstalk.com/claim"
        );
        const data = await response.json();

        
        const formattedClaims = data.claims.map((claim) => ({
          id: claim.id,
          fullName: claim.full_name,
          email: claim.email_address,
          claimAmount: parseFloat(claim.claim_amount),
          claimType: claim.claim_type,
          incidentDate: claim.incident_date,
          policyNumber: claim.policy_number,
          status: claim.prediction === "Fraudulent" ? "Flagged" : "Active",
          contactNumber: claim.contact_number,
          insurerName: claim.issuer_name,
          paymentMethod: claim.payment_method,
          bankAccountNumber: claim.bank_acc_number,
          incidentDescription: claim.incident_description,
        }));

        setClaims(formattedClaims);
      } catch (error) {
        toast.error("Failed to fetch claims");
      }
    };

    fetchClaims();
  }, []);

  const flaggedClaims = claims.filter((claim) => claim.status === "Flagged");
  const unflaggedClaims = claims.filter((claim) => claim.status !== "Flagged");

  const totalPages = Math.ceil(unflaggedClaims.length / ITEMS_PER_PAGE);
  const indexOfLastClaim = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstClaim = indexOfLastClaim - ITEMS_PER_PAGE;
  const currentClaims = unflaggedClaims.slice(indexOfFirstClaim, indexOfLastClaim);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const openViewModal = (claim) => {
    setSelectedClaim(claim);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedClaim(null);
    setViewModalOpen(false);
  };

  const downloadClaimDetails = (claim) => {
    const content = `Claim Details for ${claim.fullName}\n\nEmail: ${claim.email}\nClaim Amount: $${claim.claimAmount}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claim_${claim.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const toggleFlag = async (claimId) => {
    // Find the claim to be updated
    const claimToUpdate = claims.find((claim) => claim.id === claimId);
  
    try {

      const response = await fetch(`https://test-env.eba-y8shitmz.ap-south-1.elasticbeanstalk.com/claims/update/${claimId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: claimToUpdate.status === "Flagged" ? "Active" : "Flagged"
        }),
      });
  

      if (response.ok) {
   
        setClaims(
          claims.map((claim) =>
            claim.id === claimId
              ? { ...claim, status: claim.status === "Flagged" ? "Active" : "Flagged" }
              : claim
          )
        );
      } else {
        console.error("Failed to update claim status.");
      }
    } catch (error) {
      console.error("Error updating claim:", error);
    }
  };
  

  const renderClaimList = (claimsList) => (
    <Table variant="simple" colorScheme="blue">
      <Thead>
        <Tr>
          <Th>Status</Th>
          <Th>Name</Th>
          <Th>Claim Type</Th>
          <Th>Claim Amount</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {claimsList.map((claim) => (
          <Tr key={claim.id} _hover={{ bg: hoverBgColor }}>
            <Td>
              <Badge colorScheme={claim.status === "Flagged" ? "red" : "green"}>
                {claim.status}
              </Badge>
            </Td>
            <Td>
              <HStack>
                <Image
                  borderRadius="full"
                  boxSize="30px"
                  src={dummyPhoto}
                  alt={claim.fullName}
                />
                <Text fontWeight="medium">{claim.fullName}</Text>
              </HStack>
            </Td>
            <Td>{claim.claimType}</Td>
            <Td>₹{claim.claimAmount}</Td>
            <Td>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="sm"
                />
                <MenuList>
                  <MenuItem icon={<ViewIcon />} onClick={() => openViewModal(claim)}>
                    View
                  </MenuItem>
                  <MenuItem
                    icon={<DownloadIcon />}
                    onClick={() => downloadClaimDetails(claim)}
                  >
                    Download
                  </MenuItem>
                  <MenuItem icon={<WarningIcon />} onClick={() => toggleFlag(claim.id)}>
                    {claim.status === "Flagged" ? "Unflag" : "Flag"}
                  </MenuItem>
                </MenuList>
              </Menu>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  return (
    <Box p={6} display="flex" justifyContent="center" fontFamily="Roboto, sans-serif">
      <ToastContainer />
      <Stack spacing={4} width="100%" maxW="1200px">
        <Box mb={4}>
          <Button
            onClick={() => setActiveTab("dashboard")}
            colorScheme={activeTab === "dashboard" ? "blue" : "gray"}
            mr={4}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => setActiveTab("claims")}
            colorScheme={activeTab === "claims" ? "blue" : "gray"}
          >
            Claims
          </Button>
        </Box>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "claims" && (
          <>
            {flaggedClaims.length > 0 && (
              <Box mb={4}>
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  Flagged Claims
                </Text>
                {renderClaimList(flaggedClaims)}
              </Box>
            )}
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              All Claims
            </Text>
            {renderClaimList(currentClaims)}

            {/* Pagination */}
            <Box mt={4} textAlign="center">
              <IconButton
                icon={<ChevronLeftIcon />}
                onClick={() => paginate(currentPage - 1)}
                colorScheme="gray"
                disabled={currentPage === 1}
              />
              <Button colorScheme="gray" mx={1} disabled>
                {currentPage}
              </Button>
              <IconButton
                icon={<ChevronRightIcon />}
                onClick={() => paginate(currentPage + 1)}
                colorScheme="gray"
                disabled={currentPage >= totalPages}
              />
            </Box>
          </>
        )}
      </Stack>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={closeViewModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="blue.500" color="white" borderTopRadius="md">
            Claim Details
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {selectedClaim && (
              <VStack spacing={4} align="stretch">
                <Text fontSize="xl" fontWeight="bold">Personal Information</Text>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Full Name:</Text>
                 
                  <Text>{selectedClaim.fullName}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Email:</Text>
                  <Text>{selectedClaim.email}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Contact Number:</Text>
                  <Text>{selectedClaim.contactNumber}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Policy Number:</Text>
                  <Text>{selectedClaim.policyNumber}</Text>
                </HStack>

                <Text fontSize="xl" fontWeight="bold" mt={4}>Claim Information</Text>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Claim Type:</Text>
                  <Text>{selectedClaim.claimType}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Claim Amount:</Text>
                  <Text>₹{selectedClaim.claimAmount}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Incident Date:</Text>
                  <Text>{selectedClaim.incidentDate}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Status:</Text>
                  <Text>{selectedClaim.status}</Text>
                </HStack>

                <Text fontSize="xl" fontWeight="bold" mt={4}>Payment Details</Text>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Payment Method:</Text>
                  <Text>{selectedClaim.paymentMethod}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Bank Account Number:</Text>
                  <Text>{selectedClaim.bankAccountNumber}</Text>
                </HStack>

                <Text fontSize="xl" fontWeight="bold" mt={4}>Incident Description</Text>
                <Text>{selectedClaim.incidentDescription}</Text>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
