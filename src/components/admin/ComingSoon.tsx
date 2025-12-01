import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Construction className="h-24 w-24 text-muted-foreground" />
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {description || "This feature is currently under development and will be available soon."}
      </p>
    </div>
  );
}
