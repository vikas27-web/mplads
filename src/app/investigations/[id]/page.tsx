import React from "react";
import Link from "next/link";
import { getProjectInvestigation } from "@/lib/api/projectInvestigationProvider";
import { getInvestigations } from "@/lib/api-client";
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
  let targetCode = params.id;

  // Handle case prefix
  if (targetCode.startsWith("case-")) {
    targetCode = targetCode.replace("case-", "");
  } else if (/^\d+$/.test(targetCode)) {
    // Numeric index lookup from prioritized investigations
    const allInvRes = await getInvestigations();
    const idx = parseInt(targetCode, 10) - 1;
    if (allInvRes.success && allInvRes.data && idx >= 0 && idx < allInvRes.data.investigations.length) {
      targetCode = allInvRes.data.investigations[idx].projectCode;
    }
  }

  const res = await getProjectInvestigation(targetCode);

  if (!res.success || !res.data) {
    return (
      <PageContainer title="Investigation Dossier" subtitle="Audit Case Review">
        <div className="py-12">
          <EmptyState
            icon={<FileX className="w-8 h-8 text-amber-400" />}
            title="Investigation Case Dossier Not Found"
            description={`No audit investigation dossier exists for case identifier "${params.id}".`}
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

  return <ProjectInvestigationClient initialData={res.data} />;
}
