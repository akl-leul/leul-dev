import * as React from "react";
import { cn } from "@/lib/utils";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  glareEnabled?: boolean;
}

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ children, className, containerClassName }, ref) => {
    return (
      <div ref={ref} className={cn("group", containerClassName)}>
        <div
          className={cn(
            "relative rounded-xl border bg-card text-card-foreground shadow-lg",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
Card3D.displayName = "Card3D";

const Card3DHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
Card3DHeader.displayName = "Card3DHeader";

const Card3DTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
Card3DTitle.displayName = "Card3DTitle";

const Card3DDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
Card3DDescription.displayName = "Card3DDescription";

const Card3DContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
Card3DContent.displayName = "Card3DContent";

const Card3DFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
Card3DFooter.displayName = "Card3DFooter";

const Card3DImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { src?: string; alt?: string }>(
  ({ className, src, alt, children, ...props }, ref) => (
    <div ref={ref} className={cn("aspect-video overflow-hidden rounded-t-xl", className)} {...props}>
      {src ? (
        <img src={src} alt={alt || ""} className="h-full w-full object-cover" />
      ) : (
        children || (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            No Image
          </div>
        )
      )}
    </div>
  )
);
Card3DImage.displayName = "Card3DImage";

export { Card3D, Card3DHeader, Card3DFooter, Card3DTitle, Card3DDescription, Card3DContent, Card3DImage };
