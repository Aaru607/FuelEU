import { BankSurplusUseCase } from '../BankSurplusUseCase';
import { IBankRepository, IComplianceRepository } from '../../ports';

describe('BankSurplusUseCase', () => {
  let useCase: BankSurplusUseCase;
  let mockBankRepository: jest.Mocked<IBankRepository>;
  let mockComplianceRepository: jest.Mocked<IComplianceRepository>;

  beforeEach(() => {
    mockBankRepository = {
      saveBankEntry: jest.fn(),
      getTotalBanked: jest.fn(),
    };
    mockComplianceRepository = {
      saveComplianceBalance: jest.fn(),
      getComplianceBalance: jest.fn(),
    };
    useCase = new BankSurplusUseCase(
      mockBankRepository,
      mockComplianceRepository
    );
  });

  it('successfully banks surplus with positive CB', async () => {
    mockBankRepository.getTotalBanked.mockResolvedValueOnce(100); // 100 already banked

    const result = await useCase.execute({
      routeId: 'route-1',
      fuelConsumption: 2.0,
      actualIntensity: 80, // lower than target
      amountToBan: 50,
      period: '2025',
    });

    expect(result.success).toBe(true);
    expect(mockBankRepository.saveBankEntry).toHaveBeenCalledWith(
      'route-1',
      50,
      '2025'
    );
    expect(mockComplianceRepository.saveComplianceBalance).toHaveBeenCalled();
  });

  it('fails when CB <= 0 (no surplus)', async () => {
    mockBankRepository.getTotalBanked.mockResolvedValueOnce(0);

    const result = await useCase.execute({
      routeId: 'route-1',
      fuelConsumption: 2.0,
      actualIntensity: 100, // higher than target
      amountToBan: 10,
      period: '2025',
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/positive/i);
  });

  it('fails when bank amount exceeds available surplus', async () => {
    mockBankRepository.getTotalBanked.mockResolvedValueOnce(50);

    const result = await useCase.execute({
      routeId: 'route-1',
      fuelConsumption: 1.0,
      actualIntensity: 80,
      amountToBan: 200, // exceeds available
      period: '2025',
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/exceeds available/i);
  });
});
