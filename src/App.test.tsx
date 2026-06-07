import { render } from '@testing-library/react';
import App from './App';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));

test('renders home page', () => {
  const { getByText } = render(<App />);
  expect(
    getByText(/Londres está novamente à procura de Mr\. X/),
  ).toBeInTheDocument();
});
