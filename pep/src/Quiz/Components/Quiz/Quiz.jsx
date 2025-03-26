import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Quiz.css';

const Quiz = () => {
  let [data, setData] = useState([]);
  let [index, setIndex] = useState(0);
  let [question, setQuestion] = useState(null);
  let [lock, setLock] = useState(false);
  let [score, setScore] = useState(0);
  let [result, setResult] = useState(false);
  let [start, setStart] = useState(false); // Start screen state
  let [test,setTest] = useState({})
  let [testattend,setTestAttend] = useState(null)
  let [currentoption,setCurrentOption] = useState(null)
  let [iscorrect,setIsCorrect] = useState(false)
  let Option1 = useRef(null);
  let Option2 = useRef(null);
  let Option3 = useRef(null);
  let Option4 = useRef(null);
  let option_array = [Option1, Option2, Option3, Option4];

  const navigate = useNavigate(); // Initialize navigate
  const testid = window.location.search.split("=")[1];

  useEffect(() => {
    axios.get("http://localhost:5000/api/tests").then((response) =>{
      const filter = response.data.filter((t)=>t.TEST_ID==testid)
      setTest(filter[0])

    })
    axios.get("http://localhost:5000/api/questions").then((response) => {
      const filter=response.data.filter((item) => item.test_id == testid);
      setData([...filter]);
      setQuestion(filter[index])
    })

  }, []);
  
  

  // Function to check answer
  const checkAns = (e, ans) => {
    if (!lock) {
      setCurrentOption(ans)
      if (question.correct_option == ans) {
        e.target.classList.add('correct');
        setIsCorrect(true);
        setScore((prev) => prev + 1);

        

      } else {
        e.target.classList.add('wrong');
      }
      setLock(true);
    }
  };

  // Function to store result automatically
  const storeResult = async () => {
    try {
        const response = await axios.post("http://localhost:5000/api/test-evaluations/", {
            CANDIDATE_ID: JSON.parse(sessionStorage.getItem("user")).id,
            TEST_ID: testid,
            TEST_EVALUATION: `Score: ${score}/${data.length}, Performance: ${getPerformanceMessage(score)}`,
            TEST_ATTEND_ID: testattend
        });

        const testEvaluationId = response.data.TEST_EVALUATION_ID; // Extract ID from response
        sessionStorage.setItem("testEvaluationId", testEvaluationId);
        console.log("Test result saved successfully!");
    } catch (error) {
        console.error("Error saving test evaluation:", error.response ? error.response.data : error.message);
    }
};


const addquestiondata = () => {

  const questiondata = {
    CANDIDATE_ID: JSON.parse(sessionStorage.getItem("user")).id,
    TEST_ID: testid,
    QUESTION_ID: question.id,
    SELECTED_OPTION: currentoption,
    IS_CORRECT: iscorrect,
    TEST_ATTEND_ID: testattend

  }
  // console.log('testattend',questiondata);
  
   axios.post("http://localhost:5000/api/questionResult/test-responses", questiondata);
      
    
  // }
}


  // Function to handle next question
  const next = () => {
    if (lock) {
      if (index === data.length - 1) {
        sessionStorage.setItem("quiz", testid);
        storeResult(); 
        addquestiondata();
        setResult(true);
        return;
      }
      setIndex(++index);
      setQuestion(data[index]);
      setLock(false);
      addquestiondata();
      option_array.forEach((option) => {
        option.current.classList.remove('wrong');
        option.current.classList.remove('correct');
      });
    }
  };

  // Function to reset quiz and go to dashboard
  const reset = () => {
    setIndex(0);
    setQuestion(data[0]);
    setScore(0);
    setLock(false);
    setResult(false);
    setStart(false);
    navigate('/dashboard'); // Navigate to dashboard
  };

  // Function to calculate performance
  const getPerformanceMessage = (score) => {
    console.log(score);
    
    if (score >= data.length*0.75) return "Good";
    else if (score >= data.length*0.50) return "Average";
    else if (score >= data.length*0.25) return "Below Average";
    else return "Poor";
  };

  const book = () => {
    navigate('/appointment');
  };
  // console.log('task' ,test);
  const handleTestAttend = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/quiz/test-attend", {
        CANDIDATE_ID: JSON.parse(sessionStorage.getItem("user")).id
      });
  
      console.log("testattend response:", response.data);
  
      // Set the TEST_ATTEND_ID correctly
      setTestAttend(response.data.TEST_ATTEND_ID);
    } catch (error) {
      console.error("Error in testattend request:", error);
    }
  };
   const count = ()=>{
    try{
     const a =question.length
     setStart(true)
     handleTestAttend() 
    }
    catch{
      alert("No questions Avilable Choose Another Test")
      navigate('/dashboard')

      
    }
  }
  // console.log('testattend1',testattend);
  
  return (
    <div className='container'>
      {!start ? (
        <div className="instructions">
          <h1>Welcome to the {test.TEST_NAME} </h1>
          <p>Please read the following instructions carefully before starting the test:</p>
          <ol>
            <li><b>General Instruction:</b> Sit in a peaceful environment before beginning the test.</li>
            <li><b>Time Limit:</b> There is no timer, but take no more than 2 minutes per question.</li>
            <li><b>Question Type:</b> MCQs designed to assess various aspects of emotional intelligence.</li>
            <li><b>Attempt per Question:</b> Once you select an option, it cannot be changed.</li>
            <li><b>Navigation:</b> Click "Next" to proceed. No option to go back.</li>
            <li><b>Scoring:</b> Each correct answer contributes to your final score.</li>
            <li><b>Results & Insights:</b> You will receive a summary of your performance after the test.</li>
          </ol>
          <button className="start-btn" onClick={count}>Begin Test!</button>
        </div>
      ) : !result ? (
        <>
          <h1>{test.TEST_NAME}</h1>
          <hr />
          <h1>{index + 1}. {question.question_text}</h1>
          <ul>
            <b>
              <li ref={Option1} onClick={(e) => { checkAns(e, question.option_a); }}>{question.option_a}</li>
              <li ref={Option2} onClick={(e) => { checkAns(e, question.option_b); }}>{question.option_b}</li>
              <li ref={Option3} onClick={(e) => { checkAns(e, question.option_c); }}>{question.option_c}</li>
              <li ref={Option4} onClick={(e) => { checkAns(e, question.option_d); }}>{question.option_d}</li>
            </b>
          </ul>
          <button onClick={next}>
            {index === data.length - 1 ? 'Submit' : 'Next'}
          </button>
          <center><div className="index"><b>{index + 1} of {data.length} questions</b></div></center>
        </>
      ) : (
        <>
          <h1>Congratulations! 🎉</h1>
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
