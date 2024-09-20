import React, { useState } from 'react';
import { Box, IconButton, VStack, Text, Popover, PopoverTrigger, PopoverContent, PopoverBody, Button } from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';

const staticQA = [
  { question: "How do I file a claim?", answer: "You can file a claim by logging into your account and selecting 'File a New Claim' from the dashboard." },
  { question: "What's the status of my claim?", answer: "To check your claim status, go to 'My Claims' in your account and select the specific claim you're inquiring about." },
  { question: "How long does the claim process take?", answer: "The claim process typically takes 5-7 business days, but may vary depending on the complexity of the claim." },
];

const Chatbot = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  return (
    <Box position="fixed" bottom="20px" right="20px" zIndex="tooltip">
      <Popover placement="top-end">
        <PopoverTrigger>
          <IconButton
            icon={<ChatIcon />}
            colorScheme="blue"
            rounded="full"
            size="lg"
          />
        </PopoverTrigger>
        <PopoverContent width="300px">
          <PopoverBody>
            <VStack align="stretch" spacing={4}>
              {staticQA.map((qa, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedQuestion(qa)}
                  variant="outline"
                  justifyContent="flex-start"
                  whiteSpace="normal"
                  textAlign="left"
                  height="auto"
                  py={2}
                >
                  {qa.question}
                </Button>
              ))}
            </VStack>
            {selectedQuestion && (
              <Box mt={4}>
                <Text fontWeight="bold">{selectedQuestion.question}</Text>
                <Text mt={2}>{selectedQuestion.answer}</Text>
              </Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default Chatbot;