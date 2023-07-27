import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Contributor,
  ContributorFactory,
  ContributorsRepositoryMock,
} from '@/contributors';
import { SynchronizationService } from './synchronization.service';
import { faker } from '@faker-js/faker';
import { SynchronizationTestingModule } from '@/synchronization/synchronization.testing-module';
import { Metrics } from '@/metrics';
import { MetricsRepositoryMock } from '@/metrics/metrics.repository.mocks';

describe('SynchronizationService', () => {
  let synchronization: SynchronizationService;
  let contributorsRepository: ContributorsRepositoryMock;
  let metricsRepository: MetricsRepositoryMock;

  const CONTRIBUTOR_REPOSITORY_TOKEN = getRepositoryToken(Contributor);
  const METRICS_REPOSITORY_TOKEN = getRepositoryToken(Metrics);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SynchronizationTestingModule],
    }).compile();

    synchronization = module.get(SynchronizationService);
    contributorsRepository = module.get(CONTRIBUTOR_REPOSITORY_TOKEN);
    metricsRepository = module.get(METRICS_REPOSITORY_TOKEN);
  });

  describe('synchronizeUser', () => {
    it("should add a new contributor if it doesn't exist", async () => {
      expect(contributorsRepository.contributors.length).toBe(0);
      await synchronization.synchronizeUser('username');
      expect(contributorsRepository.contributors.length).toBe(1);
      expect(contributorsRepository.contributors[0]).toStrictEqual({
        id: '7d02e642-ac46-4838-8920-fdc7f6ee9be5',
        username: 'username',
        name: 'Rosemarie Rogahn',
        avatarUrl: 'https://avatars.githubusercontent.com/u/53969213',
      });
    });
    it('should update a contributor if it does exist', async () => {
      faker.seed(42);
      const contributor = ContributorFactory.generate({
        id: '7d02e642-ac46-4838-8920-fdc7f6ee9be5',
        username: 'username',
      });
      contributorsRepository.contributors.push(contributor);
      expect(contributorsRepository.contributors.length).toBe(1);
      await synchronization.synchronizeUser('username');
      expect(contributorsRepository.contributors.length).toBe(1);
      expect(contributorsRepository.contributors[0]).toStrictEqual({
        id: '7d02e642-ac46-4838-8920-fdc7f6ee9be5',
        username: 'username',
        name: 'Rosemarie Rogahn',
        avatarUrl: 'https://avatars.githubusercontent.com/u/53969213',
      });
    });
  });

  describe('synchronizeUsersMetrics', () => {
    it('should update all users metrics', async () => {
      faker.seed(42);
      expect(contributorsRepository.contributors.length).toBe(0);
      await contributorsRepository.save(ContributorFactory.generateMany(3));
      expect(contributorsRepository.contributors.length).toBe(3);
      expect(metricsRepository.contributorsMetrics.length).toBe(0);

      await synchronization.synchronizeUsersMetrics();
      expect(metricsRepository.contributorsMetrics.length).toBe(3);
    });
  });
});
