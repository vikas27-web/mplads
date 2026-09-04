import React from "react";
import Link from "next/link";
import { getInvestigationById } from "../../../../backend/api/services/investigationService.ts";
import { PageContainer } from "@/components/ui/PageContainer";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { ProjectInvestigationClient } from "../../projects/[projectCode]/ProjectInvestigationClient";
import { FileX, ArrowLeft } from "lucide-react";

interface InvestigationDetailPageProps {
  params: {
    id: string;
  };
}

export default async function InvestigationDetailPage({ params }: InvestigationDetailPageProps) {
  const resolvedParams = await params;
  const targetId = resolvedParams?.id;

  if (!targetId) {
    return (
      <PageContainer title="Investigation Dossier" subtitle="Audit Case Review">
        <div className="py-12">
          <EmptyState
            icon={<FileX className="w-8 h-8 text-amber-400" />}
            title="Case Identifier Required"
            description="No valid investigation case ID was specified."
          />
        </div>
      </PageContainer>
    );
  }

  const result = getInvestigationById(targetId);

  if (!result || !result.dossier) {
    return (
      <PageContainer title="Investigation Dossier" subtitle="Audit Case Review">
        <div className="py-12">
          <EmptyState
            icon={<FileX className="w-8 h-8 text-amber-400" />}
            title="Investigation Case Dossier Not Found"
            description={`No audit investigation dossier exists for case identifier "${targetId}".`}
          />
          <div className="flex justify-center mt-4">
            <Link href="/investigations">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Investigations Queue
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return <ProjectInvestigationClient initialData={result.dossier} />;
}
