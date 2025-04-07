import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Document, Packer, Paragraph, TextRun,ImageRun  } from "docx";
import { saveAs } from "file-saver"; // Ensure you import this
import logo from "../../assets/logo.png";
const TestCard = ({ test }) => {
  const navigate = useNavigate();
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [testDetails, setTestDetails] = useState(null);

  const startTest = () => {
    const routes = {
      "Emotional Intelligence Test": "/quiz",
      "Decision Making Test": "/dmt",
      "Logical Reasoning Test": "/lr",
      "Numerical Reasoning Test": "/nr",
      "Situational Judgement Test": "/sj",
      "Verbal Reasoning Test": "/vr",
    };
    navigate(routes[test.name] || "/default");
  };

  const downloadAsDocx = (testDetails) => {
    axios.get("http://localhost:5000/api/questions").then((response) => {
      if (Array.isArray(response.data)) {
        const filteredQuestions1 = response.data.filter((q) => q.test_id == testDetails.TEST_ID);
        setFilteredQuestions(filteredQuestions1);
        setTestDetails(testDetails); // Store test details for useEffect
      }
    });
  };

  useEffect(() => {
    if (filteredQuestions.length > 0 && testDetails) {
      (async () => {
        // Convert logo image to blob
        const logoBlob = await fetch(logo).then((res) => res.blob());
  
        const doc = new Document({
          sections: [
            {
              children: [
                // Logo at the top
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: logoBlob,
                      transformation: { width: 100, height: 100 }, // Adjust logo size
                    }),
                  ],
                  alignment: "center",
                  spacing: { after: 300 },
                }),
  
                // Test Name (Title)
                new Paragraph({
                  children: [new TextRun({ text:`Test Name : ${testDetails.TEST_NAME}`, bold: true, size: 32 })],
                  spacing: { after: 300 },
                }),
  
                // Test Description
                new Paragraph({
                  children: [new TextRun({ text: `Test Details: ${testDetails.TEST_DESCRIPTION}`, size: 22 })],
                  spacing: { after: 300 },
                }),
  
                // Test Set (Questions)
                new Paragraph({
                  children: [new TextRun({ text: "Test Set:", bold: true, size: 24 })],
                  spacing: { after: 200 },
                }),
  
                // Questions with options
                ...filteredQuestions
                  .map((q, index) => [
                    new Paragraph({
                      children: [new TextRun({ text: `${index + 1}. ${q.question_text}`, size: 22, bold: true })],
                      spacing: { after: 100 },
                    }),
                    new Paragraph({ children: [new TextRun({ text: `A) ${q.option_a}`, size: 20 })] }),
                    new Paragraph({ children: [new TextRun({ text: `B) ${q.option_b}`, size: 20 })] }),
                    new Paragraph({ children: [new TextRun({ text: `C) ${q.option_c}`, size: 20 })] }),
                    new Paragraph({
                      children: [new TextRun({ text: `D) ${q.option_d}`, size: 20 })],
                      spacing: { after: 150 },
                    }),
                    new Paragraph({
                      children: [new TextRun({ text: `Suitable Option: ${q.correct_option}`, bold: true, size: 22 })],
                      spacing: { after: 300 },
                    }),
                  ])
                  .flat(),
              ],
            },
          ],
        });
  
        // Generate and download the DOCX file
        Packer.toBlob(doc).then((blob) => {
          saveAs(blob, "Test_Questions.docx");
        });
      })();
    }
  }, [filteredQuestions, testDetails]); // Runs when questions are set

  return (
    <div className="test-card">
      <h3>{test.TEST_NAME}</h3>
      <p>{test.TEST_DESCRIPTION}</p>
      <button className="test-btn" onClick={() => downloadAsDocx(test)}>
        View Question Test
      </button>
    </div>
  );
};

export default TestCard;
