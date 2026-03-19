import { jsPDF } from "jspdf";
import fs from "fs";

const doc = new jsPDF();
doc.text("John Doe\nSoftware Engineer\nExperience: 5 years in Python, React, and TypeScript.", 10, 10);
const dest = "c:\\tmp\\test-resume.pdf";
fs.writeFileSync(dest, Buffer.from(doc.output('arraybuffer')));
console.log("Created", dest);
