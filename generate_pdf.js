import { jsPDF } from "jspdf";
import fs from "fs";

const doc = new jsPDF();

doc.setFontSize(22);
doc.text("John Doe", 20, 20);
doc.setFontSize(16);
doc.text("Software Engineer", 20, 30);

doc.setFontSize(12);
doc.text("EXPERIENCE", 20, 50);
doc.text("Senior Developer at Tech Corp (2020-Present)", 20, 60);
doc.text("- Led a team of 5 engineers to build a scalable microservices architecture.", 20, 65);
doc.text("- Optimized database queries, reducing latency by 40%.", 20, 70);

doc.text("Junior Developer at Web Solutions (2018-2020)", 20, 85);
doc.text("- Developed responsive UI components using React and TypeScript.", 20, 90);
doc.text("- Collaborated with designers to implement pixel-perfect layouts.", 20, 95);

doc.text("SKILLS", 20, 110);
doc.text("JavaScript, TypeScript, React, Node.js, Python, SQL, AWS, Docker", 20, 115);

doc.text("EDUCATION", 20, 130);
doc.text("B.S. Computer Science, University of Technology (2018)", 20, 135);

const buffer = Buffer.from(doc.arrayBuffer());
fs.writeFileSync("test_resume.pdf", buffer);

console.log("PDF created successfully: test_resume.pdf");
