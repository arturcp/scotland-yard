import { render } from '@testing-library/react';
import App from './App';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));

test('renders without crashing', () => {
  const { container } = render(<App />);
  expect(container.querySelector('#container')).toBeInTheDocument();
});
