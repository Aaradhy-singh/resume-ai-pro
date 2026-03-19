import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, GitCompare } from "lucide-react";
import type { Occupation } from "@/lib/occupation-types";

interface RoleComparisonViewProps {
  roles: Occupation[];
  onRemoveRole: (id: string) => void;
}

const formatINR = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export function RoleComparisonView({ roles, onRemoveRole }: RoleComparisonViewProps) {
  if (roles.length < 2) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GitCompare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Select at least 2 roles to compare</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click "Compare" on role cards in the Browse tab to add them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Collect all unique skills
  const allCoreSkills = [...new Set(roles.flatMap((r) => r.coreSkills))];
  const allTools = [...new Set(roles.flatMap((r) => r.tools))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-primary" />
          Role Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Attribute</TableHead>
              {roles.map((role) => (
                <TableHead key={role.id} className="min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{role.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => onRemoveRole(role.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Level</TableCell>
              {roles.map((r) => (
                <TableCell key={r.id}>
                  <Badge variant="outline" className="text-xs capitalize">{r.level}</Badge>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Demand</TableCell>
              {roles.map((r) => (
                <TableCell key={r.id}>
                  <Badge variant="outline" className="text-xs capitalize">{r.demandLevel.replace("-", " ")}</Badge>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Salary Range</TableCell>
              {roles.map((r) => (
                <TableCell key={r.id} className="text-sm">
                  {formatINR(r.salaryBand.min)} – {formatINR(r.salaryBand.max)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Core Skills</TableCell>
              {roles.map((r) => (
                <TableCell key={r.id}>
                  <div className="flex flex-wrap gap-1">
                    {allCoreSkills.map((skill) => {
                      const hasSkill = r.coreSkills.includes(skill);
                      return hasSkill ? (
                        <Badge key={skill} className="bg-primary/10 text-primary border-primary/20 border text-[10px] px-1.5 py-0">
                          {skill}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Tools</TableCell>
              {roles.map((r) => (
                <TableCell key={r.id}>
                  <div className="flex flex-wrap gap-1">
                    {allTools.map((tool) => {
                      const hasTool = r.tools.includes(tool);
                      return hasTool ? (
                        <Badge key={tool} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tool}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Education</TableCell>
              {roles.map((r) => (
                <TableCell key={r.id}>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {r.educationPaths.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Career Path</TableCell>
              {roles.map((r) => (
                <TableCell key={r.id}>
                  <p className="text-xs text-muted-foreground">{r.careerProgression.join(" → ")}</p>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
