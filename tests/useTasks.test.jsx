import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTasks } from '../src/hooks/useTasks.js';

const json = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

let fetchMock;
beforeEach(() => {
  fetchMock = vi.fn(() => json(200, { tasks: [], errors: [], sources: [], generatedAt: '2026-10-25T00:00:00Z' }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('useTasks', () => {
  it('fetches again with query parameters whenever filters change', async () => {
    const { result, rerender } = renderHook(({ filters }) => useTasks(filters), { initialProps: { filters: { employee: '', status: '' } } });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3001/api/tasks');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });

    rerender({ filters: { employee: '3', status: 'open' } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:3001/api/tasks?employee=3&status=open');
  });

  it('keeps partial-error data from a 200 response', async () => {
    fetchMock.mockImplementation(() => json(200, { tasks: [{ taskKey: 'a' }], errors: [{ source: 'crm', message: 'down' }], sources: [] }));
    const { result } = renderHook(() => useTasks({ employee: '', status: '' }));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.errors).toEqual([{ source: 'crm', message: 'down' }]);
  });

  it('shows the full error state on 502 and retries on demand', async () => {
    fetchMock.mockImplementation(() => json(502, { tasks: [], errors: [{ source: 'crm' }, { source: 'helpdesk' }], sources: [] }));
    const { result } = renderHook(() => useTasks({ employee: '', status: '' }));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('None of the task sources could be reached.');
    act(() => result.current.retry());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('reports an unreachable backend', async () => {
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));
    const { result } = renderHook(() => useTasks({ employee: '', status: '' }));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/cannot reach the server/i);
  });

  it('resets filters on 400 and signs out on 401', async () => {
    const onInvalidFilters = vi.fn();
    const onUnauthorized = vi.fn();
    fetchMock.mockImplementationOnce(() => json(400, { error: 'bad status' }));
    const { rerender } = renderHook(({ f }) => useTasks(f, { onInvalidFilters, onUnauthorized }), { initialProps: { f: { employee: '', status: 'x' } } });
    await waitFor(() => expect(onInvalidFilters).toHaveBeenCalledOnce());

    fetchMock.mockImplementationOnce(() => json(401, { error: 'expired' }));
    rerender({ f: { employee: '', status: '' } });
    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledOnce());
  });
});
