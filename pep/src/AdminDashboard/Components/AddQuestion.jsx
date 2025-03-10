import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddQuestion.css"; // Import CSS

const AddQuestion = () => {
  const currentTestId = window.location.href.split("testid=")[1];
  console.log(currentTestId);
  
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]); // 4 MCQ options
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionsList, setQuestionsList] = useState([]);
  const testId = window.location.href.split("testid=")[1];
  // Fetch Questions from API on Component Mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/questions");
      setQuestionsList(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };
  const filteredQuestions = questionsList.filter(q => q.test_id == testId);


  // Handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question || !correctAnswer || options.some((opt) => opt === "")) {
      alert("Please fill all fields!");
      return;
    }

    const newQuestion = {
      question_text: question,
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_option: correctAnswer,
      test_id: testId
    };

    try {
      await axios.post("http://localhost:5000/api/questions/add", newQuestion);
      alert("Question added successfully!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      fetchQuestions(); // Refresh Questions List
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  return (
    <div className="container">
      {/* Left Section - Question Form */}
      <div className="form-container">
        <h2>Add Question</h2>
        <form className="question-form" onSubmit={handleSubmit}>
          <label>Question:</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />

          <h4>Options:</h4>
          {options.map((option, index) => (
            <div key={index} className="option-input">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
            </div>
          ))}

          <label>Correct Answer:</label>
          <select
            className="answer-select"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            required
          >
            <option value="">Select Correct Answer</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button type="submit" className="add-btn">Add Question</button>
        </form>
      </div>

      {/* Right Section - Questions Table */}
      <div className="table-container">
        {questionsList.length > 0 && (
          <>
            <h2>Questions List</h2>
            <table className="questions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Question</th>
                  <th>Options</th>
                  <th>Correct Answer</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{q.question_text}</td>
                    <td>
                      <div className="options-grid">
                        <span>A:{q.option_a} ,</span>
                        <span>B:{q.option_b} ,</span>
                        <span>C:{q.option_c} ,</span>
                        <span>D:{q.option_d} </span>
                      </div>
                    </td>
                    <td>{q.correct_option}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default AddQuestion;
