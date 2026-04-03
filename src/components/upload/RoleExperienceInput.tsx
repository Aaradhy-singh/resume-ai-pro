import React, { useState, useRef, useEffect } from 'react';
import { searchOccupations, occupations as OCCUPATION_DATA } from '@/lib/occupation-data';

const OCCUPATION_TITLES = Array.from(
  new Set(
    OCCUPATION_DATA
      .map((occ: any) => occ.title)
      .filter((title: any) => title && title.trim().length > 0)
  )
);

const LEGACY_TITLES = [
  "Prompt Engineer","AI/ML Engineer","Machine Learning Engineer","Data Scientist",
  "Data Analyst","Data Engineer","Business Intelligence Analyst","Frontend Developer",
  "Backend Developer","Full Stack Developer","React Developer","Node.js Developer",
  "Python Developer","Java Developer","Software Engineer","Software Developer",
  "Mobile Developer","iOS Developer","Android Developer","Flutter Developer",
  "DevOps Engineer","Site Reliability Engineer","Cloud Engineer","AWS Solutions Architect",
  "GCP Engineer","Azure Engineer","Platform Engineer","Infrastructure Engineer",
  "Cybersecurity Analyst","Security Engineer","Penetration Tester","Network Engineer",
  "Systems Administrator","Database Administrator","QA Engineer","Test Automation Engineer",
  "Embedded Systems Engineer","Hardware Engineer","Robotics Engineer",
  "Computer Vision Engineer","NLP Engineer","Research Scientist","AI Researcher",
  "Blockchain Developer","Smart Contract Developer","Web3 Developer","Game Developer",
  "Unity Developer","Unreal Engine Developer","UI/UX Designer","Product Designer",
  "Graphic Designer","Motion Designer","Brand Designer","Product Manager",
  "Technical Product Manager","Program Manager","Project Manager","Scrum Master",
  "Agile Coach","Business Analyst","Systems Analyst","Solutions Architect",
  "Enterprise Architect","Technical Lead","Engineering Manager","VP of Engineering",
  "CTO","Chief AI Officer","Technical Writer","Developer Advocate",
  "Developer Relations Engineer","Sales Engineer","Solutions Engineer",
  "IT Support Specialist","Help Desk Technician","IT Manager","Salesforce Developer",
  "SAP Consultant","ERP Consultant","Growth Hacker","SEO Specialist",
  "Digital Marketing Analyst","Marketing Data Analyst","Quantitative Analyst",
  "Financial Analyst","Risk Analyst","Actuary","Operations Research Analyst",
  "Bioinformatics Engineer","Healthcare Data Analyst","Clinical Data Scientist",
  "GIS Analyst","Geospatial Engineer","Supply Chain Analyst","Logistics Engineer",
];

const JOB_TITLES = Array.from(
  new Set([...OCCUPATION_TITLES, ...LEGACY_TITLES])
).filter(Boolean).sort((a, b) => a.localeCompare(b));

const EXPERIENCE_OPTIONS = [
    { label: "No experience", value: 0 },
    { label: "Less than 1 year", value: 0.5 },
    { label: "1 year", value: 1 },
    { label: "2 years", value: 2 },
    { label: "3 years", value: 3 },
    { label: "4 years", value: 4 },
    { label: "5 years", value: 5 },
    { label: "6 years", value: 6 },
    { label: "7 years", value: 7 },
    { label: "8 years", value: 8 },
    { label: "9 years", value: 9 },
    { label: "10 years", value: 10 },
    { label: "11-15 years", value: 13 },
    { label: "16-20 years", value: 18 },
    { label: "21-30 years", value: 25 },
    { label: "30-40 years", value: 35 },
    { label: "40-50 years", value: 45 },
    { label: "50+ years", value: 51 },
];

interface RoleExperienceInputProps {
    onExperienceChange: (years: number | null) => void;
    onTargetRoleChange: (role: string) => void;
}

