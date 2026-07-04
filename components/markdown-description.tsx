import ReactMarkdown from "react-markdown"

interface MarkdownDescriptionProps {
  children: string
  className?: string
}

export function MarkdownDescription({ children, className = "" }: MarkdownDescriptionProps) {
  return (
    <div className={`text-muted-foreground leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h2 className="mb-3 mt-5 text-xl font-bold text-foreground first:mt-0">{children}</h2>,
          h2: ({ children }) => <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground first:mt-0">{children}</h3>,
          h3: ({ children }) => <h4 className="mb-2 mt-4 font-semibold text-foreground first:mt-0">{children}</h4>,
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>,
          a: ({ href, children }) => <a href={href} className="text-primary underline underline-offset-2" target="_blank" rel="noreferrer">{children}</a>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
