import React from 'react';
import { useParams } from 'react-router-dom';

const TestDetails = () => {
  const { testId } = useParams();  // Get testId from URL params

  let testDetails;
  switch (testId) {
    case 'emotional-intelligence':
      testDetails = {
        title: 'Emotional Intelligence Test',
        description: 'This test assesses your ability to understand and manage emotions. It evaluates your emotional awareness, empathy, and emotional regulation skills.',
      };
      break;
    case 'verbal-ability':
      testDetails = {
        title: 'Verbal Ability Test',
        description: 'This test evaluates your ability to understand and reason using concepts framed in words. It measures your verbal reasoning and vocabulary.',
      };
      break;
    case 'numerical-reasoning':
      testDetails = {
        title: 'Numerical Reasoning Test',
        description: 'This test measures your ability to work with numbers and analyze quantitative data. It tests your numerical problem-solving skills.',
      };
      break;
    case 'logical-reasoning':
      testDetails = {
        title: 'Logical Reasoning Test',
        description: 'This test evaluates your ability to identify patterns, logical relationships, and make sound decisions based on given information.',
      };
      break;
    case 'situational-judgement':
      testDetails = {
        title: 'Situational Judgement Test',
        description: 'This test evaluates how you handle real-life scenarios and make decisions in various situations, testing your judgment and problem-solving ability.',
      };
      break;
    case 'decision-making':
      testDetails = {
        title: 'Decision Making Test',
        description: 'This test assesses your ability to make effective decisions. It focuses on evaluating your analytical thinking and decision-making process.',
      };
      break;
    default:
      testDetails = { title: 'Test not found', description: 'Sorry, the test details are unavailable.' };
  }

  return (
    <div>
      <h1>{testDetails.title}</h1>
      <p>{testDetails.description}</p>
    </div>
  );
};

export default TestDetails;
