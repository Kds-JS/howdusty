import { GithubGraphResponse, Metric, MetricData } from '../base.metric';
import { getWeeksOfContributions, removeDuplicateWeeks } from './helpers';
import { getWeeksOfCreatedRepositories } from './helpers/get-weeks-of-created-repositories';
import {
  ContributionsByRepository,
  CreatedRepositories,
  WeekObject,
} from './types';

export class ActiveContributionWeeksMetric extends Metric<
  ActiveContributionWeeksResult,
  ActiveContributionWeeksData
> {
  buildQuery(username: string): string {
    return `
      activeContributionWeeks: user(login: "${username}") {
        contributionsCollection {
          repositoryContributions(first: 100) {
            nodes {
              occurredAt
              repository {
                licenseInfo {
                  key
                }
                isFork
                isPrivate
              }
            }
          }
          commitContributionsByRepository {
            contributions(first: 100) {
              nodes {
                occurredAt
              }
            }
            repository {
              licenseInfo {
                key
              }
              isFork
              isPrivate
            }
          }
          issueContributionsByRepository {
            contributions(first: 100) {
              nodes {
                occurredAt
              }
            }
            repository {
              licenseInfo {
                key
              }
              isFork
              isPrivate
            }
          }
          pullRequestContributionsByRepository {
            contributions(first: 100) {
              nodes {
                occurredAt
              }
            }
            repository {
              licenseInfo {
                key
              }
              isFork
              isPrivate
            }
          }
        }
      }
    `;
  }

  parseResult(
    result: ActiveContributionWeeksResult,
  ): ActiveContributionWeeksData {
    // Repository
    const repositoryWeeks: WeekObject[] = getWeeksOfCreatedRepositories(
      result.activeContributionWeeks.contributionsCollection
        .repositoryContributions.nodes,
    );

    // Commit
    const commitWeeks: WeekObject[] = getWeeksOfContributions(
      result.activeContributionWeeks.contributionsCollection
        .commitContributionsByRepository,
    );

    // Issue
    const issueWeeks: WeekObject[] = getWeeksOfContributions(
      result.activeContributionWeeks.contributionsCollection
        .issueContributionsByRepository,
    );

    // Pull Request
    const pullRequestWeeks: WeekObject[] = getWeeksOfContributions(
      result.activeContributionWeeks.contributionsCollection
        .pullRequestContributionsByRepository,
    );

    const allWeeks = removeDuplicateWeeks([
      ...repositoryWeeks,
      ...commitWeeks,
      ...issueWeeks,
      ...pullRequestWeeks,
    ]);

    return {
      activeContributionWeeks: allWeeks.length,
    };
  }
}

/**
 * Represents the object returned by the github graphql api.
 */
export interface ActiveContributionWeeksResult extends GithubGraphResponse {
  activeContributionWeeks: {
    contributionsCollection: {
      repositoryContributions: {
        nodes: CreatedRepositories[];
      };
      commitContributionsByRepository: ContributionsByRepository[];
      issueContributionsByRepository: ContributionsByRepository[];
      pullRequestContributionsByRepository: ContributionsByRepository[];
    };
  };
}

/**
 * Represents the data associated with the metric.
 */
export interface ActiveContributionWeeksData extends MetricData {
  activeContributionWeeks: number;
}
