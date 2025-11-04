interface StepBreadcrumbProps {
  number: string;
  title: string;
  active: boolean;
  completed: boolean;
}

export function StepBreadcrumb({ number, title, active, completed }: StepBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`text-xs font-mono ${
          completed ? 'text-green-500' : active ? 'text-accent' : 'text-gray-600'
        }`}
      >
        [{number}]
      </div>
      <div
        className={`text-xs uppercase tracking-[0.2em] font-mono ${
          active ? 'text-white' : completed ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {title}
      </div>
    </div>
  );
}
