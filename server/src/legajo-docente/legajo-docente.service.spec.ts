import { Test, TestingModule } from '@nestjs/testing';
import { LegajoDocenteService } from './legajo-docente.service';

describe('LegajoDocenteService', () => {
  let service: LegajoDocenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegajoDocenteService],
    }).compile();

    service = module.get<LegajoDocenteService>(LegajoDocenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
