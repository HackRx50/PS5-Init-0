import './App.css';
import AllRoutes from './components/AllRoutes';
import Chatbot from './components/Chatbot'; // Add this import

function App() {
  return (
    <div className="App">
      <AllRoutes />
      <Chatbot /> {/* Add the Chatbot component here */}
    </div>
  );
}

export default App;