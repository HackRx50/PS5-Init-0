import React, { useState, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";
import courtData from "../data/all_courts_data.json";
// This would typically be imported from a JSON file

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentState, setState] = useState("main_menu");
  const [selectedOption, setSelectedOption] = useState(null);
  const [year, setYear] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedComplex, setSelectedComplex] = useState(null);

  useEffect(() => {
    addBotMessage(
      "Welcome to the Legal Case Lookup Chatbot! How can I assist you today?"
    );
    addBotMessage("Please select an option:");
    addBotMessage("1. Find cases of a district");
    addBotMessage("2. Find case details by CNR number");
    addBotMessage("3. Exit");
  }, []);

  const addBotMessage = (text) => {
    setMessages((prevMessages) => [...prevMessages, { text, sender: "bot" }]);
  };

  const addUserMessage = (text) => {
    setMessages((prevMessages) => [...prevMessages, { text, sender: "user" }]);
  };

  const handleMainMenu = (option) => {
    setSelectedOption(option);
    if (option === "1") {
      setState("ask_year");
      addBotMessage("Please enter the year of the case:");
    } else if (option === "2") {
      addBotMessage("This feature is not implemented yet.");
      setState("main_menu");
    } else if (option === "3") {
      addBotMessage("Thank you for using our service. Goodbye!");
      setState("exit");
    } else {
      addBotMessage("Invalid option. Please try again.");
    }
  }; //very good code taher

  const handleYearInput = (year) => {
    setYear(year);
    setState("select_state");
    addBotMessage("Please select a state:");
    Object.keys(courtData).forEach((state, index) => {
      addBotMessage(`${index + 1}. ${state}`);
    });
  };

  const handleStateSelection = (stateIndex) => {
    const state = Object.keys(courtData)[stateIndex - 1];
    setSelectedState(state);
    setState("select_district");
    addBotMessage(`Please select a district in ${state}:`);
    Object.keys(courtData[state].districts).forEach((district, index) => {
      addBotMessage(`${index + 1}. ${district}`);
    });
  };

  const handleDistrictSelection = (districtIndex) => {
    const district = Object.keys(courtData[selectedState].districts)[
      districtIndex - 1
    ];
    setSelectedDistrict(district);
    setState("select_complex");
    addBotMessage(`Please select a court complex in ${district}:`);
    Object.keys(
      courtData[selectedState].districts[district].court_complexes
    ).forEach((complex, index) => {
      addBotMessage(`${index + 1}. ${complex}`);
    });
  };

  const handleComplexSelection = (complexIndex) => {
    const complex = Object.keys(
      courtData[selectedState].districts[selectedDistrict].court_complexes
    )[complexIndex - 1];
    setSelectedComplex(complex);
    setState("api_call");
    addBotMessage("Making API call with the following details:");
    addBotMessage(`Year: ${year}`);
    addBotMessage(`State: ${selectedState}`);
    addBotMessage(`District: ${selectedDistrict}`);
    addBotMessage(`Court Complex: ${complex}`);
    // Simulate API call
    setTimeout(() => {
      addBotMessage(
        "API call completed. Here are the results: [Simulated API response]"
      );
      setState("main_menu");
      addBotMessage("What would you like to do next?");
      addBotMessage("1. Find cases of a district");
      addBotMessage("2. Find case details by CNR number");
      addBotMessage("3. Exit");
    }, 2000);
  };

  const handleSend = () => {
    if (input.trim() === "") return;

    addUserMessage(input);

    switch (currentState) {
      case "main_menu":
        handleMainMenu(input);
        break;
      case "ask_year":
        handleYearInput(input);
        break;
      case "select_state":
        handleStateSelection(parseInt(input));
        break;
      case "select_district":
        handleDistrictSelection(parseInt(input));
        break;
      case "select_complex":
        handleComplexSelection(parseInt(input));
        break;
      default:
        addBotMessage("I'm not sure how to respond to that.");
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <MessageCircle className="mr-2" />
        <h1 className="text-xl font-bold">Legal Case Lookup</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border border-gray-300"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-300 p-4 bg-white">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message here..."
            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
