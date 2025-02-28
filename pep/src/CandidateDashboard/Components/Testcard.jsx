import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TestCard.css";

const TestCard = ({ test }) => {
  const navigate = useNavigate();

  const startTest = () => {
    if (test.name === "Emotional Intelligence Test") {
      navigate("/quiz"); // Redirect to the Quiz
    }
    else if (test.name === "Decision Making Test") {
      navigate("/dmt"); // Redirect to the DMT
    }
    else if (test.name === "Logical Reasoning Test") {
      navigate("/lr"); // Redirect to the LR
    }
    else if (test.name === "Numerical Reasoning Test") {
      navigate("/nr"); // Redirect to the NR
    }
    else if (test.name === "Situational Judgement Test") {
      navigate("/sj"); // Redirect to the SJ
    }
    else if (test.name === "Verbal Reasoning Test") {
      navigate("/vr"); // Redirect to the VR
    }
     else {
      alert(`Starting ${test.name}`); // Placeholder for other tests
    }
  };

  return (
    <div className="test-card">
      <h3>{test.name}</h3>
      <button onClick={startTest} className="test-btn">Start Test</button>
    </div>
  );
};

export default TestCard;