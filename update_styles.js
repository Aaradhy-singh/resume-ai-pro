const fs = require('fs');

const files = [
    'src/pages/Results.tsx',
    'src/pages/CareerExplorer.tsx',
    'src/pages/ActionPlan.tsx',
    'src/components/action-plan/ActionCategoryCard.tsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/border-white\/10/g, 'border-white/20');
        content = content.replace(/border-\[\#1a1a1a\]/g, 'border-[#333333]');
        content = content.replace(/border-\[\#1A1A1A\]/g, 'border-[#333333]');
        content = content.replace(/border-\[\#222222\]/g, 'border-[#444444]');
        content = content.replace(/1px solid #1a1a1a/g, '1px solid #333333');
        content = content.replace(/1px solid #1A1A1A/g, '1px solid #333333');
        content = content.replace(/2px solid #1a1a1a/g, '2px solid #333333');
        content = content.replace(/2px solid #1A1A1A/g, '2px solid #333333');
        content = content.replace(/1px solid #222222/g, '1px solid #444444');

        content = content.replace(/text-\[9px\]/g, 'text-[11px]');
        content = content.replace(/text-\[10px\]/g, 'text-[12px]');
        content = content.replace(/text-\[11px\]/g, 'text-[13px]');
        content = content.replace(/text-\[12px\]/g, 'text-[14px]');
        content = content.replace(/text-\[13px\]/g, 'text-[15px]');

        content = content.replace(/fontSize:\s*'9px'/g, "fontSize: '11px'");
        content = content.replace(/fontSize:\s*'10px'/g, "fontSize: '12px'");
        content = content.replace(/fontSize:\s*'11px'/g, "fontSize: '13px'");
        content = content.replace(/fontSize:\s*'12px'/g, "fontSize: '14px'");
        content = content.replace(/fontSize:\s*'13px'/g, "fontSize: '15px'");
        content = content.replace(/fontSize:\s*"9px"/g, 'fontSize: "11px"');
        content = content.replace(/fontSize:\s*"10px"/g, 'fontSize: "12px"');
        content = content.replace(/fontSize:\s*"11px"/g, 'fontSize: "13px"');
        content = content.replace(/fontSize:\s*"12px"/g, 'fontSize: "14px"');
        content = content.replace(/fontSize:\s*"13px"/g, 'fontSize: "15px"');

        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
