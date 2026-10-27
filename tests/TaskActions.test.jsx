import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { describeEvent } from '../src/components/Dashboard.jsx';
import { TaskCard } from '../src/components/TaskCard.jsx';
import { TaskForm } from '../src/components/TaskForm.jsx';

const task = {
  taskKey: 'crm-C-101', source: 'crm', sourceId: 'C-101', title: 'Send renewal quote', employeeId: 2, employeeName: 'Daniel Okafor',
  deadline: new Date(Date.now() + 86400_000 * 2).toISOString(), status: 'open', urgency: null, context: 'Northwind',
  priorityScore: 40, priorityLabel: 'medium', url: 'http://localhost:4001/crm/tasks/C-101',
};
const employees = [{ id: 2, name: 'Daniel Okafor', role: 'Account Executive' }, { id: 3, name: 'Priya Raman', role: 'Support Engineer' }];

describe('TaskCard actions', () => {
  it('shows no controls when the viewer has no rights', () => {
    render(<TaskCard task={task} now={new Date()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('lets the owner mark the task completed and change status with clear words', async () => {
    const onStatusChange = vi.fn();
    render(<TaskCard task={task} now={new Date()} actions={{ onStatusChange }} />);
    await userEvent.click(screen.getByRole('button', { name: /mark "send renewal quote" as completed/i }));
    expect(onStatusChange).toHaveBeenCalledWith(task, 'done');
    const select = screen.getByRole('combobox', { name: /status of/i });
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['To do', 'Working on it', 'Completed']);
    await userEvent.selectOptions(select, 'in_progress');
    expect(onStatusChange).toHaveBeenLastCalledWith(task, 'in_progress');
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('lets a completed task be marked not completed again', async () => {
    const onStatusChange = vi.fn();
    render(<TaskCard task={{ ...task, status: 'done' }} now={new Date()} actions={{ onStatusChange }} />);
    await userEvent.click(screen.getByRole('button', { name: /as not completed/i }));
    expect(onStatusChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'done' }), 'open');
  });

  it('gives admins edit and delete', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TaskCard task={task} now={new Date()} actions={{ onStatusChange: vi.fn(), onEdit, onDelete }} />);
    await userEvent.click(screen.getByRole('button', { name: /edit "send renewal quote"/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete "send renewal quote"/i }));
    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onDelete).toHaveBeenCalledWith(task);
  });
});

describe('TaskForm', () => {
  it('creates a helpdesk ticket with the chosen assignee', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    render(<TaskForm employees={employees} onSubmit={onSubmit} onClose={() => {}} />);
    await userEvent.type(screen.getByLabelText('Title'), 'Reset VPN tokens');
    await userEvent.selectOptions(screen.getByLabelText('Assign to'), '3');
    await userEvent.selectOptions(screen.getByLabelText('Urgency'), '4');
    await userEvent.click(screen.getByRole('button', { name: 'Create task' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      source: 'helpdesk', title: 'Reset VPN tokens', employeeId: 3, urgency: 4, status: 'open', deadline: expect.any(String),
    }));
  });

  it('requires an assignee and shows server errors', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Selected employee does not exist.'));
    render(<TaskForm employees={employees} onSubmit={onSubmit} onClose={() => {}} />);
    await userEvent.type(screen.getByLabelText('Title'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Create task' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose who the task is assigned to.');
    await userEvent.selectOptions(screen.getByLabelText('Assign to'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Create task' }));
    expect(await screen.findByText('Selected employee does not exist.')).toBeInTheDocument();
  });

  it('edits a CRM task without allowing the system to change', () => {
    render(<TaskForm task={task} employees={employees} onSubmit={vi.fn()} onClose={() => {}} />);
    expect(screen.getByRole('radio', { name: 'CRM task' })).toBeDisabled();
    expect(screen.getByLabelText('Account (optional)')).toHaveValue('Northwind');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });
});

describe('describeEvent', () => {
  const done = { type: 'updated', actorName: 'Priya Raman', previousStatus: 'in_progress', task: { title: 'VPN', status: 'done', employeeId: 3 } };
  it('tells managers when someone completes a task', () => {
    expect(describeEvent(done, { isManager: true, userId: 1 })).toBe('Priya Raman completed "VPN"');
  });
  it('tells employees about new assignments', () => {
    expect(describeEvent({ type: 'created', actorName: 'Amira', task: { title: 'Report', employeeId: 3 } }, { isManager: false, userId: 3 }))
      .toBe('New task assigned to you: "Report"');
  });
});
