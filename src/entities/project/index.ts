import data from "./data/projects.json";
import type { Project } from "./model/types";
import { parseProjects } from "./model/guards";
import {
  allTags as selectAllTags,
  findProjectBySlug,
  publicProjects as selectPublicProjects
} from "./model/selectors";

export type {
  Project,
  ProjectBlock,
  ProjectCaseNote,
  ProjectLink,
  ProjectMediaItem,
  ProjectStatus
} from "./model/types";

export const projects: Project[] = parseProjects(data, "bundled project data");

export function getProject(slug: string, list: Project[] = projects) {
  return findProjectBySlug(list, slug);
}

export function publicProjects(list: Project[] = projects): Project[] {
  return selectPublicProjects(list);
}

export function allTags(list: Project[] = projects): string[] {
  return selectAllTags(list);
}
