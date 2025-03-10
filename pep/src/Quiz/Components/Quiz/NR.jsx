import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quiz.css';
import { data } from '../../assets/(NR)test';
import axios from 'axios';

const Quiz = () => {
  let [index, setIndex] = useState(0);
  let [question, setQuestion] = useState(data[index]);
  let [lock, setLock] = useState(false);
  let [score, setScore] = useState(0);
  let [result, setResult] = useState(false);
  let [start, setStart] = useState(false); // New state for start screen

  let Option1 = useRef(null);
  let Option2 = useRef(null);
  let Option3 = useRef(null);
  let Option4 = useRef(null);

  let option_array = [Option1, Option2, Option3, Option4];

  const checkAns = (e, ans) => {
    if (lock === false) {
      if (question.ans === ans) {
        e.target.classList.add('correct');
        setLock(true);
        setScore((prev) => prev + 1);
      } else {
        e.target.classList.add('wrong');
        setLock(true);
      }
    }
  };

  const storeResult = async () => {
    try {
        const response = await axios.post("http://localhost:5000/api/test-evaluations/", {
            CANDIDATE_ID: JSON.parse(sessionStorage.getItem("user")).id,
            TEST_ID: 3,
            TEST_EVALUATION: `Score: ${score}/${data.length}, Performance: ${getPerformanceMessage(score)}`
        });

        const testEvaluationId = response.data.TEST_EVALUATION_ID; // Extract ID from response
        sessionStorage.setItem("testEvaluationId", testEvaluationId);
        console.log("Test result saved successfully!");
    } catch (error) {
        console.error("Error saving test evaluation:", error.response ? error.response.data : error.message);
    }
};
  const next = () => {
    if (lock === true) {
      if (index === data.length - 1) {
        sessionStorage.setItem("quiz", 3);

        storeResult();  // Automatically store result before finishing test
        setResult(true);
        return;
      }
      setIndex(++index);
      setQuestion(data[index]);
      setLock(false);
      option_array.map((option) => {
        option.current.classList.remove('wrong');
        option.current.classList.remove('correct');
        return null;
      });
    }
  };

  const navigate = useNavigate(); // Initialize navigate

  const reset = () => {
    setIndex(0);
    setQuestion(data[0]);
    setScore(0);
    setLock(false);
    setResult(false);
    setStart(false);
    navigate('/dashboard'); // Navigate to dashboard
  };

  const getPerformanceMessage = (score) => {
    if (score >= 0 && score <= 5) return "Poor";
    if (score >= 6 && score <= 10) return "Below Average";
    if (score >= 11 && score <= 15) return "Average";
    if (score >= 16 && score <= 20) return "Good";
    return "Invalid Score";
  };
  const book = () => {
    navigate('/appointment');
  };

  return (
    <div className='container'>
      {!start ? (
        <div className="instructions">
          <h1>Welcome to the Numerical Reasoning Test</h1>
          <p>Please read the following instructions carefully before starting the test:</p>
          <ol>
            <li><b>General Instruction:</b> Kindly sit in a peaceful environnment before beginning the test. </li><br></br>
            <li><b>Time Limit:</b> There is no timer.It is advised to take not more than 2 minutes per Question.</li><br></br>
            <li><b>Questions Type:</b> The test consists of MCQs designed to assess various aspects of the test.Each Question comprises of four options.</li><br></br>
            <li><b>Attempt per Question:</b> Once you select an option, it cannot be changed. Please select the option carefully.</li><br></br>
            <li><b>Navigation:</b> Click the "Next" button to proceed to the next question. There is no option to go back to previous questions.</li><br></br>
            <li><b>Scoring:</b> Each correct answer contributes to your final score. The total score will be displayed at the end of the test.</li><br></br>
            <li><b>Results & Insights:</b> Upon completing the test, you will receive a summary of your performance. If you want detailed guidance, you can book an appointment with our experts.</li><br></br>
          </ol>
          <button className="start-btn" onClick={() => setStart(true)}>Begin Test!</button>
        </div>
      ) : !result ? (
        <>
          <h1>Numerical Reasoning Test</h1>
          <hr />
          <h1>{index + 1}. {question.question}</h1>
          <ul>
            <b>
            <li ref={Option1} onClick={(e) => { checkAns(e, 1); }}>{question.option1}</li>
            <li ref={Option2} onClick={(e) => { checkAns(e, 2); }}>{question.option2}</li>
            <li ref={Option3} onClick={(e) => { checkAns(e, 3); }}>{question.option3}</li>
            <li ref={Option4} onClick={(e) => { checkAns(e, 4); }}>{question.option4}</li>
            </b>
          </ul>
          <button onClick={next}>
            {index === data.length - 1 ? 'Submit' : 'Next'}
          </button>
          <center><div className="index"><b>{index + 1} of {data.length} questions</b></div></center>
        </>
      ) : (
        <>
          <h1>Congratulations!🎉</h1>
          <h2>You have completed the test.</h2>
          <h2>Your Score: <span className="final-score">{score}/{data.length}</span></h2>
          <h2>Performance: <span className="performance-message">{getPerformanceMessage(score)}</span></h2>
          <h2>For detailed insights and guidance, <h1>Get in touch with our Expert NOW!!</h1></h2>
          <button onClick={reset}>Go to Dashboard</button>
          <button onClick={book}>Book an Appointment</button>
        </>
      )}
    </div>
  );
};

export default Quiz;
