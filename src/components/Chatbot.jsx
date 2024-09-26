import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, VStack, Text, Popover, PopoverTrigger, PopoverContent, PopoverBody, Input, Button, Wrap, WrapItem } from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';

const staticQA = [
  { question: "How can I assist you with insurance fraud detection today?", answer: "I'm here to help you with any questions you have about insurance fraud detection. How can I assist you today?" },
  { question: "Hi", answer: "Hello! How can I assist you today?" },
  { question: "What is insurance fraud?", answer: "Insurance fraud is any act committed to defraud an insurance process. This can include false claims, exaggerated losses, or misrepresentation of facts to obtain insurance benefits illegally." },
  { question: "How do you detect insurance fraud?", answer: "We use a combination of advanced analytics, machine learning algorithms, and expert human analysis to detect patterns and anomalies that may indicate fraudulent activity in claims." },
  { question: "What are common types of insurance fraud?", answer: "Common types include staged accidents, exaggerated claims, falsified medical bills, phantom injuries, and arson for property insurance claims." },
  { question: "How can I report suspected insurance fraud?", answer: "You can report suspected fraud through our confidential hotline at 1-800-555-FRAUD or via our online reporting form. All reports are kept strictly confidential." },
  { question: "What are the consequences of committing insurance fraud?", answer: "Consequences can include denial of claims, cancellation of policies, fines, and even criminal charges leading to imprisonment, depending on the severity of the fraud." },
  { question: "How does AI help in fraud detection?", answer: "AI and machine learning models can analyze vast amounts of data quickly, identifying subtle patterns and connections that might indicate fraudulent activity, which human analysts might miss." },
];

const suggestedQuestions = [
  "What is insurance fraud?",
  "How do you detect insurance fraud?",
  "How can I report suspected insurace fraud?",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (text = input) => {
    if (text.trim()) {
      setMessages([...messages, { type: 'user', text: text }]);
      const response = getResponse(text);
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: response }]);
      }, 500);
      setInput('');
    }
  };

  const getResponse = (question) => {
    const lowercaseQuestion = question.toLowerCase();
    const matchedQA = staticQA.find(qa => 
      qa.question.toLowerCase().includes(lowercaseQuestion)
    );
    return matchedQA ? matchedQA.answer : "I'm sorry, I don't have specific information about that. For more detailed inquiries about insurance fraud detection, please contact our fraud prevention department.";
  };

  return (
    <Box position="fixed" bottom="20px" right="20px" zIndex="tooltip">
      <Popover placement="top-end" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <PopoverTrigger>
          <IconButton
            icon={<ChatIcon />}
            colorScheme="blue"
            rounded="full"
            size="lg"
            onClick={() => setIsOpen(!isOpen)}
          />
        </PopoverTrigger>
        <PopoverContent width="300px" height="400px">
          <PopoverBody display="flex" flexDirection="column" height="100%" p={2}>
            <VStack align="stretch" spacing={2} overflowY="auto" flex={1} pb={2}>
              {messages.length === 0 && (
                <Text fontSize="sm" fontWeight="bold">How can I assist you with insurance fraud detection today?</Text>
              )}
              {messages.length === 0 && (
                <Wrap spacing={1}>
                  {suggestedQuestions.map((question, index) => (
                    <WrapItem key={index}>
                      <Button size="xs" onClick={() => handleSend(question)}>
                        {question}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
              {messages.map((message, index) => (
                <Box key={index} alignSelf={message.type === 'user' ? 'flex-end' : 'flex-start'} maxWidth="80%">
                  <Text 
                    fontSize="sm"
                    bg={message.type === 'user' ? 'blue.500' : 'gray.200'}
                    color={message.type === 'user' ? 'white' : 'black'}
                    py={1}
                    px={2}
                    borderRadius="md"
                  >
                    {message.text}
                  </Text>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </VStack>
            <Box mt={2}>
              <Input
                size="sm"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="sm" mt={1} onClick={() => handleSend()} colorScheme="blue" width="100%">
                Send
              </Button>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default Chatbot;