import { render, screen } from '@testing-library/react';
import App from './App';

// Basic smoke test
test('renders without crashing', () => {
  render(<App />);
  
  // Title should be in the document
  const titleElement = screen.getByText(/Painter Timesheet Login/i);
  expect(titleElement).toBeInTheDocument();
});
