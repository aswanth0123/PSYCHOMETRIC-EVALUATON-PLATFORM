import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddQuestion.css";
import { useNavigate } from "react-router-dom";

const AddQuestion = () => {
  const currentTestId = window.location.href.split("testid=")[1];
  console.log(currentTestId);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionsList, setQuestionsList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);

  const testId = window.location.href.split("testid=")[1];
  const navigate = useNavigate();

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

  const filteredQuestions = questionsList.filter((q) => q.test_id == testId);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

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
      test_id: testId,
    };

    try {
      await axios.post("http://localhost:5000/api/questions/add", newQuestion);
      alert("Question added successfully!");
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`);
      fetchQuestions();
      setQuestionsList((prevQuestions) => prevQuestions.filter((q) => q.id !== id));

    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleEdit = (q) => {
    setEditMode(true);
    setEditQuestionId(q.id);
    setQuestion(q.question_text);
    setOptions([q.option_a, q.option_b, q.option_c, q.option_d]);
    setCorrectAnswer(q.correct_option);
  };

  const updateQuestion = async (e) => {
    e.preventDefault();

    if (!question || !correctAnswer || options.some((opt) => opt === "")) {
      alert("Please fill all fields!");
      return;
    }

    const updatedQuestion = {
      question_text: question,
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_option: correctAnswer,
      test_id: testId,
    };

    try {
      await axios.put(`http://localhost:5000/api/questions/${editQuestionId}`, updatedQuestion);
      alert("Question updated successfully!");
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setEditMode(false);
    setEditQuestionId(null);
  };

  return (
    <>
      <button
        style={{
          color: "white",
          margin: "20px",
          borderRadius: "10px",
          border: "1px solid black",
          backgroundColor: "rgb(48 48 132)",
        }}
        onClick={() => navigate("/AdminDashboard")}
      >
        Back to home
      </button>

      <div className="container2">
        <div className="form-container">
          {editMode ? <h2>Update Question</h2> : <h2>Add Question</h2>}

          <form className="question-form" onSubmit={editMode ? updateQuestion : handleSubmit}>
            <label>Question:</label>
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} required />

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

            <button type="submit" className="add-btn">
              {editMode ? "Update Question" : "Add Question"}
            </button>
            {editMode && (
              <button type="button" className="add-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="table-container" style={{ marginLeft: "45px" }}>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{q.question_text}</td>
                      <td>
                        <div className="options-grid">
                          <span>A: {q.option_a} ,</span>
                          <span>B: {q.option_b} ,</span>
                          <span>C: {q.option_c} ,</span>
                          <span>D: {q.option_d} </span>
                        </div>
                      </td>
                      <td>{q.correct_option}</td>
                      <td>
                        <button className="add-btn" onClick={() => handleEdit(q)}>
                          Edit
                        </button>
                        <button className="add-btn" onClick={() => deleteQuestion(q.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AddQuestion;
