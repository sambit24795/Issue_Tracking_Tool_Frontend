import { TestBed } from '@angular/core/testing';

import { IssueDashboardService } from './issue-dashboard.service';

describe('IssueDashboardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IssueDashboardService = TestBed.get(IssueDashboardService);
    expect(service).toBeTruthy();
  });
});
