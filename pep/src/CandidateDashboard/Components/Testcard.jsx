import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TestCard.css";

const TestCard = ({ test }) => {
  const navigate = useNavigate();

  const startTest = (testid) => {
    console.log(testid);
    navigate(`/quiz?testid=${testid}`);
    
  };

  return (
    <div className="test-card">
      <h3>{test.TEST_NAME}</h3>
      <button onClick={() => startTest(test.TEST_ID)} className="test-btn">Start Test</button>
    </div>
  );
};

export default TestCard;