import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkFootnotes from 'remark-footnotes';
import remarkDirective from 'remark-directive';
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { Mermaid } from "./Mermaid";
import { CodeBlock, EnhancedCodeBlock } from "./CodeBlock";

export function MarkdownRenderer({ content, isDark, collapsedCodeBlocks, toggleCodeBlock }) {
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm, 
        remarkBreaks, 
        remarkMath, 
        [remarkFootnotes, { inlineNotes: true }],
        remarkDirective
      ]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          
          if (language === "mermaid") {
            return <Mermaid chart={String(children).replace(/\n$/, "")} />;
          }

          return !inline && language ? (
            <EnhancedCodeBlock
              language={language}
              code={String(children).replace(/\n$/, "")}
              isDark={isDark}
              collapsedCodeBlocks={collapsedCodeBlocks}
              toggleCodeBlock={toggleCodeBlock}
            />
          ) : (
            <code
              className={cn(
                "px-1 py-0.5 rounded font-mono text-sm",
                inline
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  : "",
                className
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <>{children}</>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 italic text-slate-600 dark:text-slate-400 my-4 py-1">
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg">
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return (
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {children}
            </thead>
          );
        },
        tbody({ children }) {
          return (
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {children}
            </tbody>
          );
        },
        tr({ children, isHeader }) {
          return (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              {children}
            </tr>
          );
        },
        td({ children }) {
          return (
            <td className="px-4 py-2 whitespace-normal break-words">
              {children}
            </td>
          );
        },
        th({ children }) {
          return (
            <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
              {children}
            </th>
          );
        },
        img({ src, alt }) {
          return (
            <div className="flex flex-col items-center my-4">
              <div className="relative max-w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img 
                  src={src} 
                  alt={alt} 
                  className="max-w-full h-auto rounded-lg" 
                  loading="lazy"
                />
              </div>
              {alt && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center italic">
                  {alt}
                </p>
              )}
            </div>
          );
        },
        ul({ children, ordered, depth, ...props }) {
          const listClass = depth > 0 
            ? "list-disc pl-4 space-y-1 my-1" 
            : "list-disc pl-6 space-y-1 my-2";
            
          return (
            <ul className={listClass} {...props}>
              {children}
            </ul>
          );
        },
        ol({ children, ordered, depth, ...props }) {
          const listClass = depth > 0 
            ? "list-decimal pl-4 space-y-1 my-1" 
            : "list-decimal pl-6 space-y-1 my-2";
            
          return (
            <ol className={listClass} {...props}>
              {children}
            </ol>
          );
        },
        li({ children, ordered, checked, ...props }) {
          // Handle task lists (items with checkboxes)
          if (checked !== null && checked !== undefined) {
            return (
              <li className="flex items-start pl-1 py-0.5" {...props}>
                <span className="flex items-center mr-2 mt-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="rounded border-slate-300 dark:border-slate-700 
                              text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500"
                  />
                </span>
                <span className={checked ? "line-through text-slate-500 dark:text-slate-400" : ""}>
                  {children}
                </span>
              </li>
            );
          }
          
          return (
            <li className="pl-1 py-0.5" {...props}>
              {children}
            </li>
          );
        },
        input({ type, checked }) {
          if (type === 'checkbox') {
            return null; // We handle this in the li component for better styling
          }
          return <input type={type} readOnly />;
        },
        a({ node, href, children, ...props }) {
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              {...props}
            >
              {children}
            </a>
          );
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100 border-b pb-1 border-slate-200 dark:border-slate-800">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100 border-b pb-1 border-slate-200 dark:border-slate-800">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold mt-5 mb-2 text-slate-900 dark:text-slate-100">{children}</h3>;
        },
        h4({ children }) {
          return <h4 className="text-base font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100">{children}</h4>;
        },
        h5({ children }) {
          return <h5 className="text-sm font-bold mt-4 mb-1 text-slate-900 dark:text-slate-100">{children}</h5>;
        },
        h6({ children }) {
          return <h6 className="text-xs font-bold mt-4 mb-1 text-slate-900 dark:text-slate-100">{children}</h6>;
        },
        p({ children }) {
          return <p className="my-2 text-slate-700 dark:text-slate-300">{children}</p>;
        },
        hr() {
          return <hr className="my-4 border-t border-slate-200 dark:border-slate-800" />;
        },
        strong({ children }) {
          return <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic text-slate-800 dark:text-slate-200">{children}</em>;
        },
        del({ children }) {
          return <del className="line-through text-slate-600 dark:text-slate-400">{children}</del>;
        },
        footnoteDefinition({ children, identifier }) {
          return (
            <div id={`footnote-${identifier}`} className="text-sm mt-1 pt-1 border-t border-slate-200 dark:border-slate-800">
              <sup className="mr-1 text-indigo-600 dark:text-indigo-400">{identifier}</sup>
              {children}
            </div>
          );
        },
        footnoteReference({ identifier }) {
          return (
            <sup className="text-xs">
              <a href={`#footnote-${identifier}`} className="text-indigo-600 dark:text-indigo-400">
                {identifier}
              </a>
            </sup>
          );
        },
        dl({ children }) {
          return <dl className="my-4 space-y-4">{children}</dl>;
        },
        dt({ children }) {
          return <dt className="font-bold text-slate-900 dark:text-white">{children}</dt>;
        },
        dd({ children }) {
          return <dd className="pl-4 text-slate-700 dark:text-slate-300">{children}</dd>;
        },
        math({ value }) {
          return (
            <div className="flex justify-center py-2 text-slate-900 dark:text-slate-100 overflow-x-auto my-4">
              {value}
            </div>
          );
        },
        inlineMath({ value }) {
          return (
            <span className="text-slate-900 dark:text-slate-100">
              {value}
            </span>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
