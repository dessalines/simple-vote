import { TestBed, inject } from '@angular/core/testing';

import { PollService } from './poll.service';

describe('PollService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PollService]
    });
  });

  it('should ...', inject([PollService], (service: PollService) => {
    expect(service).toBeTruthy();
  }));
});
