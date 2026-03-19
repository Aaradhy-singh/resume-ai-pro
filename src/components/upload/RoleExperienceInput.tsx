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

    const box: React.CSSProperties = {
        border: '1px solid #555555',
        background: '#0D0D0D',
        boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)',
        padding: '24px',
        marginBottom: '0',
    };

    const label: React.CSSProperties = {
        fontFamily: "inherit",
        fontSize: '9px',
        color: '#0EA5E9',
        letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        marginBottom: '12px',
        display: 'block',
    };

    const inputStyle: React.CSSProperties = {
        fontFamily: "inherit",
        fontSize: '12px',
        color: '#F0F0F0',
        background: '#121212',
        border: '1px solid #555555',
        padding: '10px 14px',
        width: '100%',
        outline: 'none',
        cursor: 'pointer',
        letterSpacing: '0.05em',
    };

    const dropdownStyle: React.CSSProperties = {
        position: 'absolute' as const,
        top: '100%',
        left: 0,
        right: 0,
        background: '#1A1A1A',
        border: '1px solid #333333',
        borderTop: 'none',
        maxHeight: '220px',
        overflowY: 'auto' as const,
        zIndex: 100,
    };

    const optionStyle: React.CSSProperties = {
        fontFamily: "inherit",
        fontSize: '11px',
        color: '#E0E0E0',
        padding: '10px 14px',
        cursor: 'pointer',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #333333',
    };

    return (
        <div style={box} className="ui-box-override">
            {/* Section header */}
            <p style={{
                fontFamily: "inherit",
                fontSize: '9px',
                color: '#0EA5E9',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '4px',
            }}>
                TARGET ROLE & EXPERIENCE
            </p>
            <p style={{
                fontFamily: "inherit",
                fontSize: '11px',
                color: '#E0E0E0',
                marginBottom: '24px',
                lineHeight: 1.7,
            }}>
                Optional. Helps calibrate scoring to your specific situation.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
            }}>

                {/* TARGET ROLE */}
                <div>
                    <span style={label}>TARGET JOB ROLE</span>
                    <div ref={roleRef} style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="e.g. Prompt Engineer"
                            value={roleQuery || selectedRole}
                            style={inputStyle}
                            onChange={e => {
                                setRoleQuery(e.target.value);
                                setSelectedRole("");
                                onTargetRoleChange("");
                                setRoleDropdownOpen(true);
                            }}
                            onFocus={() => setRoleDropdownOpen(true)}
                        />
                        {roleDropdownOpen && filteredTitles.length > 0 && (
                            <div style={dropdownStyle}>
                                {filteredTitles.map(title => (
                                    <div
                                        key={title}
                                        style={optionStyle}
                                        onMouseEnter={e => {
                                            (e.target as HTMLDivElement).style.color = '#FFFFFF';
                                            (e.target as HTMLDivElement).style.background = '#3A3A3A';
                                        }}
                                        onMouseLeave={e => {
                                            (e.target as HTMLDivElement).style.color = '#E0E0E0';
                                            (e.target as HTMLDivElement).style.background = 'transparent';
                                        }}
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
                    <span style={label}>YEARS OF EXPERIENCE</span>
                    <div ref={expRef} style={{ position: 'relative' }}>
                        <div
                            style={{
                                ...inputStyle,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                userSelect: 'none',
                            }}
                            onClick={() => setExpDropdownOpen(!expDropdownOpen)}
                        >
                            <span style={{ color: selectedExp === null ? '#E0E0E0' : '#FFFFFF' }}>
                                {selectedExp === null
                                    ? 'Select years'
                                    : EXPERIENCE_OPTIONS.find(o => o.value === selectedExp)?.label ?? 'Select years'}
                            </span>
                            <span style={{ color: '#E0E0E0', fontSize: '10px' }}>▾</span>
                        </div>
                        {expDropdownOpen && (
                            <div style={dropdownStyle}>
                                {EXPERIENCE_OPTIONS.map(opt => (
                                    <div
                                        key={opt.value}
                                        style={optionStyle}
                                        onMouseEnter={e => {
                                            (e.target as HTMLDivElement).style.color = '#FFFFFF';
                                            (e.target as HTMLDivElement).style.background = '#3A3A3A';
                                        }}
                                        onMouseLeave={e => {
                                            (e.target as HTMLDivElement).style.color = '#E0E0E0';
                                            (e.target as HTMLDivElement).style.background = 'transparent';
                                        }}
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
                        <p style={{
                            fontFamily: "inherit",
                            fontSize: '9px',
                            color: '#F59E0B',
                            letterSpacing: '0.08em',
                            marginTop: '8px',
                            lineHeight: 1.7,
                        }}>
                            ⚠ ENTER THE SAME EXPERIENCE AS WRITTEN IN YOUR RESUME FOR ACCURATE RESULTS.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
