import React from "react";
import Link from "next/link";
import { getProjectInvestigationDossier } from "../../../../backend/api/services/investigationService.ts";
import { PageContainer } from "@/components/ui/PageContainer";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { ProjectInvestigationClient } from "./ProjectInvestigationClient";
import { FileX, ArrowLeft } from "lucide-react";

interface ProjectInvestigationPageProps {
  params: {
    projectCode: string;
  };
}

export default async function ProjectInvestigationPage({ params }: ProjectInvestigationPageProps) {
  const resolvedParams = await params;
  const projectCode = resolvedParams?.projectCode;

  if (!projectCode) {
    return (
      <PageContainer title="Investigation Workspace" subtitle="Project Dossier Search">
        <div className="py-12">
          <EmptyState
            icon={<FileX className="w-8 h-8 text-amber-400" />}
            title="Project Identifier Required"
            description="No valid project code was specified in the request URL."
          />
        </div>
      </PageContainer>
    );
  }

  const dossier = getProjectInvestigationDossier(projectCode);

  if (!dossier) {
    return (
      <PageContainer title="Investigation Workspace" subtitle="Project Dossier Search">
        <div className="py-12">
          <EmptyState
            icon={<FileX className="w-8 h-8 text-amber-400" />}
            title="Project Investigation Not Found"
            description={`No audit investigation dossier exists for project code "${projectCode}" in the dataset.`}
          />
          <div className="flex justify-center mt-4">
            <Link href="/projects">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Project Explorer
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return <ProjectInvestigationClient initialData={dossier} />;
}
