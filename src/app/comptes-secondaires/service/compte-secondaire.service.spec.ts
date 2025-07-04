import { TestBed } from '@angular/core/testing';

import { CompteSecondaireService } from './compte-secondaire.service';

describe('CompteSecondaireService', () => {
  let service: CompteSecondaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompteSecondaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
