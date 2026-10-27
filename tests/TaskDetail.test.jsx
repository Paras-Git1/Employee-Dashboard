import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskDetail } from '../src/components/TaskDetail.jsx';
import { TaskForm } from '../src/components/TaskForm.jsx';

const task = {
  taskKey: 'helpdesk-T-211', source: 'helpdesk', sourceId: 'T-211', title: 'Mobile app crashes', employeeId: 3, employeeName: 'Priya Raman',
  deadline: '2026-10-23T11:31:00.000Z', status: 'open', urgency: 3, context: null, priorityScore: 80, priorityLabel: 'critical',
  url: 'http://localhost:4002/helpdesk/tickets/T-211',
};

describe('TaskDetail panel', () => {
  it('shows the details and a safe link to the source app', () => {
    render(<TaskDetail task={task} onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Mobile app crashes' })).toBeInTheDocument();
    expect(screen.getByText('Priya Raman')).toBeInTheDocument();
    expect(screen.getByText('High (3 of 4)')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /open in helpdesk/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('lets the viewer pick a status when allowed, and closes on Escape', async () => {
    const onStatusChange = vi.fn();
    const onClose = vi.fn();
    render(<TaskDetail task={task} actions={{ onStatusChange }} onClose={onClose} />);
    expect(screen.getByRole('button', { name: /to do/i })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: /working on it/i }));
    expect(onStatusChange).toHaveBeenCalledWith(task, 'in_progress');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('editing sends only changed fields', () => {
  it('does not overwrite a status that someone else changed meanwhile', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const employees = [{ id: 3, name: 'Priya Raman', role: 'Support' }, { id: 5, name: 'Sofia Lindqvist', role: 'IT' }];
    render(<TaskForm task={task} employees={employees} onSubmit={onSubmit} onClose={() => {}} />);
    await userEvent.selectOptions(screen.getByLabelText('Assign to'), '5');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledWith({ employeeId: 5 });
  });

  it('closes without a request when nothing changed', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<TaskForm task={task} employees={[{ id: 3, name: 'Priya Raman', role: 'Support' }]} onSubmit={onSubmit} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
