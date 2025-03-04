import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quiz.css';
import { data } from '../../assets/(DMT)test';
import axios from 'axios';

const DMT = () => {
  let [index, setIndex] = useState(0);
  let [question, setQuestion] = useState(data[index]);
  let [lock, setLock] = useState(false);
  let [score, setScore] = useState(0);
  let [result, setResult] = useState(false);
  let [start, setStart] = useState(false); 

  let Option1 = useRef(null);
  let Option2 = useRef(null);
  let Option3 = useRef(null);
  let Option4 = useRef(null);

  let option_array = [Option1, Option2, Option3, Option4];

  const navigate = useNavigate(); 

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
    await axios.post("http://127.0.0.1:8000/api/test-evaluation/", {
      CANDIDATE_ID:JSON.parse(sessionStorage.getItem("user")).id , 
      TEST_ID: 6,        
      TEST_EVALUATION: `Score: ${score}/${data.length}, Performance: ${getPerformanceMessage(score)}`
    });
    console.log("Test result saved successfully!");
};
  const next = () => {
    if (lock === true) {
      if (index === data.length - 1) {
        storeResult();
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

  const reset = () => {
    setIndex(0);
    setQuestion(data[0]);
    setScore(0);
    setLock(false);
    setResult(false);
    setStart(false);
    navigate('/dashboard'); 
  };

  // Function to determine performance message based on score
  const getPerformanceMessage = (score) => {
    if (score >= 0 && score <= 5) return "Poor";
    if (score >= 6 && score <= 10) return "Below Average";
    if (score >= 11 && score <= 15) return "Average";
    if (score >= 16 && score <= 20) return "Good";
    return "Invalid Score";
  };

  return (
    <div className='container'>
      {!start ? (
        <div className="instructions">
          <h1>Welcome to the Decision Making Test</h1>
          <p>Please read the following instructions carefully before starting the test:</p>
          <ol>
            <li><b>General Instruction:</b> Sit in a peaceful environment before beginning the test.</li>
            <li><b>Time Limit:</b> No timer. Take no more than 2 minutes per question.</li>
            <li><b>Question Type:</b> MCQs with four options each.</li>
            <li><b>Attempts:</b> Once selected, options cannot be changed.</li>
            <li><b>Navigation:</b> Click "Next" to proceed. No going back to previous questions.</li>
            <li><b>Scoring:</b> Each correct answer contributes to your final score.</li>
            <li><b>Results:</b> A performance summary will be shown after the test.</li>
          </ol>
          <button className="start-btn" onClick={() => setStart(true)}>Begin Test!</button>
        </div>
      ) : !result ? (
        <>
          <h1>Decision Making Test</h1>
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
          <button>Book an Appointment</button>
        </>
      )}
    </div>
  );
};

export default DMT;