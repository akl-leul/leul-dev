import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  glareEnabled?: boolean;
}

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ children, className, containerClassName, glareEnabled = true }, ref) => {
    const cardRef = React.useRef<HTMLDivElement>(null);
    
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;

      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <div
        ref={ref}
        className={cn("group", containerClassName)}
        style={{ perspective: "1000px" }}
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className={cn(
            "relative rounded-xl border bg-card text-card-foreground shadow-lg transition-shadow duration-300 hover:shadow-2xl",
            className
          )}
        >
          {/* Card content */}
          <div style={{ transform: "translateZ(0)" }}>
            {children}
          </div>

          {/* Glare effect */}
          {glareEnabled && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.15) 0%, transparent 50%)`,
              }}
            />
          )}

          {/* Subtle border glow */}
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
        </motion.div>
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
        <motion.img
          src={src}
          alt={alt || ""}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
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
