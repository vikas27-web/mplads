"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ProjectFilterParams, ProjectListResponse } from "@/types/project";
import { getProjects } from "@/lib/api/projectsProvider";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import { ProjectExplorerHeader } from "@/components/projects/ProjectExplorerHeader";
import { ProjectFilterControls } from "@/components/projects/ProjectFilterControls";
import { ProjectTable } from "@/components/projects/ProjectTable";
import { ProjectPagination } from "@/components/projects/ProjectPagination";

import { ResponsibleAiBanner } from "@/components/ui/ResponsibleAiBanner";

const DEFAULT_PARAMS: ProjectFilterParams = {
  search: "",
  state: "ALL",
  district: "ALL",
  sector: "ALL",
  severity: "ALL",
  signalType: "ALL",
  status: "ALL",
  sortBy: "projectCode",
  sortOrder: "asc",
  page: 1,
  limit: 10,
};

export default function ProjectsPage() {
  const [params, setParams] = useState<ProjectFilterParams>(DEFAULT_PARAMS);
  const [response, setResponse] = useState<ProjectListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (currentParams: ProjectFilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getProjects(currentParams);
      if (res.success && res.data) {
        setResponse(res.data);
      } else {
        setError(res.error?.message || "Failed to retrieve project catalog.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(params);
  }, [params, fetchProjects]);

  const handleParamChange = (updated: Partial<ProjectFilterParams>) => {
    setParams((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setParams(DEFAULT_PARAMS);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <ProjectExplorerHeader totalCount={response?.totalCount || 0} />

      {/* Responsible AI Banner */}
      <ResponsibleAiBanner />

      {/* 2. Search & Filter Controls */}
      <ProjectFilterControls
        params={params}
        onChange={handleParamChange}
        onReset={handleResetFilters}
        availableStates={response?.availableStates || []}
        availableDistricts={response?.availableDistricts || []}
        availableSectors={response?.availableSectors || []}
        availableStatuses={response?.availableStatuses || []}
        availableSignalTypes={response?.availableSignalTypes || []}
      />

      {/* 3. Main Data Table or State View */}
      {isLoading ? (
        <div className="py-12">
          <LoadingState title="Querying Project Explorer..." description="Fetching MPLAD scheme work recommendations and anomaly signals." />
        </div>
      ) : error ? (
        <div className="py-12">
          <ErrorState title="Unable to Load Projects" description={error} onRetry={() => fetchProjects(params)} />
        </div>
      ) : !response || response.projects.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title="No Matching Projects Found"
            description="No MPLAD scheme recommendations match your specified search or filter criteria."
            action={{
              label: "Reset All Filters",
              onClick: handleResetFilters,
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <ProjectTable projects={response.projects} />
          <ProjectPagination
            page={response.page}
            totalPages={response.totalPages}
            limit={response.limit}
            totalCount={response.totalCount}
            onPageChange={(p) => handleParamChange({ page: p })}
            onLimitChange={(l) => handleParamChange({ limit: l, page: 1 })}
          />
        </div>
      )}
    </div>
  );
}
