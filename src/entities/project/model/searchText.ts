import type { Project } from "@/entities/project";
import { joinPlainText } from "@/shared/lib/plainText";

export function getProjectSearchText(project: Project): string {
  const caseNoteText = (project.caseNotes ?? []).flatMap((note) => [
    note.issueTitle,
    note.issueTitleHtml,
    note.problem,
    note.problemHtml,
    note.approach,
    note.approachHtml,
    note.result,
    note.resultHtml
  ]);

  const linkText = (project.links ?? []).flatMap((link) => [
    link.label,
    link.href
  ]);

  const mediaText = (project.mediaItems ?? []).flatMap((item) => [
    item.alt,
    item.url
  ]);

  return joinPlainText([
    project.slug,
    project.title,
    project.summary,
    project.year,
    project.role,
    project.company,
    project.stack.join(" "),
    (project.tags ?? []).join(" "),
    project.highlights.join(" "),
    (project.resultItems ?? []).join(" "),
    project.bodyHtml,
    project.bodyBlocks,
    project.thumbnail,
    project.altText,
    project.hoverImage,
    project.mediaUrl,
    project.mediaAlt,
    caseNoteText.join(" "),
    linkText.join(" "),
    mediaText.join(" ")
  ]);
}