export function RoleExperienceInput({
    onExperienceChange,
    onTargetRoleChange,
}: RoleExperienceInputProps) {
    const [roleQuery, setRoleQuery] = useState("");
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedExp, setSelectedExp] = useState<number | null>(null);
    const [expDropdownOpen, setExpDropdownOpen] = useState(false);
    const roleRef = useRef<HTMLDivElement>(null);
    const expRef = useRef<HTMLDivElement>(null);

    const filteredTitles = roleQuery.trim().length < 1
        ? JOB_TITLES
        : JOB_TITLES.filter(t =>
            t.toLowerCase().includes(roleQuery.toLowerCase())
        );

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (roleRef.current && !roleRef.current.contains(e.target as Node))
                setRoleDropdownOpen(false);
            if (expRef.current && !expRef.current.contains(e.target as Node))
                setExpDropdownOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    return (
        <div className="bg-transparent border-none">
            {/* Section header */}
            <p className="font-mono text-[9px] text-white tracking-[0.2em] uppercase mb-1">
                TARGET ROLE & EXPERIENCE
            </p>
            <p className="font-mono text-[13px] text-gray-300 mb-6 leading-[1.7]">
                Optional. Helps calibrate scoring to your specific situation.
            </p>

            <div className="grid grid-cols-2 gap-5">
                {/* TARGET ROLE */}
                <div>
                    <span className="font-mono text-[9px] text-white tracking-[0.2em] uppercase mb-3 px-1 block">TARGET JOB ROLE</span>
                    <div ref={roleRef} className="relative">
                        <input
                            type="text"
                            placeholder="e.g. Prompt Engineer"
                            value={roleQuery || selectedRole}
                            className="bg-[#1A1A1A] border border-gray-500 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] w-full cursor-pointer font-mono text-[14px] tracking-[0.05em]"
                            onChange={e => {
                                setRoleQuery(e.target.value);
                                setSelectedRole("");
                                onTargetRoleChange("");
                                setRoleDropdownOpen(true);
                            }}
                            onFocus={() => setRoleDropdownOpen(true)}
                        />
                        {roleDropdownOpen && filteredTitles.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-gray-700 border-t-0 max-h-[220px] overflow-y-auto z-[100] rounded-b-lg">
                                {filteredTitles.map(title => (
                                    <div
                                        key={title}
                                        className="font-mono text-[13px] text-gray-300 px-4 py-2 hover:bg-white/10 hover:text-white cursor-pointer tracking-[0.05em] border-b border-gray-600 last:border-b-0"
                                        onMouseDown={() => {
                                            setSelectedRole(title);
                                            setRoleQuery(title);
                                            onTargetRoleChange(title);
                                            setRoleDropdownOpen(false);
                                        }}
                                    >
                                        {title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* EXPERIENCE YEARS */}
                <div>
                    <span className="font-mono text-[9px] text-white tracking-[0.2em] uppercase mb-3 px-1 block">YEARS OF EXPERIENCE</span>
                    <div ref={expRef} className="relative">
                        <div
                            className="bg-[#1A1A1A] border border-gray-500 flex justify-between items-center text-white rounded-lg px-4 py-3 cursor-pointer font-mono text-[14px] tracking-[0.05em] select-none hover:border-[#00e5ff] transition-colors"
                            onClick={() => setExpDropdownOpen(!expDropdownOpen)}
                        >
                            <span className={selectedExp === null ? 'text-gray-300' : 'text-white'}>
                                {selectedExp === null
                                    ? 'Select years'
                                    : EXPERIENCE_OPTIONS.find(o => o.value === selectedExp)?.label ?? 'Select years'}
                            </span>
                            <span className="text-gray-300 text-[10px]">▾</span>
                        </div>
                        {expDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-gray-700 border-t-0 max-h-[220px] overflow-y-auto z-[100] rounded-b-lg">
                                {EXPERIENCE_OPTIONS.map(opt => (
                                    <div
                                        key={opt.value}
                                        className="font-mono text-[13px] text-gray-300 px-4 py-2 hover:bg-white/10 hover:text-white cursor-pointer tracking-[0.05em] border-b border-gray-600 last:border-b-0"
                                        onMouseDown={() => {
                                            setSelectedExp(opt.value);
                                            onExperienceChange(opt.value);
                                            setExpDropdownOpen(false);
                                        }}
                                    >
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* WARNING */}
                    {selectedExp !== null && (
                        <p className="font-mono text-[9px] text-[#F59E0B] tracking-[0.08em] mt-2 leading-[1.7]">
                            ⚠ ENTER THE SAME EXPERIENCE AS WRITTEN IN YOUR RESUME FOR ACCURATE RESULTS.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
