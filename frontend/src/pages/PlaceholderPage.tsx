// Placeholder page component — used for sections under construction
import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
      <div className="p-4 rounded-full bg-amber-500/10">
        <Construction className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {description ?? 'This section is being implemented in the next phase.'}
        </p>
      </div>
      <p className="text-xs text-muted-foreground/60 mt-2">
        Phase 2+ feature — backend infrastructure is ready.
      </p>
    </div>
  );
}
