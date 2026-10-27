import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBanner } from '../src/components/ErrorBanner.jsx';
import { TaskList } from '../src/components/TaskList.jsx';

const task = {
  taskKey: 'helpdesk-T-204', source: 'helpdesk', sourceId: 'T-204', title: 'VPN access failing',
  employeeId: 5, employeeName: 'Sofia Lindqvist', deadline: new Date(Date.now() + 3600_000).toISOString(),
  status: 'open', urgency: 4, context: null, priorityScore: 80, priorityLabel: 'critical',
  url: 'http://localhost:4002/helpdesk/tickets/T-204',
};

describe('TaskList', () => {
  it('shows a loading state', () => {
    render(<TaskList status="loading" tasks={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading tasks');
  });

  it('shows an empty state', () => {
    render(<TaskList status="ready" tasks={[]} filtered />);
    expect(screen.getByText('No tasks match these filters')).toBeInTheDocument();
  });

  it('shows a full error state with a working retry button', async () => {
    const onRetry = vi.fn();
    render(<TaskList status="error" tasks={[]} error="None of the task sources could be reached." onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('None of the task sources could be reached.');
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders cards with source, priority label (text, not just colour) and a safe external link', () => {
    render(<TaskList status="ready" tasks={[task]} showAssignee />);
    expect(screen.getByRole('heading', { name: 'VPN access failing' })).toBeInTheDocument();
    expect(screen.getByText('Helpdesk')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Sofia Lindqvist')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /open in helpdesk/i });
    expect(link).toHaveAttribute('href', task.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('ErrorBanner', () => {
  it('renders nothing without errors', () => {
    const { container } = render(<ErrorBanner errors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('names the failed source', () => {
    render(<ErrorBanner errors={[{ source: 'crm', message: 'CRM service timed out after 3000 ms' }]} />);
    expect(screen.getByRole('status')).toHaveTextContent('CRM unavailable, showing partial data.');
    expect(screen.getByText('CRM service timed out after 3000 ms')).toBeInTheDocument();
  });
});
