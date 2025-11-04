import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession, authClient } from '@/lib/auth-client';
import { appClient } from '@/lib/app-client';
import { useState } from 'react';
import { OrganizationStep } from '@/components/onboarding/organization-step';
import { ProjectStep } from '@/components/onboarding/project-step';
import { IntegrateStep } from '@/components/onboarding/integrate-step';
import { StepBreadcrumb } from '@/components/onboarding/step-breadcrumb';
import { toast } from '@/components/ui/toast';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

type Step = 1 | 2 | 3;

function OnboardingPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName.trim()) return;

    setIsCreating(true);

    try {
      const slug = organizationName.toLowerCase().replace(/\s+/g, '-');

      const { data, error } = await authClient.organization.create({
        name: organizationName,
        slug: slug,
      });

      if (error) {
        console.error('Failed to create organization:', error);

        if (error.code === 'ORGANIZATION_ALREADY_EXISTS') {
          toast.error(
            'An organization with this name already exists. Please choose a different name.'
          );
        } else {
          toast.error(error.message || 'Failed to create organization. Please try again.');
        }
        return;
      }

      if (data) {
        setOrganizationId(data.id);
        setOrganizationSlug(slug);
        toast.success('Organization created successfully!');
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !organizationId) return;

    setIsCreating(true);

    try {
      const result = await appClient.projects.create({
        name: projectName,
        org_id: organizationId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        setApiKey(result.data.api_key);
        toast.success('Project created successfully!');
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const navigate = useNavigate();

  const handleFinish = () => {
    navigate({
      to: '/$org/telmentary/$projectId/logs',
      params: {
        org: organizationSlug,
        projectId: 'telmentary',
      },
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-auto">
      {/* Breadcrumb Top Bar */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <StepBreadcrumb
              number="01"
              title="Org"
              active={currentStep === 1}
              completed={currentStep > 1}
            />
            <div className="text-gray-700 text-xs">/</div>
            <StepBreadcrumb
              number="02"
              title="Project"
              active={currentStep === 2}
              completed={currentStep > 2}
            />
            <div className="text-gray-700 text-xs">/</div>
            <StepBreadcrumb
              number="03"
              title="Integrate"
              active={currentStep === 3}
              completed={false}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full space-y-8">
          {/* Step 1: Organization Form */}
          {currentStep === 1 && (
            <OrganizationStep
              organizationName={organizationName}
              setOrganizationName={setOrganizationName}
              isCreating={isCreating}
              onSubmit={handleCreateOrganization}
            />
          )}

          {/* Step 2: Project Form */}
          {currentStep === 2 && (
            <ProjectStep
              projectName={projectName}
              setProjectName={setProjectName}
              isCreating={isCreating}
              onSubmit={handleCreateProject}
            />
          )}

          {/* Step 3: Setup Instructions */}
          {currentStep === 3 && <IntegrateStep apiKey={apiKey} onFinish={handleFinish} />}
        </div>
      </main>
    </div>
  );
}
