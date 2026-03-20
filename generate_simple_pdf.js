import { jsPDF } from "jspdf";
import { writeFileSync } from "fs";

try {
    const doc = new jsPDF();
    doc.text("ResumAI Test Resume", 10, 10);
    doc.text("Experience: Senior Developer", 10, 20);
    const data = doc.output();
    writeFileSync("test_resume.pdf", data);
    console.log("Done");
} catch (e) {
    console.error(e);
}
