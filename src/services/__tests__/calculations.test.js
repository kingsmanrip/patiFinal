/**
 * Tests for break time calculation logic
 */

import { calculateBreakDeduction } from '../timesheetService';

describe('Break Time Calculations', () => {
  test('breaks less than or equal to 30 minutes should have no deduction', () => {
    expect(calculateBreakDeduction(0)).toBe(0);
    expect(calculateBreakDeduction(15)).toBe(0);
    expect(calculateBreakDeduction(30)).toBe(0);
  });
  
  test('breaks between 31 and 60 minutes should have 30 minute deduction', () => {
    expect(calculateBreakDeduction(31)).toBe(30);
    expect(calculateBreakDeduction(45)).toBe(30);
    expect(calculateBreakDeduction(60)).toBe(30);
  });
  
  test('breaks over 60 minutes should have full deduction', () => {
    expect(calculateBreakDeduction(61)).toBe(61);
    expect(calculateBreakDeduction(90)).toBe(90);
    expect(calculateBreakDeduction(120)).toBe(120);
  });
});
